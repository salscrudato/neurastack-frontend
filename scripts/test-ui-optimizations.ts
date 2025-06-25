#!/usr/bin/env tsx

/**
 * UI/UX Optimization Testing Script
 * Validates the styling system improvements and performance enhancements
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: string;
}

class UIOptimizationTester {
  private results: TestResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Run all UI optimization tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting UI/UX Optimization Tests...\n');

    // Test styling system
    this.testStylingSystemFiles();
    this.testCSSCustomProperties();
    this.testComponentOptimizations();
    this.testResponsiveDesign();
    this.testAccessibilityFeatures();
    this.testPerformanceOptimizations();

    // Run build test
    await this.testBuildProcess();

    // Display results
    this.displayResults();
  }

  /**
   * Test that all styling system files exist and are properly structured
   */
  private testStylingSystemFiles(): void {
    const requiredFiles = [
      'src/styles/global.css',
      'src/styles/utilities.css',
      'src/styles/neurafit-components.css',
      'src/theme/components.ts',
      'src/theme/designSystem.ts',
      'src/theme/theme.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = join(this.projectRoot, file);
      if (existsSync(filePath)) {
        this.addResult({
          name: `Styling File: ${file}`,
          status: 'PASS',
          message: 'File exists and is accessible'
        });
      } else {
        this.addResult({
          name: `Styling File: ${file}`,
          status: 'FAIL',
          message: 'Required styling file is missing'
        });
      }
    }
  }

  /**
   * Test CSS custom properties implementation
   */
  private testCSSCustomProperties(): void {
    const globalCssPath = join(this.projectRoot, 'src/styles/global.css');
    
    if (!existsSync(globalCssPath)) {
      this.addResult({
        name: 'CSS Custom Properties',
        status: 'FAIL',
        message: 'global.css file not found'
      });
      return;
    }

    const content = readFileSync(globalCssPath, 'utf-8');
    
    const requiredProperties = [
      '--gradient-neurafit-primary',
      '--gradient-neurafit-success',
      '--gradient-neurafit-purple',
      '--shadow-neurafit-button',
      '--shadow-neurafit-card'
    ];

    let foundProperties = 0;
    for (const property of requiredProperties) {
      if (content.includes(property)) {
        foundProperties++;
      }
    }

    if (foundProperties === requiredProperties.length) {
      this.addResult({
        name: 'CSS Custom Properties',
        status: 'PASS',
        message: `All ${requiredProperties.length} NeuraFit properties found`
      });
    } else {
      this.addResult({
        name: 'CSS Custom Properties',
        status: 'WARN',
        message: `Found ${foundProperties}/${requiredProperties.length} properties`,
        details: 'Some NeuraFit-specific properties may be missing'
      });
    }
  }

  /**
   * Test component optimizations
   */
  private testComponentOptimizations(): void {
    const personalInfoPath = join(this.projectRoot, 'src/components/NeuraFit/PersonalInfoStep.tsx');
    const chatInputPath = join(this.projectRoot, 'src/components/ChatInput.tsx');

    // Test PersonalInfoStep optimizations
    if (existsSync(personalInfoPath)) {
      const content = readFileSync(personalInfoPath, 'utf-8');
      
      if (content.includes('neurafit-selection-button') && content.includes('neurafit-form-title')) {
        this.addResult({
          name: 'PersonalInfoStep Optimization',
          status: 'PASS',
          message: 'Component uses optimized CSS classes'
        });
      } else {
        this.addResult({
          name: 'PersonalInfoStep Optimization',
          status: 'FAIL',
          message: 'Component still uses inline styling'
        });
      }
    }

    // Test ChatInput optimizations
    if (existsSync(chatInputPath)) {
      const content = readFileSync(chatInputPath, 'utf-8');
      
      if (content.includes('chat-input-container') && content.includes('chat-send-button')) {
        this.addResult({
          name: 'ChatInput Optimization',
          status: 'PASS',
          message: 'Component uses optimized CSS classes'
        });
      } else {
        this.addResult({
          name: 'ChatInput Optimization',
          status: 'WARN',
          message: 'Component may still have inline styling'
        });
      }
    }
  }

  /**
   * Test responsive design implementation
   */
  private testResponsiveDesign(): void {
    const neuraFitCssPath = join(this.projectRoot, 'src/styles/neurafit-components.css');
    
    if (!existsSync(neuraFitCssPath)) {
      this.addResult({
        name: 'Responsive Design',
        status: 'FAIL',
        message: 'NeuraFit components CSS file not found'
      });
      return;
    }

    const content = readFileSync(neuraFitCssPath, 'utf-8');
    
    const responsiveFeatures = [
      '@media (min-width: 768px)',
      'min-height: 48px',
      'touch-action: manipulation',
      '-webkit-tap-highlight-color: transparent'
    ];

    let foundFeatures = 0;
    for (const feature of responsiveFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    if (foundFeatures >= 3) {
      this.addResult({
        name: 'Responsive Design',
        status: 'PASS',
        message: 'Mobile-first responsive patterns implemented'
      });
    } else {
      this.addResult({
        name: 'Responsive Design',
        status: 'WARN',
        message: 'Some responsive features may be missing'
      });
    }
  }

  /**
   * Test accessibility features
   */
  private testAccessibilityFeatures(): void {
    const utilitiesCssPath = join(this.projectRoot, 'src/styles/utilities.css');
    
    if (!existsSync(utilitiesCssPath)) {
      this.addResult({
        name: 'Accessibility Features',
        status: 'FAIL',
        message: 'utilities.css file not found'
      });
      return;
    }

    const content = readFileSync(utilitiesCssPath, 'utf-8');
    
    const accessibilityFeatures = [
      '@media (prefers-reduced-motion: reduce)',
      'outline: 2px solid',
      'focus-visible'
    ];

    let foundFeatures = 0;
    for (const feature of accessibilityFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    if (foundFeatures >= 2) {
      this.addResult({
        name: 'Accessibility Features',
        status: 'PASS',
        message: 'Accessibility enhancements implemented'
      });
    } else {
      this.addResult({
        name: 'Accessibility Features',
        status: 'WARN',
        message: 'Some accessibility features may be missing'
      });
    }
  }

  /**
   * Test performance optimizations
   */
  private testPerformanceOptimizations(): void {
    const globalCssPath = join(this.projectRoot, 'src/styles/global.css');
    
    if (!existsSync(globalCssPath)) {
      this.addResult({
        name: 'Performance Optimizations',
        status: 'FAIL',
        message: 'global.css file not found'
      });
      return;
    }

    const content = readFileSync(globalCssPath, 'utf-8');
    
    const performanceFeatures = [
      'will-change',
      'backface-visibility: hidden',
      'transform3d',
      'transition:'
    ];

    let foundFeatures = 0;
    for (const feature of performanceFeatures) {
      if (content.includes(feature)) {
        foundFeatures++;
      }
    }

    if (foundFeatures >= 2) {
      this.addResult({
        name: 'Performance Optimizations',
        status: 'PASS',
        message: 'Performance enhancements implemented'
      });
    } else {
      this.addResult({
        name: 'Performance Optimizations',
        status: 'WARN',
        message: 'Some performance optimizations may be missing'
      });
    }
  }

  /**
   * Test build process
   */
  private async testBuildProcess(): Promise<void> {
    try {
      console.log('🔨 Testing build process...');
      execSync('npm run type-check', { 
        cwd: this.projectRoot, 
        stdio: 'pipe',
        timeout: 30000 
      });
      
      this.addResult({
        name: 'TypeScript Build',
        status: 'PASS',
        message: 'TypeScript compilation successful'
      });
    } catch (error) {
      this.addResult({
        name: 'TypeScript Build',
        status: 'FAIL',
        message: 'TypeScript compilation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add test result
   */
  private addResult(result: TestResult): void {
    this.results.push(result);
  }

  /**
   * Display test results
   */
  private displayResults(): void {
    console.log('\n📊 Test Results Summary\n');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.name}: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    
    if (failed === 0) {
      console.log('🎉 All critical tests passed! UI optimizations are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
  }
}

// Run tests if this script is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const tester = new UIOptimizationTester();
  tester.runAllTests().catch(console.error);
}

export { UIOptimizationTester };
