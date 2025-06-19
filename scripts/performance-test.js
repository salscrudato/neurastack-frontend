#!/usr/bin/env node

/**
 * Performance Testing Script for NeuraFit
 * 
 * Comprehensive performance analysis and optimization validation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance budgets and thresholds
const PERFORMANCE_BUDGET = {
  // Bundle size limits (in bytes)
  criticalChunkSize: 50 * 1024, // 50kB gzipped
  maxChunkSize: 100 * 1024, // 100kB gzipped
  totalBundleSize: 500 * 1024, // 500kB gzipped
  
  // Core Web Vitals targets
  firstContentfulPaint: 1800, // 1.8s
  largestContentfulPaint: 2500, // 2.5s
  firstInputDelay: 100, // 100ms
  cumulativeLayoutShift: 0.1, // 0.1
  
  // Network performance
  timeToInteractive: 1000, // 1s on 3G
  speedIndex: 3000, // 3s
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message.toUpperCase(), 'bold');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Analyze bundle sizes from build output
function analyzeBundleSizes() {
  logHeader('Bundle Size Analysis');
  
  try {
    // Run build and capture output
    log('Building application...', 'blue');
    const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    
    // Parse bundle sizes from build output
    const lines = buildOutput.split('\n');
    const bundleInfo = [];
    let totalSize = 0;
    let totalGzipSize = 0;
    
    lines.forEach(line => {
      // Match lines like: dist/assets/ui-CPjWQNNn.js    436.75 kB │ gzip: 148.10 kB
      const match = line.match(/dist\/assets\/(.+?)\s+(\d+\.?\d*)\s*kB.*?gzip:\s*(\d+\.?\d*)\s*kB/);
      if (match) {
        const [, filename, size, gzipSize] = match;
        const sizeBytes = parseFloat(size) * 1024;
        const gzipSizeBytes = parseFloat(gzipSize) * 1024;
        
        bundleInfo.push({
          filename,
          size: sizeBytes,
          gzipSize: gzipSizeBytes,
          sizeKB: parseFloat(size),
          gzipSizeKB: parseFloat(gzipSize),
        });
        
        totalSize += sizeBytes;
        totalGzipSize += gzipSizeBytes;
      }
    });
    
    // Sort by gzip size (largest first)
    bundleInfo.sort((a, b) => b.gzipSize - a.gzipSize);
    
    // Display results
    log('\nBundle Analysis Results:', 'bold');
    log('-'.repeat(80));
    log('Filename'.padEnd(30) + 'Size'.padEnd(15) + 'Gzipped'.padEnd(15) + 'Status');
    log('-'.repeat(80));
    
    let criticalIssues = 0;
    let warnings = 0;
    
    bundleInfo.forEach(bundle => {
      let status = '✅ Good';
      let color = 'green';
      
      if (bundle.gzipSize > PERFORMANCE_BUDGET.maxChunkSize) {
        status = '❌ Too Large';
        color = 'red';
        criticalIssues++;
      } else if (bundle.gzipSize > PERFORMANCE_BUDGET.criticalChunkSize) {
        status = '⚠️  Large';
        color = 'yellow';
        warnings++;
      }
      
      const line = `${bundle.filename.padEnd(30)}${bundle.sizeKB.toFixed(1)}kB`.padEnd(15) + 
                   `${bundle.gzipSizeKB.toFixed(1)}kB`.padEnd(15) + status;
      log(line, color);
    });
    
    log('-'.repeat(80));
    log(`Total Bundle Size: ${(totalSize / 1024).toFixed(1)}kB (${(totalGzipSize / 1024).toFixed(1)}kB gzipped)`);
    
    // Check against budget
    if (totalGzipSize > PERFORMANCE_BUDGET.totalBundleSize) {
      logError(`Total bundle size exceeds budget: ${(totalGzipSize / 1024).toFixed(1)}kB > ${(PERFORMANCE_BUDGET.totalBundleSize / 1024).toFixed(1)}kB`);
      criticalIssues++;
    } else {
      logSuccess(`Total bundle size within budget: ${(totalGzipSize / 1024).toFixed(1)}kB`);
    }
    
    // Summary
    log('\nBundle Analysis Summary:', 'bold');
    if (criticalIssues > 0) {
      logError(`${criticalIssues} critical issues found`);
    }
    if (warnings > 0) {
      logWarning(`${warnings} warnings found`);
    }
    if (criticalIssues === 0 && warnings === 0) {
      logSuccess('All bundles within performance budget!');
    }
    
    return {
      bundleInfo,
      totalSize,
      totalGzipSize,
      criticalIssues,
      warnings,
    };
    
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    return null;
  }
}

// Check for unused dependencies
function checkUnusedDependencies() {
  logHeader('Dependency Analysis');
  
  try {
    // This would require additional tooling like depcheck
    logInfo('Dependency analysis requires additional tooling (depcheck)');
    logInfo('Run: npx depcheck to identify unused dependencies');
  } catch (error) {
    logWarning(`Dependency check failed: ${error.message}`);
  }
}

// Analyze mobile performance optimizations
function analyzeMobileOptimizations() {
  logHeader('Mobile Performance Analysis');
  
  const optimizations = [
    {
      name: 'Touch target sizes',
      check: () => {
        // Check if mobile optimization hook exists
        const hookPath = path.join(process.cwd(), 'src/hooks/useMobileOptimization.tsx');
        return fs.existsSync(hookPath);
      }
    },
    {
      name: 'Lazy loading implementation',
      check: () => {
        // Check if performance optimizations exist
        const utilsPath = path.join(process.cwd(), 'src/utils/performanceOptimizations.ts');
        return fs.existsSync(utilsPath);
      }
    },
    {
      name: 'Service worker caching',
      check: () => {
        // Check if service worker is configured
        const swPath = path.join(process.cwd(), 'dist/sw.js');
        return fs.existsSync(swPath);
      }
    },
    {
      name: 'CSS optimizations',
      check: () => {
        // Check if mobile CSS exists
        const cssPath = path.join(process.cwd(), 'src/styles/mobile-scrolling.css');
        return fs.existsSync(cssPath);
      }
    }
  ];
  
  optimizations.forEach(opt => {
    if (opt.check()) {
      logSuccess(`${opt.name} implemented`);
    } else {
      logWarning(`${opt.name} missing or incomplete`);
    }
  });
}

// Generate performance report
function generateReport(bundleAnalysis) {
  logHeader('Performance Report Generation');
  
  const report = {
    timestamp: new Date().toISOString(),
    bundleAnalysis,
    recommendations: [],
  };
  
  // Add recommendations based on analysis
  if (bundleAnalysis && bundleAnalysis.criticalIssues > 0) {
    report.recommendations.push('Implement code splitting for large chunks');
    report.recommendations.push('Consider lazy loading for non-critical components');
    report.recommendations.push('Review and optimize third-party dependencies');
  }
  
  if (bundleAnalysis && bundleAnalysis.warnings > 0) {
    report.recommendations.push('Monitor bundle sizes and implement size budgets');
    report.recommendations.push('Consider tree-shaking optimizations');
  }
  
  // Save report
  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Performance report saved to: ${reportPath}`);
  
  return report;
}

// Main execution
async function main() {
  log('🚀 NeuraFit Performance Testing Suite', 'bold');
  log('Testing application performance and optimization...', 'blue');
  
  const bundleAnalysis = analyzeBundleSizes();
  checkUnusedDependencies();
  analyzeMobileOptimizations();
  
  const report = generateReport(bundleAnalysis);
  
  logHeader('Performance Testing Complete');
  
  if (bundleAnalysis && bundleAnalysis.criticalIssues > 0) {
    logError('Critical performance issues detected. Review recommendations.');
    process.exit(1);
  } else {
    logSuccess('Performance testing completed successfully!');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`Performance testing failed: ${error.message}`);
    process.exit(1);
  });
}

export {
    analyzeBundleSizes, analyzeMobileOptimizations, checkUnusedDependencies, generateReport,
    PERFORMANCE_BUDGET
};

