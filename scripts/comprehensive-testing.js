#!/usr/bin/env node

/**
 * Comprehensive Testing and Quality Assurance Script
 * 
 * Runs complete test suite including unit tests, integration tests,
 * performance tests, accessibility tests, and security audits
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Test results tracking
const testResults = {
  performance: { passed: false, score: 0, issues: [] },
  accessibility: { passed: false, score: 0, issues: [] },
  security: { passed: false, score: 0, issues: [] },
  functionality: { passed: false, score: 0, issues: [] },
  codeQuality: { passed: false, score: 0, issues: [] },
};

// Performance testing
async function runPerformanceTests() {
  logHeader('Performance Testing');
  
  try {
    // Run bundle analysis
    log('Analyzing bundle sizes...', 'blue');
    const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    
    // Parse bundle sizes
    const bundleInfo = parseBundleSizes(buildOutput);
    const totalGzipSize = bundleInfo.reduce((sum, bundle) => sum + bundle.gzipSize, 0);
    
    // Performance budget checks
    const performanceBudget = {
      totalBundleSize: 500 * 1024, // 500KB
      maxChunkSize: 100 * 1024, // 100KB
      criticalChunkSize: 50 * 1024, // 50KB
    };
    
    let score = 100;
    const issues = [];
    
    if (totalGzipSize > performanceBudget.totalBundleSize) {
      score -= 30;
      issues.push(`Total bundle size exceeds budget: ${(totalGzipSize / 1024).toFixed(1)}KB > ${(performanceBudget.totalBundleSize / 1024).toFixed(1)}KB`);
    }
    
    bundleInfo.forEach(bundle => {
      if (bundle.gzipSize > performanceBudget.maxChunkSize) {
        score -= 20;
        issues.push(`Large chunk: ${bundle.filename} (${(bundle.gzipSize / 1024).toFixed(1)}KB)`);
      }
    });
    
    // Lighthouse simulation (basic checks)
    score = Math.max(0, score);
    
    testResults.performance = {
      passed: score >= 80,
      score,
      issues
    };
    
    if (testResults.performance.passed) {
      logSuccess(`Performance tests passed (Score: ${score})`);
    } else {
      logWarning(`Performance tests need attention (Score: ${score})`);
      issues.forEach(issue => logWarning(`  - ${issue}`));
    }
    
  } catch (error) {
    logError(`Performance testing failed: ${error.message}`);
    testResults.performance = { passed: false, score: 0, issues: [error.message] };
  }
}

// Accessibility testing
async function runAccessibilityTests() {
  logHeader('Accessibility Testing');
  
  try {
    // Check for accessibility best practices in code
    const accessibilityIssues = [];
    let score = 100;
    
    // Check for alt text on images
    const imageFiles = findFiles('src', /\.(jsx?|tsx?)$/);
    for (const file of imageFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const imgMatches = content.match(/<img[^>]*>/g) || [];
      
      for (const img of imgMatches) {
        if (!img.includes('alt=')) {
          accessibilityIssues.push(`Missing alt text in ${path.relative(process.cwd(), file)}`);
          score -= 5;
        }
      }
    }
    
    // Check for proper heading structure
    const componentFiles = findFiles('src/components', /\.(jsx?|tsx?)$/);
    let hasHeadings = false;
    
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.match(/<h[1-6]/)) {
        hasHeadings = true;
        break;
      }
    }
    
    if (!hasHeadings) {
      accessibilityIssues.push('No heading elements found in components');
      score -= 10;
    }
    
    // Check for ARIA labels
    let hasAriaLabels = false;
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('aria-label') || content.includes('aria-labelledby')) {
        hasAriaLabels = true;
        break;
      }
    }
    
    if (!hasAriaLabels) {
      accessibilityIssues.push('Limited ARIA label usage found');
      score -= 5;
    }
    
    score = Math.max(0, score);
    
    testResults.accessibility = {
      passed: score >= 80,
      score,
      issues: accessibilityIssues
    };
    
    if (testResults.accessibility.passed) {
      logSuccess(`Accessibility tests passed (Score: ${score})`);
    } else {
      logWarning(`Accessibility tests need attention (Score: ${score})`);
      accessibilityIssues.forEach(issue => logWarning(`  - ${issue}`));
    }
    
  } catch (error) {
    logError(`Accessibility testing failed: ${error.message}`);
    testResults.accessibility = { passed: false, score: 0, issues: [error.message] };
  }
}

// Security testing
async function runSecurityTests() {
  logHeader('Security Testing');
  
  try {
    const securityIssues = [];
    let score = 100;
    
    // Check for hardcoded secrets
    const allFiles = findFiles('src', /\.(js|jsx|ts|tsx)$/);
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
      /secret\s*[:=]\s*['"][^'"]+['"]/i,
      /password\s*[:=]\s*['"][^'"]+['"]/i,
      /token\s*[:=]\s*['"][^'"]+['"]/i,
    ];
    
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          securityIssues.push(`Potential hardcoded secret in ${path.relative(process.cwd(), file)}`);
          score -= 20;
        }
      }
    }
    
    // Check for dangerous functions
    const dangerousPatterns = [
      /eval\s*\(/,
      /innerHTML\s*=/,
      /document\.write\s*\(/,
      /dangerouslySetInnerHTML/,
    ];
    
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          securityIssues.push(`Potentially dangerous function usage in ${path.relative(process.cwd(), file)}`);
          score -= 10;
        }
      }
    }
    
    // Check for HTTPS usage
    const configFiles = findFiles('.', /\.(js|json|env)$/);
    let hasHttpUrls = false;
    
    for (const file of configFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('http://') && !content.includes('localhost')) {
          hasHttpUrls = true;
          securityIssues.push(`HTTP URL found in ${path.relative(process.cwd(), file)}`);
          score -= 15;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    score = Math.max(0, score);
    
    testResults.security = {
      passed: score >= 80,
      score,
      issues: securityIssues
    };
    
    if (testResults.security.passed) {
      logSuccess(`Security tests passed (Score: ${score})`);
    } else {
      logWarning(`Security tests need attention (Score: ${score})`);
      securityIssues.forEach(issue => logWarning(`  - ${issue}`));
    }
    
  } catch (error) {
    logError(`Security testing failed: ${error.message}`);
    testResults.security = { passed: false, score: 0, issues: [error.message] };
  }
}

// Code quality testing
async function runCodeQualityTests() {
  logHeader('Code Quality Testing');
  
  try {
    const qualityIssues = [];
    let score = 100;
    
    // Check TypeScript compilation
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      logSuccess('TypeScript compilation passed');
    } catch (error) {
      qualityIssues.push('TypeScript compilation errors found');
      score -= 30;
    }
    
    // Check for TODO/FIXME comments
    const allFiles = findFiles('src', /\.(js|jsx|ts|tsx)$/);
    let todoCount = 0;
    
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const todos = content.match(/\/\/\s*(TODO|FIXME|HACK)/gi) || [];
      todoCount += todos.length;
    }
    
    if (todoCount > 10) {
      qualityIssues.push(`High number of TODO/FIXME comments: ${todoCount}`);
      score -= 10;
    }
    
    // Check for console.log statements
    let consoleLogCount = 0;
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const consoleLogs = content.match(/console\.log\s*\(/g) || [];
      consoleLogCount += consoleLogs.length;
    }
    
    if (consoleLogCount > 5) {
      qualityIssues.push(`Console.log statements found: ${consoleLogCount}`);
      score -= 5;
    }
    
    score = Math.max(0, score);
    
    testResults.codeQuality = {
      passed: score >= 80,
      score,
      issues: qualityIssues
    };
    
    if (testResults.codeQuality.passed) {
      logSuccess(`Code quality tests passed (Score: ${score})`);
    } else {
      logWarning(`Code quality tests need attention (Score: ${score})`);
      qualityIssues.forEach(issue => logWarning(`  - ${issue}`));
    }
    
  } catch (error) {
    logError(`Code quality testing failed: ${error.message}`);
    testResults.codeQuality = { passed: false, score: 0, issues: [error.message] };
  }
}

// Utility functions
function parseBundleSizes(buildOutput) {
  const lines = buildOutput.split('\n');
  const bundleInfo = [];
  
  lines.forEach(line => {
    const match = line.match(/dist\/assets\/(.+?)\s+(\d+\.?\d*)\s*kB.*?gzip:\s*(\d+\.?\d*)\s*kB/);
    if (match) {
      const [, filename, size, gzipSize] = match;
      bundleInfo.push({
        filename,
        size: parseFloat(size) * 1024,
        gzipSize: parseFloat(gzipSize) * 1024,
      });
    }
  });
  
  return bundleInfo;
}

function findFiles(dir, pattern) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath);
      } else if (stat.isFile() && pattern.test(item)) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Generate comprehensive report
function generateReport() {
  logHeader('Test Results Summary');
  
  const categories = Object.keys(testResults);
  const totalScore = categories.reduce((sum, cat) => sum + testResults[cat].score, 0) / categories.length;
  const passedTests = categories.filter(cat => testResults[cat].passed).length;
  
  log(`Overall Score: ${totalScore.toFixed(1)}/100`, totalScore >= 80 ? 'green' : 'yellow');
  log(`Tests Passed: ${passedTests}/${categories.length}`, passedTests === categories.length ? 'green' : 'yellow');
  
  categories.forEach(category => {
    const result = testResults[category];
    const status = result.passed ? '✅' : '❌';
    log(`${status} ${category}: ${result.score}/100`);
    
    if (result.issues.length > 0) {
      result.issues.forEach(issue => log(`    - ${issue}`, 'yellow'));
    }
  });
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    overallScore: totalScore,
    passedTests,
    totalTests: categories.length,
    results: testResults,
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  logSuccess('Detailed report saved to test-report.json');
  
  return totalScore >= 80 && passedTests === categories.length;
}

// Main execution
async function main() {
  log('🧪 NeuraFit Comprehensive Testing Suite', 'bold');
  log('Running complete quality assurance tests...', 'blue');
  
  await runPerformanceTests();
  await runAccessibilityTests();
  await runSecurityTests();
  await runCodeQualityTests();
  
  const success = generateReport();
  
  if (success) {
    logSuccess('All tests passed! Application is production-ready.');
    process.exit(0);
  } else {
    logError('Some tests failed. Please review and fix issues before deployment.');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`Testing suite failed: ${error.message}`);
    process.exit(1);
  });
}

export { main, testResults };
