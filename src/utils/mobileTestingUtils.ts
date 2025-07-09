/**
 * Mobile Testing & Validation Utilities
 * Comprehensive testing tools for mobile optimization validation
 */

interface MobileTestResult {
  test: string;
  passed: boolean;
  score: number;
  message: string;
  recommendations?: string[];
}

interface MobileAuditReport {
  overallScore: number;
  results: MobileTestResult[];
  timestamp: number;
  deviceInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    devicePixelRatio: number;
    touchSupport: boolean;
  };
}

class MobileTestingUtils {
  private testResults: MobileTestResult[] = [];

  // Test viewport configuration
  public testViewportConfiguration(): MobileTestResult {
    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    
    if (!viewport) {
      return {
        test: 'Viewport Configuration',
        passed: false,
        score: 0,
        message: 'No viewport meta tag found',
        recommendations: ['Add viewport meta tag with proper mobile configuration']
      };
    }

    const content = viewport.content;
    const hasWidthDevice = content.includes('width=device-width');
    const hasInitialScale = content.includes('initial-scale=1');
    const hasViewportFit = content.includes('viewport-fit=cover');

    const score = (hasWidthDevice ? 40 : 0) + (hasInitialScale ? 40 : 0) + (hasViewportFit ? 20 : 0);
    
    return {
      test: 'Viewport Configuration',
      passed: score >= 80,
      score,
      message: `Viewport configuration score: ${score}/100`,
      recommendations: [
        ...(!hasWidthDevice ? ['Add width=device-width'] : []),
        ...(!hasInitialScale ? ['Add initial-scale=1.0'] : []),
        ...(!hasViewportFit ? ['Add viewport-fit=cover for notched devices'] : [])
      ]
    };
  }

