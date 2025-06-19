/**
 * Bundle Analysis Utilities
 * 
 * Tools for analyzing bundle size, identifying optimization opportunities,
 * and monitoring bundle performance in production.
 */

interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  largestChunk: string;
  largestChunkSize: number;
  duplicateModules: string[];
  unusedExports: string[];
}

interface ModuleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  chunks: string[];
  dependencies: string[];
}

interface OptimizationSuggestion {
  type: 'code-splitting' | 'tree-shaking' | 'compression' | 'lazy-loading' | 'duplicate-removal';
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedSavings: number;
  module?: string;
}

class BundleAnalyzer {
  private modules: Map<string, ModuleInfo> = new Map();
  private chunks: Map<string, number> = new Map();

  /**
   * Analyze bundle from webpack stats
   */
  public analyzeWebpackStats(stats: any): BundleMetrics {
    this.parseWebpackStats(stats);
    
    const totalSize = Array.from(this.modules.values())
      .reduce((sum, module) => sum + module.size, 0);
    
    const gzippedSize = Array.from(this.modules.values())
      .reduce((sum, module) => sum + module.gzippedSize, 0);
    
    const chunkCount = this.chunks.size;
    
    const largestChunk = Array.from(this.chunks.entries())
      .sort(([, a], [, b]) => b - a)[0];
    
    const duplicateModules = this.findDuplicateModules();
    const unusedExports = this.findUnusedExports();

    return {
      totalSize,
      gzippedSize,
      chunkCount,
      largestChunk: largestChunk?.[0] || '',
      largestChunkSize: largestChunk?.[1] || 0,
      duplicateModules,
      unusedExports,
    };
  }

  /**
   * Parse webpack stats JSON
   */
  private parseWebpackStats(stats: any): void {
    if (!stats.modules) return;

    stats.modules.forEach((module: any) => {
      const moduleInfo: ModuleInfo = {
        name: module.name || module.identifier,
        size: module.size || 0,
        gzippedSize: this.estimateGzippedSize(module.size || 0),
        chunks: module.chunks || [],
        dependencies: module.dependencies || [],
      };

      this.modules.set(moduleInfo.name, moduleInfo);
    });

    if (stats.chunks) {
      stats.chunks.forEach((chunk: any) => {
        this.chunks.set(chunk.name || chunk.id, chunk.size || 0);
      });
    }
  }

  /**
   * Estimate gzipped size (rough approximation)
   */
  private estimateGzippedSize(originalSize: number): number {
    // Rough estimation: gzipped size is typically 20-30% of original
    return Math.round(originalSize * 0.25);
  }

  /**
   * Find duplicate modules across chunks
   */
  private findDuplicateModules(): string[] {
    const moduleChunks = new Map<string, Set<string>>();
    
    this.modules.forEach((module, name) => {
      if (!moduleChunks.has(name)) {
        moduleChunks.set(name, new Set());
      }
      module.chunks.forEach(chunk => {
        moduleChunks.get(name)!.add(chunk);
      });
    });

    return Array.from(moduleChunks.entries())
      .filter(([, chunks]) => chunks.size > 1)
      .map(([name]) => name);
  }

  /**
   * Find potentially unused exports (simplified analysis)
   */
  private findUnusedExports(): string[] {
    // This is a simplified implementation
    // In a real scenario, you'd need more sophisticated analysis
    const potentiallyUnused: string[] = [];
    
    this.modules.forEach((module, name) => {
      if (module.size > 10000 && module.dependencies.length === 0) {
        potentiallyUnused.push(name);
      }
    });

    return potentiallyUnused;
  }

  /**
   * Generate optimization suggestions
   */
  public generateOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Large modules that could benefit from code splitting
    this.modules.forEach((module, name) => {
      if (module.size > 100000) { // 100KB
        suggestions.push({
          type: 'code-splitting',
          description: `Consider code-splitting large module: ${name}`,
          impact: 'high',
          estimatedSavings: module.size * 0.3,
          module: name,
        });
      }
    });

    // Duplicate modules
    const duplicates = this.findDuplicateModules();
    duplicates.forEach(moduleName => {
      const module = this.modules.get(moduleName);
      if (module) {
        suggestions.push({
          type: 'duplicate-removal',
          description: `Remove duplicate module: ${moduleName}`,
          impact: 'medium',
          estimatedSavings: module.size * 0.5,
          module: moduleName,
        });
      }
    });

    // Large chunks that could benefit from splitting
    this.chunks.forEach((size, name) => {
      if (size > 250000) { // 250KB
        suggestions.push({
          type: 'code-splitting',
          description: `Split large chunk: ${name}`,
          impact: 'high',
          estimatedSavings: size * 0.4,
        });
      }
    });

