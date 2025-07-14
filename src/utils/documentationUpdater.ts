/**
 * Documentation Updater - AI Memory System
 * 
 * Automatically updates AI memory files when significant changes occur.
 * This helps maintain context for Augment AI across development sessions.
 */

interface ChangeRecord {
  timestamp: number;
  version: string;
  type: 'component' | 'store' | 'utility' | 'config' | 'style';
  file: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  reasoning: string;
}

interface AIMemoryUpdate {
  lastUpdated: number;
  version: string;
  recentChanges: ChangeRecord[];
  architectureNotes: string[];
  codeQualityMetrics: {
    componentCount: number;
    utilityCount: number;
    storeCount: number;
    testCoverage?: number;
  };
}

class DocumentationUpdater {
  private static instance: DocumentationUpdater;
  private changeHistory: ChangeRecord[] = [];
  private readonly maxHistorySize = 50;

  private constructor() {
    this.loadChangeHistory();
  }

  static getInstance(): DocumentationUpdater {
    if (!DocumentationUpdater.instance) {
      DocumentationUpdater.instance = new DocumentationUpdater();
    }
    return DocumentationUpdater.instance;
  }

  /**
   * Record a significant change for AI memory
   */
  recordChange(change: Omit<ChangeRecord, 'timestamp'>): void {
    const changeRecord: ChangeRecord = {
      ...change,
      timestamp: Date.now(),
    };

    this.changeHistory.unshift(changeRecord);
    
    // Keep only recent changes
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory = this.changeHistory.slice(0, this.maxHistorySize);
    }

    this.saveChangeHistory();
    
    // Auto-update documentation for high-impact changes
    if (change.impact === 'high') {
      this.updateAIMemoryFile();
    }

    if (import.meta.env.DEV) {
      console.log('📝 Change recorded for AI memory:', change.description);
    }
  }

  /**
   * Update AI memory file with recent changes
   */
  private updateAIMemoryFile(): void {
    const recentChanges = this.changeHistory.slice(0, 10);
    const memoryUpdate: AIMemoryUpdate = {
      lastUpdated: Date.now(),
      version: this.getCurrentVersion(),
      recentChanges,
      architectureNotes: this.generateArchitectureNotes(),
      codeQualityMetrics: this.calculateCodeMetrics(),
    };

    // In a real implementation, this would update the AI_MEMORY.md file
    if (import.meta.env.DEV) {
      console.log('🧠 AI Memory updated:', memoryUpdate);
    }
  }

  /**
   * Generate architecture notes based on recent changes
   */
  private generateArchitectureNotes(): string[] {
    const notes: string[] = [];
    const recentChanges = this.changeHistory.slice(0, 20);

    // Analyze component changes
    const componentChanges = recentChanges.filter(c => c.type === 'component');
    if (componentChanges.length > 0) {
      notes.push(`Recent component updates: ${componentChanges.length} components modified`);
    }

    // Analyze store changes
    const storeChanges = recentChanges.filter(c => c.type === 'store');
    if (storeChanges.length > 0) {
      notes.push(`State management updates: ${storeChanges.length} stores modified`);
    }

    // Analyze utility changes
    const utilityChanges = recentChanges.filter(c => c.type === 'utility');
    if (utilityChanges.length > 0) {
      notes.push(`Utility simplifications: ${utilityChanges.length} utilities updated`);
    }

    return notes;
  }

  /**
   * Calculate basic code quality metrics
   */
  private calculateCodeMetrics() {
    // In a real implementation, this would analyze the actual codebase
    return {
      componentCount: 15, // Estimated after simplification
      utilityCount: 5,    // Reduced from ~20
      storeCount: 3,      // Simplified to 3 core stores
    };
  }

  /**
   * Get current version from package.json or environment
   */
  private getCurrentVersion(): string {
    try {
      return import.meta.env.VITE_APP_VERSION || '4.0.0';
    } catch {
      return '4.0.0';
    }
  }

  /**
   * Load change history from localStorage
   */
  private loadChangeHistory(): void {
    try {
      const stored = localStorage.getItem('neurastack_change_history');
      if (stored) {
        this.changeHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load change history:', error);
      this.changeHistory = [];
    }
  }

  /**
   * Save change history to localStorage
   */
  private saveChangeHistory(): void {
    try {
      localStorage.setItem('neurastack_change_history', JSON.stringify(this.changeHistory));
    } catch (error) {
      console.warn('Failed to save change history:', error);
    }
  }

  /**
   * Get recent changes for display or analysis
   */
  getRecentChanges(limit = 10): ChangeRecord[] {
    return this.changeHistory.slice(0, limit);
  }

  /**
   * Generate changelog entry for a version
   */
  generateChangelogEntry(version: string): string {
    const versionChanges = this.changeHistory.filter(c => c.version === version);
    
    if (versionChanges.length === 0) {
      return `## Version ${version}\n**Date:** ${new Date().toISOString().split('T')[0]}\n**Type:** Minor Update\n\nNo significant changes recorded.\n`;
    }

    const highImpact = versionChanges.filter(c => c.impact === 'high');
    const mediumImpact = versionChanges.filter(c => c.impact === 'medium');
    
    let entry = `## Version ${version}\n`;
    entry += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
    entry += `**Type:** ${highImpact.length > 0 ? 'Major Update' : 'Minor Update'}\n\n`;

    if (highImpact.length > 0) {
      entry += `### 🚀 Major Changes\n`;
      highImpact.forEach(change => {
        entry += `- **${change.file}**: ${change.description}\n`;
        entry += `  - *Reasoning*: ${change.reasoning}\n`;
      });
      entry += '\n';
    }

    if (mediumImpact.length > 0) {
      entry += `### 🔧 Improvements\n`;
      mediumImpact.forEach(change => {
        entry += `- **${change.file}**: ${change.description}\n`;
      });
      entry += '\n';
    }

    return entry;
  }

  /**
   * Clear change history (for testing or reset)
   */
  clearHistory(): void {
    this.changeHistory = [];
    localStorage.removeItem('neurastack_change_history');
  }
}

