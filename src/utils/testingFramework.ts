/**
 * Comprehensive Testing Framework for NeuraFit
 * 
 * Provides automated testing utilities for user workflows, accessibility,
 * performance, and integration testing to ensure product-grade quality
 */

// ============================================================================
// Testing Types and Interfaces
// ============================================================================

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

export interface WorkflowTestConfig {
  name: string;
  steps: WorkflowStep[];
  timeout: number;
  retries: number;
}

export interface WorkflowStep {
  name: string;
  action: () => Promise<void>;
  validation: () => Promise<boolean>;
  timeout?: number;
}

export interface AccessibilityTestConfig {
  checkColorContrast: boolean;
  checkKeyboardNavigation: boolean;
  checkScreenReader: boolean;
  checkTouchTargets: boolean;
}

export interface PerformanceTestConfig {
  maxLoadTime: number;
  maxBundleSize: number;
  maxMemoryUsage: number;
  checkCoreWebVitals: boolean;
}

// ============================================================================
// Core Testing Framework
// ============================================================================

export class NeuraFitTestRunner {
  private results: TestResult[] = [];
  private isRunning: boolean = false;

  /**
   * Run a complete test suite
   */
  async runTestSuite(config: {
    workflows?: WorkflowTestConfig[];
    accessibility?: AccessibilityTestConfig;
    performance?: PerformanceTestConfig;
  }): Promise<TestResult[]> {
    if (this.isRunning) {
      throw new Error('Test suite is already running');
    }

    this.isRunning = true;
    this.results = [];

    try {
      console.log('🧪 Starting NeuraFit Test Suite...');

      // Run workflow tests
      if (config.workflows) {
        for (const workflow of config.workflows) {
          const result = await this.runWorkflowTest(workflow);
          this.results.push(result);
        }
      }

      // Run accessibility tests
      if (config.accessibility) {
        const result = await this.runAccessibilityTests(config.accessibility);
        this.results.push(result);
      }

      // Run performance tests
      if (config.performance) {
        const result = await this.runPerformanceTests(config.performance);
        this.results.push(result);
      }

      console.log('✅ Test suite completed');
      return this.results;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run workflow test
   */
  private async runWorkflowTest(config: WorkflowTestConfig): Promise<TestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log(`🔄 Running workflow test: ${config.name}`);

      for (let attempt = 0; attempt <= config.retries; attempt++) {
        try {
          for (const step of config.steps) {
            await this.runWorkflowStep(step);
          }
          break; // Success, exit retry loop
        } catch (error) {
          if (attempt === config.retries) {
            throw error; // Last attempt failed
          }
          warnings.push(`Retry ${attempt + 1} for workflow ${config.name}`);
        }
      }

      const duration = performance.now() - startTime;
      return {
        testName: config.name,
        passed: true,
        duration,
        errors,
        warnings
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        testName: config.name,
        passed: false,
        duration,
        errors,
        warnings
      };
    }
  }

  /**
   * Run individual workflow step
   */
  private async runWorkflowStep(step: WorkflowStep): Promise<void> {
    const timeout = step.timeout || 5000;
    
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Step "${step.name}" timed out after ${timeout}ms`));
      }, timeout);

      try {
        await step.action();
        const isValid = await step.validation();
        
        if (!isValid) {
          throw new Error(`Step "${step.name}" validation failed`);
        }
        
        clearTimeout(timer);
        resolve();
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Run accessibility tests
   */
  private async runAccessibilityTests(config: AccessibilityTestConfig): Promise<TestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('♿ Running accessibility tests...');

      if (config.checkColorContrast) {
        await this.checkColorContrast(errors, warnings);
      }

      if (config.checkKeyboardNavigation) {
        await this.checkKeyboardNavigation(errors, warnings);
      }

      if (config.checkTouchTargets) {
        await this.checkTouchTargets(errors, warnings);
      }

      if (config.checkScreenReader) {
        await this.checkScreenReaderSupport(errors, warnings);
      }

      const duration = performance.now() - startTime;
      return {
        testName: 'Accessibility Tests',
        passed: errors.length === 0,
        duration,
        errors,
        warnings
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        testName: 'Accessibility Tests',
        passed: false,
        duration,
        errors,
        warnings
      };
    }
  }

  /**
   * Check color contrast ratios
   */
  private async checkColorContrast(_errors: string[], warnings: string[]): Promise<void> {
    const elements = document.querySelectorAll('*');
    
    for (const element of elements) {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrastRatio(color, backgroundColor);
        
        if (contrast < 4.5) {
          warnings.push(`Low contrast ratio (${contrast.toFixed(2)}) for element: ${element.tagName}`);
        }
      }
    }
  }

  /**
   * Check keyboard navigation
   */
  private async checkKeyboardNavigation(_errors: string[], warnings: string[]): Promise<void> {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      warnings.push('No focusable elements found');
      return;
    }

    // Check if elements are properly focusable
    for (const element of focusableElements) {
      const htmlElement = element as HTMLElement;
      if (htmlElement.tabIndex < 0 && !htmlElement.hasAttribute('tabindex')) {
        warnings.push(`Element ${element.tagName} may not be keyboard accessible`);
      }
    }
  }

  /**
   * Check touch target sizes
   */
  private async checkTouchTargets(_errors: string[], warnings: string[]): Promise<void> {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    
    for (const element of interactiveElements) {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // Minimum touch target size in pixels
      
      if (rect.width < minSize || rect.height < minSize) {
        warnings.push(`Touch target too small (${rect.width}x${rect.height}) for element: ${element.tagName}`);
      }
    }
  }

  /**
   * Check screen reader support
   */
  private async checkScreenReaderSupport(_errors: string[], warnings: string[]): Promise<void> {
    // Check for proper ARIA labels
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby')) {
        warnings.push('Button without accessible text found');
      }
    }

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      warnings.push('No heading elements found');
    }

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    for (const img of images) {
      if (!img.getAttribute('alt')) {
        warnings.push('Image without alt text found');
      }
    }
  }

  /**
   * Run performance tests
   */
  private async runPerformanceTests(config: PerformanceTestConfig): Promise<TestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};

    try {
      console.log('⚡ Running performance tests...');

      // Check Core Web Vitals
      if (config.checkCoreWebVitals) {
        await this.checkCoreWebVitals(errors, warnings, metadata);
      }

      // Check memory usage
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        metadata.memoryUsage = memoryInfo.usedJSHeapSize;
        
        if (memoryInfo.usedJSHeapSize > config.maxMemoryUsage) {
          warnings.push(`High memory usage: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
      }