    return suggestions.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  }

  /**
   * Get module breakdown by category
   */
  public getModuleBreakdown(): { [category: string]: number } {
    const breakdown: { [category: string]: number } = {
      'node_modules': 0,
      'src': 0,
      'assets': 0,
      'other': 0,
    };

    this.modules.forEach(module => {
      if (module.name.includes('node_modules')) {
        breakdown['node_modules'] += module.size;
      } else if (module.name.includes('src/')) {
        breakdown['src'] += module.size;
      } else if (module.name.includes('assets/') || module.name.includes('.png') || module.name.includes('.jpg')) {
        breakdown['assets'] += module.size;
      } else {
        breakdown['other'] += module.size;
      }
    });

    return breakdown;
  }

  /**
   * Get top largest modules
   */
  public getTopLargestModules(count: number = 10): ModuleInfo[] {
    return Array.from(this.modules.values())
      .sort((a, b) => b.size - a.size)
      .slice(0, count);
  }

  /**
   * Calculate bundle efficiency score
   */
  public calculateEfficiencyScore(): number {
    const totalSize = Array.from(this.modules.values())
      .reduce((sum, module) => sum + module.size, 0);
    
    const duplicateSize = this.findDuplicateModules()
      .reduce((sum, name) => {
        const module = this.modules.get(name);
        return sum + (module ? module.size : 0);
      }, 0);

    const unusedSize = this.findUnusedExports()
      .reduce((sum, name) => {
        const module = this.modules.get(name);
        return sum + (module ? module.size : 0);
      }, 0);

    const wastedSize = duplicateSize + unusedSize;
    const efficiency = Math.max(0, 100 - (wastedSize / totalSize) * 100);
    
    return Math.round(efficiency);
  }

  /**
   * Generate bundle report
   */
  public generateReport(): {
    metrics: BundleMetrics;
    breakdown: { [category: string]: number };
    topModules: ModuleInfo[];
    suggestions: OptimizationSuggestion[];
    efficiencyScore: number;
  } {
    const metrics = this.analyzeWebpackStats({ modules: Array.from(this.modules.values()) });
    
    return {
      metrics,
      breakdown: this.getModuleBreakdown(),
      topModules: this.getTopLargestModules(),
      suggestions: this.generateOptimizationSuggestions(),
      efficiencyScore: this.calculateEfficiencyScore(),
    };
  }
}

/**
 * Analyze bundle size in runtime
 */
export function analyzeBundleSize(): Promise<{
  estimatedSize: number;
  chunkCount: number;
  loadedModules: string[];
}> {
  return new Promise((resolve) => {
    // Estimate bundle size from loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    let estimatedSize = 0;
    let chunkCount = scripts.length;
    const loadedModules: string[] = [];

    // Get module information if available (webpack specific)
    if (typeof __webpack_require__ !== 'undefined' && __webpack_require__.cache) {
      Object.keys(__webpack_require__.cache).forEach(moduleId => {
        loadedModules.push(moduleId);
      });
    }

    // Estimate size from script tags (rough approximation)
    Promise.all(
      scripts.map(script => 
        fetch(script.src, { method: 'HEAD' })
          .then(response => {
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength, 10) : 0;
          })
          .catch(() => 0)
      )
    ).then(sizes => {
      estimatedSize = sizes.reduce((sum, size) => sum + size, 0);
      resolve({
        estimatedSize,
        chunkCount,
        loadedModules,
      });
    });
  });
}

/**
 * Monitor bundle loading performance
 */
export function monitorBundleLoading(): void {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach(entry => {
      if (entry.name.includes('.js') || entry.name.includes('.css')) {
        const duration = entry.duration;
        const size = (entry as any).transferSize || 0;
        
        console.log(`📦 Bundle loaded: ${entry.name}`, {
          duration: `${duration.toFixed(2)}ms`,
          size: `${(size / 1024).toFixed(2)}KB`,
          type: entry.name.includes('.js') ? 'JavaScript' : 'CSS',
        });

        // Alert for slow loading bundles
        if (duration > 1000) {
          console.warn(`⚠️ Slow bundle loading detected: ${entry.name} took ${duration.toFixed(2)}ms`);
        }

        // Alert for large bundles
        if (size > 250000) {
          console.warn(`⚠️ Large bundle detected: ${entry.name} is ${(size / 1024).toFixed(2)}KB`);
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}

export { BundleAnalyzer };
export type { BundleMetrics, ModuleInfo, OptimizationSuggestion };
