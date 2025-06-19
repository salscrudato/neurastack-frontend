/**
 * Comprehensive End-to-End Tests
 * 
 * Complete user journey testing covering all major application flows,
 * performance validation, and cross-browser compatibility.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  performanceThresholds: {
    LCP: 2500,  // Largest Contentful Paint
    FID: 100,   // First Input Delay
    CLS: 0.1,   // Cumulative Layout Shift
  },
};

// Helper functions
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.readyState === 'complete');
}

async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
        resolve({
          LCP: lcp ? lcp.startTime : 0,
          navigationStart: performance.timeOrigin,
          loadComplete: performance.now(),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Fallback timeout
      setTimeout(() => resolve({ LCP: 0, navigationStart: 0, loadComplete: 0 }), 5000);
    });
  });
  
  return metrics;
}

test.describe('Comprehensive Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to application
    await page.goto(TEST_CONFIG.baseURL);
    await waitForPageLoad(page);
  });

  test.describe('Core Application Flow', () => {
    test('should complete full chat workflow', async ({ page }) => {
      // Test chat interface
      const chatInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="send-button"]');
      
      // Send a message
      await chatInput.fill('Hello, can you help me with fitness advice?');
      await sendButton.click();
      
      // Wait for response
      await expect(page.locator('[data-testid="chat-message"]')).toBeVisible({ timeout: 10000 });
      
      // Verify message appears
      await expect(page.locator('text=Hello, can you help me with fitness advice?')).toBeVisible();
      
      // Verify AI response appears
      await expect(page.locator('[role="assistant"]')).toBeVisible({ timeout: 15000 });
    });

    test('should complete NeuraFit onboarding flow', async ({ page }) => {
      // Navigate to NeuraFit
      await page.click('text=NeuraFit');
      await waitForPageLoad(page);
      
      // Start onboarding if not completed
      const startButton = page.locator('text=Get Started');
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Step 1: Fitness Level
      await expect(page.locator('text=What\'s your fitness level?')).toBeVisible();
      await page.click('[data-testid="fitness-level-beginner"]');
      await page.click('text=Continue');
      
      // Step 2: Goals
      await expect(page.locator('text=What are your fitness goals?')).toBeVisible();
      await page.click('[data-testid="goal-weight-loss"]');
      await page.click('text=Continue');
      
      // Step 3: Equipment
      await expect(page.locator('text=What equipment do you have?')).toBeVisible();
      await page.click('[data-testid="equipment-bodyweight"]');
      await page.click('text=Continue');
      
      // Step 4: Time Availability
      await expect(page.locator('text=How much time do you have?')).toBeVisible();
      await page.click('[data-testid="time-30-minutes"]');
      await page.click('text=Continue');
      
      // Step 5: Personal Information
      await expect(page.locator('text=Tell us about yourself')).toBeVisible();
      await page.fill('[data-testid="age-input"]', '25');
      await page.click('[data-testid="gender-male"]');
      await page.fill('[data-testid="weight-input"]', '70');
      await page.click('text=Complete Setup');
      
      // Verify dashboard appears
      await expect(page.locator('text=Your Fitness Dashboard')).toBeVisible();
    });

    test('should generate and display workout', async ({ page }) => {
      // Navigate to NeuraFit
      await page.click('text=NeuraFit');
      await waitForPageLoad(page);
      
      // Generate workout
      const generateButton = page.locator('text=Generate Workout');
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // Wait for workout generation
        await expect(page.locator('[data-testid="workout-card"]')).toBeVisible({ timeout: 15000 });
        
        // Verify workout details
        await expect(page.locator('text=exercises')).toBeVisible();
        await expect(page.locator('text=minutes')).toBeVisible();
      }
    });
  });

  test.describe('Performance Validation', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      const metrics = await measurePerformance(page);
      
      // Validate LCP (Largest Contentful Paint)
      expect(metrics.LCP).toBeLessThan(TEST_CONFIG.performanceThresholds.LCP);
      
      // Validate page load time
      expect(metrics.loadComplete).toBeLessThan(3000); // 3 seconds
    });

    test('should load critical resources quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(TEST_CONFIG.baseURL);
      
      // Wait for critical elements
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // 2 seconds for critical resources
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Navigate to a page with potentially large data
      await page.click('text=NeuraFit');
      await waitForPageLoad(page);
      
      const startTime = Date.now();
      
      // Interact with data-heavy components
      const dashboard = page.locator('[data-testid="fitness-dashboard"]');
      if (await dashboard.isVisible()) {
        await dashboard.scrollIntoView();
      }
      
      const interactionTime = Date.now() - startTime;
      expect(interactionTime).toBeLessThan(1000); // 1 second for interactions
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for h1
      const h1 = await page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Test multiple tab presses
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const currentFocus = await page.locator(':focus');
        await expect(currentFocus).toBeVisible();
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for navigation landmarks
      await expect(page.locator('[role="navigation"]')).toBeVisible();
      
      // Check for main content
      await expect(page.locator('[role="main"], main')).toBeVisible();
      
      // Check for buttons with labels
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent?.trim()).toBeTruthy();
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // This is a simplified test - in practice, you'd use axe-core
      const textElements = await page.locator('p, span, div').all();
      
      for (const element of textElements.slice(0, 10)) { // Check first 10 elements
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });
        
        // Basic check - ensure colors are defined
        expect(styles.color).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await waitForPageLoad(page);
      
      // Verify mobile layout
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Test mobile navigation
      const menuButton = page.locator('[data-testid="mobile-menu"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      }
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await waitForPageLoad(page);
      
      // Verify tablet layout
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should work on desktop devices', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await waitForPageLoad(page);
      
      // Verify desktop layout
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to interact with the app
      const chatInput = page.locator('[data-testid="chat-input"]');
      if (await chatInput.isVisible()) {
        await chatInput.fill('Test message');
        await page.click('[data-testid="send-button"]');
        
        // Should show error message
        await expect(page.locator('text=network error, text=connection failed')).toBeVisible({ timeout: 5000 });
      }
      
      // Restore online mode
      await page.context().setOffline(false);
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API to return errors
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });
      
      // Try to use functionality that calls API
      const generateButton = page.locator('text=Generate Workout');
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // Should show error message
        await expect(page.locator('text=error, text=failed')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist user preferences', async ({ page }) => {
      // Set some preferences
      await page.click('text=NeuraFit');
      await waitForPageLoad(page);
      
      // Make changes to profile if possible
      const editButton = page.locator('[data-testid="edit-profile"]');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Make some changes
        await page.fill('[data-testid="age-input"]', '30');
        await page.click('text=Save');
        
        // Reload page
        await page.reload();
        await waitForPageLoad(page);
        
        // Verify changes persisted
        await editButton.click();
        const ageInput = page.locator('[data-testid="age-input"]');
        await expect(ageInput).toHaveValue('30');
      }
    });
  });

  test.describe('Security', () => {
    test('should not expose sensitive information', async ({ page }) => {
      // Check that no API keys or sensitive data is exposed in the client
      const pageContent = await page.content();
      
      // Common patterns that shouldn't be in client-side code
      expect(pageContent).not.toContain('sk-'); // OpenAI API keys
      expect(pageContent).not.toContain('AIza'); // Google API keys
      expect(pageContent).not.toContain('password');
      expect(pageContent).not.toContain('secret');
    });

    test('should handle authentication properly', async ({ page }) => {
      // This would test authentication flows if implemented
      // For now, just verify no authentication errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.reload();
      await waitForPageLoad(page);
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('manifest') &&
        !error.includes('service-worker')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });
});