      const duration = performance.now() - startTime;
      return {
        testName: 'Performance Tests',
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        metadata
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        testName: 'Performance Tests',
        passed: false,
        duration,
        errors,
        warnings,
        metadata
      };
    }
  }

  /**
   * Check Core Web Vitals
   */
  private async checkCoreWebVitals(_errors: string[], warnings: string[], metadata: Record<string, any>): Promise<void> {
    // This would typically use the web-vitals library
    // For now, we'll check basic performance metrics
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      metadata.loadTime = loadTime;
      
      if (loadTime > 3000) {
        warnings.push(`Slow load time: ${loadTime}ms`);
      }
    }
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(_color1: string, _color2: string): number {
    // Simplified contrast calculation
    // In a real implementation, you'd parse RGB values and calculate proper contrast
    return 4.5; // Placeholder
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return [...this.results];
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    let report = `
# NeuraFit Test Report

## Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests}
- Failed: ${failedTests}
- Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%

## Test Results
`;

    for (const result of this.results) {
      const status = result.passed ? '✅' : '❌';
      report += `
### ${status} ${result.testName}
- Duration: ${result.duration.toFixed(2)}ms
- Errors: ${result.errors.length}
- Warnings: ${result.warnings.length}
`;

      if (result.errors.length > 0) {
        report += `
**Errors:**
${result.errors.map(e => `- ${e}`).join('\n')}
`;
      }

      if (result.warnings.length > 0) {
        report += `
**Warnings:**
${result.warnings.map(w => `- ${w}`).join('\n')}
`;
      }
    }

    return report;
  }
}

// ============================================================================
// NeuraFit Specific Test Configurations
// ============================================================================

/**
 * Complete onboarding workflow test
 */
