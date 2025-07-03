#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * Analyzes the built application bundle and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// File size thresholds (in bytes)
const THRESHOLDS = {
  LARGE_CHUNK: 200 * 1024, // 200KB
  HUGE_CHUNK: 500 * 1024,  // 500KB
  TOTAL_WARNING: 1.5 * 1024 * 1024, // 1.5MB
};

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

function analyzeChunks() {
  console.log(`${colors.bold}${colors.blue}📦 Bundle Analysis Report${colors.reset}\n`);
  
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log(`${colors.red}❌ Assets directory not found. Run 'npm run build' first.${colors.reset}`);
    return;
  }

  const jsDir = path.join(ASSETS_DIR, 'js');
  const cssDir = path.join(ASSETS_DIR, 'css');
  
  let totalSize = 0;
  const chunks = [];
  
  // Analyze JavaScript chunks
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    
    for (const file of jsFiles) {
      const filePath = path.join(jsDir, file);
      const size = getFileSize(filePath);
      totalSize += size;
      
      chunks.push({
        name: file,
        type: 'JavaScript',
        size,
        path: filePath,
      });
    }
  }
  
  // Analyze CSS chunks
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    for (const file of cssFiles) {
      const filePath = path.join(cssDir, file);
      const size = getFileSize(filePath);
      totalSize += size;
      
      chunks.push({
        name: file,
        type: 'CSS',
        size,
        path: filePath,
      });
    }
  }
  
  // Sort chunks by size (largest first)
  chunks.sort((a, b) => b.size - a.size);
  
  // Display results
  console.log(`${colors.bold}📊 Chunk Analysis${colors.reset}`);
  console.log(`Total Bundle Size: ${formatBytes(totalSize)}\n`);
  
  chunks.forEach((chunk, index) => {
    const sizeStr = formatBytes(chunk.size);
    const percentage = ((chunk.size / totalSize) * 100).toFixed(1);
    
    let color = colors.green;
    let icon = '✅';
    
    if (chunk.size > THRESHOLDS.HUGE_CHUNK) {
      color = colors.red;
      icon = '🚨';
    } else if (chunk.size > THRESHOLDS.LARGE_CHUNK) {
      color = colors.yellow;
      icon = '⚠️';
    }
    
    console.log(`${icon} ${color}${chunk.name}${colors.reset}`);
    console.log(`   Size: ${sizeStr} (${percentage}%)`);
    console.log(`   Type: ${chunk.type}\n`);
  });
  
  // Recommendations
  console.log(`${colors.bold}💡 Optimization Recommendations${colors.reset}\n`);
  
  const largeChunks = chunks.filter(chunk => chunk.size > THRESHOLDS.LARGE_CHUNK);
  
  if (largeChunks.length > 0) {
    console.log(`${colors.yellow}⚠️ Large Chunks Detected:${colors.reset}`);
    largeChunks.forEach(chunk => {
      console.log(`   • ${chunk.name} (${formatBytes(chunk.size)})`);
      
      // Specific recommendations based on chunk name
      if (chunk.name.includes('firebase')) {
        console.log(`     💡 Consider splitting Firebase into smaller chunks`);
        console.log(`     💡 Use dynamic imports for Firebase features`);
      }
      
      if (chunk.name.includes('ui')) {
        console.log(`     💡 Consider lazy loading UI components`);
        console.log(`     💡 Use tree shaking for unused UI components`);
      }
      
      if (chunk.name.includes('vendor')) {
        console.log(`     💡 Split vendor chunk into smaller pieces`);
        console.log(`     💡 Consider using CDN for common libraries`);
      }
    });
    console.log();
  }
  
  if (totalSize > THRESHOLDS.TOTAL_WARNING) {
    console.log(`${colors.red}🚨 Total bundle size exceeds recommended limit${colors.reset}`);
    console.log(`   Current: ${formatBytes(totalSize)}`);
    console.log(`   Recommended: < ${formatBytes(THRESHOLDS.TOTAL_WARNING)}`);
    console.log();
  }
  
  // Performance recommendations
  console.log(`${colors.bold}🚀 Performance Recommendations${colors.reset}`);
  console.log(`1. Enable compression (gzip/brotli) on your server`);
  console.log(`2. Implement resource preloading for critical chunks`);
  console.log(`3. Use service worker for caching strategies`);
  console.log(`4. Consider code splitting at route level`);
  console.log(`5. Implement lazy loading for non-critical components`);
  console.log();
  
  // Bundle composition analysis
  const jsChunks = chunks.filter(chunk => chunk.type === 'JavaScript');
  const cssChunks = chunks.filter(chunk => chunk.type === 'CSS');
  
  const jsSize = jsChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const cssSize = cssChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  
  console.log(`${colors.bold}📈 Bundle Composition${colors.reset}`);
  console.log(`JavaScript: ${formatBytes(jsSize)} (${((jsSize / totalSize) * 100).toFixed(1)}%)`);
  console.log(`CSS: ${formatBytes(cssSize)} (${((cssSize / totalSize) * 100).toFixed(1)}%)`);
  console.log();
  
  // Chunk naming analysis
  console.log(`${colors.bold}🏷️ Chunk Naming Analysis${colors.reset}`);
  const chunkTypes = {};
  
  jsChunks.forEach(chunk => {
    const baseName = chunk.name.split('-')[0];
    if (!chunkTypes[baseName]) {
      chunkTypes[baseName] = { count: 0, totalSize: 0 };
    }
    chunkTypes[baseName].count++;
    chunkTypes[baseName].totalSize += chunk.size;
  });
  
  Object.entries(chunkTypes)
    .sort(([,a], [,b]) => b.totalSize - a.totalSize)
    .forEach(([type, data]) => {
      console.log(`${type}: ${data.count} chunk(s), ${formatBytes(data.totalSize)}`);
    });
  
  console.log(`\n${colors.green}✅ Bundle analysis complete!${colors.reset}`);
}

// Run analysis
analyzeChunks();