// Export singleton instance
export const documentationUpdater = DocumentationUpdater.getInstance();

// Convenience functions for common change types
export const recordComponentChange = (file: string, description: string, impact: 'low' | 'medium' | 'high' = 'medium', reasoning = '') => {
  documentationUpdater.recordChange({
    type: 'component',
    file,
    description,
    impact,
    reasoning,
    version: documentationUpdater['getCurrentVersion'](),
  });
};

export const recordStoreChange = (file: string, description: string, impact: 'low' | 'medium' | 'high' = 'medium', reasoning = '') => {
  documentationUpdater.recordChange({
    type: 'store',
    file,
    description,
    impact,
    reasoning,
    version: documentationUpdater['getCurrentVersion'](),
  });
};

export const recordUtilityChange = (file: string, description: string, impact: 'low' | 'medium' | 'high' = 'low', reasoning = '') => {
  documentationUpdater.recordChange({
    type: 'utility',
    file,
    description,
    impact,
    reasoning,
    version: documentationUpdater['getCurrentVersion'](),
  });
};

// Development helper
if (import.meta.env.DEV) {
  (window as any).documentationUpdater = documentationUpdater;
}

// Record initial simplification changes
if (import.meta.env.DEV) {
  documentationUpdater.recordChange({
    type: 'utility',
    file: 'Multiple utility files',
    description: 'Removed over-engineered utilities: PerformanceMonitor, animationOptimizer, resourcePreloader, updateManager, and complex cache management',
    impact: 'high',
    reasoning: 'Simplified codebase by removing complex optimizations that added maintenance burden without significant benefit for MVP',
    version: '4.0.0',
  });

  documentationUpdater.recordChange({
    type: 'component',
    file: 'Multiple component files',
    description: 'Removed complex responsive components: ResponsiveLayout, VirtualChatList, PullToRefresh, OptimizedTouchButton',
    impact: 'high',
    reasoning: 'Streamlined component architecture to focus on core functionality with simpler, more maintainable components',
    version: '4.0.0',
  });
}