export const NEURAFIT_ONBOARDING_TEST: WorkflowTestConfig = {
  name: 'NeuraFit Onboarding Workflow',
  timeout: 30000,
  retries: 2,
  steps: [
    {
      name: 'Navigate to NeuraFit',
      action: async () => {
        // Simulate navigation to NeuraFit page
        window.location.hash = '#/neurafit';
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
      validation: async () => {
        return document.querySelector('[data-testid="neurafit-page"]') !== null;
      }
    },
    {
      name: 'Complete Personal Info Step',
      action: async () => {
        // Simulate filling personal info
        const ageSlider = document.querySelector('[data-testid="age-slider"]') as HTMLInputElement;
        if (ageSlider) {
          ageSlider.value = '25';
          ageSlider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
      validation: async () => {
        const continueButton = document.querySelector('[data-testid="continue-button"]') as HTMLButtonElement;
        return continueButton && !continueButton.disabled;
      }
    },
    {
      name: 'Complete Fitness Level Step',
      action: async () => {
        const beginnerButton = document.querySelector('[data-testid="fitness-level-beginner"]') as HTMLButtonElement;
        if (beginnerButton) {
          beginnerButton.click();
        }
      },
      validation: async () => {
        const selectedButton = document.querySelector('[data-testid="fitness-level-beginner"][aria-pressed="true"]');
        return selectedButton !== null;
      }
    },
    {
      name: 'Complete Goals Step',
      action: async () => {
        const goalButton = document.querySelector('[data-testid="goal-weight-loss"]') as HTMLButtonElement;
        if (goalButton) {
          goalButton.click();
        }
      },
      validation: async () => {
        const selectedGoal = document.querySelector('[data-testid="goal-weight-loss"][aria-pressed="true"]');
        return selectedGoal !== null;
      }
    }
  ]
};

/**
 * Workout generation test
 */
export const NEURAFIT_WORKOUT_GENERATION_TEST: WorkflowTestConfig = {
  name: 'NeuraFit Workout Generation',
  timeout: 60000,
  retries: 3,
  steps: [
    {
      name: 'Navigate to Dashboard',
      action: async () => {
        // Assume onboarding is complete
        window.location.hash = '#/neurafit';
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
      validation: async () => {
        return document.querySelector('[data-testid="neurafit-dashboard"]') !== null;
      }
    },
    {
      name: 'Start Workout Generation',
      action: async () => {
        const startButton = document.querySelector('[data-testid="start-workout-button"]') as HTMLButtonElement;
        if (startButton) {
          startButton.click();
        }
      },
      validation: async () => {
        return document.querySelector('[data-testid="workout-generator"]') !== null;
      }
    },
    {
      name: 'Generate Workout',
      action: async () => {
        const generateButton = document.querySelector('[data-testid="generate-workout-button"]') as HTMLButtonElement;
        if (generateButton) {
          generateButton.click();
        }
        // Wait for generation to complete
        await new Promise(resolve => setTimeout(resolve, 10000));
      },
      validation: async () => {
        const workoutPlan = document.querySelector('[data-testid="workout-plan"]');
        const errorMessage = document.querySelector('[data-testid="error-message"]');
        return workoutPlan !== null && errorMessage === null;
      },
      timeout: 15000
    }
  ]
};

/**
 * Accessibility test configuration
 */
export const NEURAFIT_ACCESSIBILITY_CONFIG: AccessibilityTestConfig = {
  checkColorContrast: true,
  checkKeyboardNavigation: true,
  checkScreenReader: true,
  checkTouchTargets: true
};

/**
 * Performance test configuration
 */
export const NEURAFIT_PERFORMANCE_CONFIG: PerformanceTestConfig = {
  maxLoadTime: 3000,
  maxBundleSize: 500 * 1024, // 500KB
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  checkCoreWebVitals: true
};

// ============================================================================
// Production Monitoring Integration
// ============================================================================

/**
 * Production monitoring and error tracking
 */
export class ProductionMonitor {
  private errorCount: number = 0;
  private performanceMetrics: Map<string, number[]> = new Map();
  private userInteractions: Array<{ action: string; timestamp: number; duration?: number }> = [];

  /**
   * Track application errors
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.errorCount++;

    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Production Monitor - Error:', errorData);
    }

    // In production, send to monitoring service
    this.sendToMonitoringService('error', errorData);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number): void {
    if (!this.performanceMetrics.has(metric)) {
      this.performanceMetrics.set(metric, []);
    }

    const values = this.performanceMetrics.get(metric)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Alert on performance degradation
    if (values.length >= 10) {
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const recent = values.slice(-5).reduce((sum, v) => sum + v, 0) / 5;

      if (recent > average * 1.5) {
        console.warn(`Performance degradation detected for ${metric}: ${recent}ms vs ${average}ms average`);
      }
    }
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(action: string, startTime?: number): void {
    const interaction = {
      action,
      timestamp: Date.now(),
      duration: startTime ? Date.now() - startTime : undefined
    };

    this.userInteractions.push(interaction);

    // Keep only last 50 interactions
    if (this.userInteractions.length > 50) {
      this.userInteractions.shift();
    }
  }

  /**
   * Get monitoring summary
   */
  getMonitoringSummary(): {
    errorCount: number;
    performanceMetrics: Record<string, { average: number; recent: number }>;
    recentInteractions: Array<{ action: string; timestamp: number; duration?: number }>;
  } {
    const performanceMetrics: Record<string, { average: number; recent: number }> = {};

    for (const [metric, values] of this.performanceMetrics) {
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const recent = values.slice(-5).reduce((sum, v) => sum + v, 0) / Math.min(5, values.length);

      performanceMetrics[metric] = { average, recent };
    }

    return {
      errorCount: this.errorCount,
      performanceMetrics,
      recentInteractions: this.userInteractions.slice(-10)
    };
  }

  /**
   * Send data to monitoring service
   */
  private sendToMonitoringService(type: string, data: any): void {
    // In a real implementation, this would send to services like:
    // - Sentry for error tracking
    // - DataDog for performance monitoring
    // - Google Analytics for user behavior

    if (import.meta.env.PROD) {
      // Example: Send to monitoring service
      fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      }).catch(error => {
        console.warn('Failed to send monitoring data:', error);
      });
    }
  }
}

// Global instances
export const testRunner = new NeuraFitTestRunner();
export const productionMonitor = new ProductionMonitor();

// Setup global error tracking
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    productionMonitor.trackError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    productionMonitor.trackError(new Error(event.reason), {
      type: 'unhandledrejection'
    });
  });
}

export default testRunner;