  // Test touch target sizes
  public testTouchTargets(): MobileTestResult {
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"], [tabindex]');
    let passedElements = 0;
    const minTouchSize = 44; // 44px minimum recommended by Apple/Google

    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const computedStyle = getComputedStyle(element);
      
      const width = Math.max(rect.width, parseInt(computedStyle.minWidth) || 0);
      const height = Math.max(rect.height, parseInt(computedStyle.minHeight) || 0);
      
      if (width >= minTouchSize && height >= minTouchSize) {
        passedElements++;
      }
    });

    const score = interactiveElements.length > 0 ? Math.round((passedElements / interactiveElements.length) * 100) : 100;
    
    return {
      test: 'Touch Target Sizes',
      passed: score >= 90,
      score,
      message: `${passedElements}/${interactiveElements.length} elements meet minimum touch target size`,
      recommendations: score < 90 ? ['Ensure interactive elements are at least 44x44px'] : []
    };
  }

  // Test font sizes for mobile readability
  public testFontSizes(): MobileTestResult {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
    let readableElements = 0;
    const minFontSize = 16; // 16px minimum for mobile readability

    textElements.forEach((element) => {
      const computedStyle = getComputedStyle(element);
      const fontSize = parseInt(computedStyle.fontSize);
      
      if (fontSize >= minFontSize || element.textContent?.trim() === '') {
        readableElements++;
      }
    });

    const score = textElements.length > 0 ? Math.round((readableElements / textElements.length) * 100) : 100;
    
    return {
      test: 'Font Size Readability',
      passed: score >= 85,
      score,
      message: `${readableElements}/${textElements.length} text elements are readable on mobile`,
      recommendations: score < 85 ? ['Ensure text is at least 16px for mobile readability'] : []
    };
  }

  // Test scroll performance
  public testScrollPerformance(): Promise<MobileTestResult> {
    return new Promise((resolve) => {
      let frameCount = 0;
      let droppedFrames = 0;
      let lastTime = performance.now();
      const testDuration = 2000; // 2 seconds
      const startTime = performance.now();

      const measureScroll = (currentTime: number) => {
        frameCount++;
        
        if (currentTime - lastTime > 16.67) { // More than 60fps threshold
          droppedFrames++;
        }
        
        lastTime = currentTime;
        
        if (currentTime - startTime < testDuration) {
          requestAnimationFrame(measureScroll);
        } else {
          const score = Math.max(0, Math.round(((frameCount - droppedFrames) / frameCount) * 100));
          
          resolve({
            test: 'Scroll Performance',
            passed: score >= 80,
            score,
            message: `${droppedFrames} dropped frames out of ${frameCount} total`,
            recommendations: score < 80 ? [
              'Optimize scroll performance with CSS will-change',
              'Use transform instead of changing layout properties',
              'Implement virtual scrolling for long lists'
            ] : []
          });
        }
      };

      // Trigger some scrolling
      window.scrollBy(0, 100);
      setTimeout(() => window.scrollBy(0, -100), 500);
      setTimeout(() => window.scrollBy(0, 200), 1000);
      
      requestAnimationFrame(measureScroll);
    });
  }

  // Test keyboard handling
  public testKeyboardHandling(): MobileTestResult {
    const inputElements = document.querySelectorAll('input, textarea');
    let properlyConfiguredInputs = 0;

    inputElements.forEach((input) => {
      const element = input as HTMLInputElement | HTMLTextAreaElement;
      const fontSize = parseInt(getComputedStyle(element).fontSize);
      const hasProperFontSize = fontSize >= 16; // Prevents zoom on iOS
      
      if (hasProperFontSize) {
        properlyConfiguredInputs++;
      }
    });

    const score = inputElements.length > 0 ? Math.round((properlyConfiguredInputs / inputElements.length) * 100) : 100;
    
    return {
      test: 'Keyboard Handling',
      passed: score >= 90,
      score,
      message: `${properlyConfiguredInputs}/${inputElements.length} inputs properly configured for mobile keyboards`,
      recommendations: score < 90 ? [
        'Set input font-size to at least 16px to prevent zoom on iOS',
        'Use appropriate inputMode attributes',
        'Handle keyboard show/hide events'
      ] : []
    };
  }

  // Test safe area support
  public testSafeAreaSupport(): MobileTestResult {
    const hasEnvSupport = CSS.supports('padding-top', 'env(safe-area-inset-top)');
    const elementsWithSafeArea = document.querySelectorAll('[style*="safe-area"], [class*="safe-area"]');
    
    let score = 0;
    if (hasEnvSupport) score += 50;
    if (elementsWithSafeArea.length > 0) score += 50;
    
    return {
      test: 'Safe Area Support',
      passed: score >= 70,
      score,
      message: `Safe area support: ${hasEnvSupport ? 'CSS env() supported' : 'No CSS env() support'}, ${elementsWithSafeArea.length} elements use safe area`,
      recommendations: score < 70 ? [
        'Add safe area inset support for notched devices',
        'Use env(safe-area-inset-*) in CSS',
        'Test on devices with notches'
      ] : []
    };
  }

  // Test loading performance
  public testLoadingPerformance(): MobileTestResult {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      return {
        test: 'Loading Performance',
        passed: false,
        score: 0,
        message: 'Navigation timing not available'
      };
    }

    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    
    let score = 100;
    if (loadTime > 3000) score -= 30; // Penalize if load time > 3s
    if (domContentLoaded > 1500) score -= 20; // Penalize if DCL > 1.5s
    if (navigation.transferSize > 1000000) score -= 20; // Penalize if transfer > 1MB
    
    score = Math.max(0, score);
    
    return {
      test: 'Loading Performance',
      passed: score >= 70,
      score,
      message: `Load time: ${Math.round(loadTime)}ms, DCL: ${Math.round(domContentLoaded)}ms`,
      recommendations: score < 70 ? [
        'Optimize bundle size',
        'Implement code splitting',
        'Use service worker for caching',
        'Optimize images and assets'
      ] : []
    };
  }

  // Test accessibility for mobile
  public testMobileAccessibility(): MobileTestResult {
    let score = 100;
    const issues: string[] = [];

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      score -= 20;
      issues.push('No heading elements found');
    }

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      score -= 15;
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    // Check for proper form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      return !id || !document.querySelector(`label[for="${id}"]`);
    });
    if (inputsWithoutLabels.length > 0) {
      score -= 15;
      issues.push(`${inputsWithoutLabels.length} form inputs missing labels`);
    }

    // Check for focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, [tabindex]');
    // This is a simplified check - in reality, you'd need to test actual focus styles
    if (focusableElements.length > 0) {
      score += 0; // Placeholder for focus indicator check
    }

    return {
      test: 'Mobile Accessibility',
      passed: score >= 80,
      score: Math.max(0, score),
      message: issues.length > 0 ? issues.join(', ') : 'No accessibility issues found',
      recommendations: issues.length > 0 ? [
        'Add proper heading hierarchy',
        'Include alt text for all images',
        'Associate form inputs with labels',
        'Ensure focus indicators are visible'
      ] : []
    };
  }

  // Run comprehensive mobile audit
  public async runMobileAudit(): Promise<MobileAuditReport> {
    this.testResults = [];

    // Run synchronous tests
    this.testResults.push(this.testViewportConfiguration());
    this.testResults.push(this.testTouchTargets());
    this.testResults.push(this.testFontSizes());
    this.testResults.push(this.testKeyboardHandling());
    this.testResults.push(this.testSafeAreaSupport());
    this.testResults.push(this.testLoadingPerformance());
    this.testResults.push(this.testMobileAccessibility());

    // Run asynchronous tests
    const scrollTest = await this.testScrollPerformance();
    this.testResults.push(scrollTest);

    // Calculate overall score
    const overallScore = Math.round(
      this.testResults.reduce((sum, result) => sum + result.score, 0) / this.testResults.length
    );

    return {
      overallScore,
      results: this.testResults,
      timestamp: Date.now(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        devicePixelRatio: window.devicePixelRatio,
        touchSupport: 'ontouchstart' in window
      }
    };
  }

  // Generate report HTML
  public generateReportHTML(report: MobileAuditReport): string {
    const getScoreColor = (score: number) => {
      if (score >= 90) return '#10B981'; // Green
      if (score >= 70) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    };

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1F2937; margin-bottom: 20px;">Mobile Optimization Audit Report</h1>
        
        <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
          <h2 style="color: ${getScoreColor(report.overallScore)}; font-size: 48px; margin: 0;">
            ${report.overallScore}/100
          </h2>
          <p style="color: #6B7280; margin: 5px 0 0 0;">Overall Mobile Score</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1F2937; margin-bottom: 15px;">Device Information</h3>
          <ul style="color: #6B7280; line-height: 1.6;">
            <li>Viewport: ${report.deviceInfo.viewport.width}x${report.deviceInfo.viewport.height}</li>
            <li>Device Pixel Ratio: ${report.deviceInfo.devicePixelRatio}</li>
            <li>Touch Support: ${report.deviceInfo.touchSupport ? 'Yes' : 'No'}</li>
            <li>Test Date: ${new Date(report.timestamp).toLocaleString()}</li>
          </ul>
        </div>

        <div>
          <h3 style="color: #1F2937; margin-bottom: 20px;">Test Results</h3>
          ${report.results.map(result => `
            <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="color: #1F2937; margin: 0;">${result.test}</h4>
                <span style="color: ${getScoreColor(result.score)}; font-weight: 600; font-size: 18px;">
                  ${result.score}/100
                </span>
              </div>
              <p style="color: #6B7280; margin: 0 0 10px 0;">${result.message}</p>
              ${result.recommendations && result.recommendations.length > 0 ? `
                <div style="background: #FEF3C7; border-radius: 6px; padding: 12px;">
                  <strong style="color: #92400E;">Recommendations:</strong>
                  <ul style="margin: 8px 0 0 0; color: #92400E;">
                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Singleton instance
export const mobileTestingUtils = new MobileTestingUtils();

// Utility function to run quick mobile check
export const runQuickMobileCheck = async (): Promise<void> => {
  const report = await mobileTestingUtils.runMobileAudit();
  console.group('📱 Mobile Optimization Audit');
  console.log(`Overall Score: ${report.overallScore}/100`);
  
  report.results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.score}/100 - ${result.message}`);
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('   Recommendations:', result.recommendations);
    }
  });
  
  console.groupEnd();
};

export default MobileTestingUtils;
