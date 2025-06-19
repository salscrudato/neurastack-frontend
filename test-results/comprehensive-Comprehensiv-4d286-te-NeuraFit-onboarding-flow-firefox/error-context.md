# Test info

- Name: Comprehensive Application Tests >> Core Application Flow >> should complete NeuraFit onboarding flow
- Location: /Users/salscrudato/Projects/neurastack-frontend/tests/e2e/comprehensive.spec.ts:78:5

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/salscrudato/Library/Caches/ms-playwright/firefox-1482/firefox/Nightly.app/Contents/MacOS/firefox
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | /**
   2 |  * Comprehensive End-to-End Tests
   3 |  * 
   4 |  * Complete user journey testing covering all major application flows,
   5 |  * performance validation, and cross-browser compatibility.
   6 |  */
   7 |
   8 | import { test, expect, Page } from '@playwright/test';
   9 |
   10 | // Test configuration
   11 | const TEST_CONFIG = {
   12 |   baseURL: process.env.BASE_URL || 'http://localhost:3000',
   13 |   timeout: 30000,
   14 |   performanceThresholds: {
   15 |     LCP: 2500,  // Largest Contentful Paint
   16 |     FID: 100,   // First Input Delay
   17 |     CLS: 0.1,   // Cumulative Layout Shift
   18 |   },
   19 | };
   20 |
   21 | // Helper functions
   22 | async function waitForPageLoad(page: Page) {
   23 |   await page.waitForLoadState('networkidle');
   24 |   await page.waitForFunction(() => document.readyState === 'complete');
   25 | }
   26 |
   27 | async function measurePerformance(page: Page) {
   28 |   const metrics = await page.evaluate(() => {
   29 |     return new Promise((resolve) => {
   30 |       new PerformanceObserver((list) => {
   31 |         const entries = list.getEntries();
   32 |         const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
   33 |         resolve({
   34 |           LCP: lcp ? lcp.startTime : 0,
   35 |           navigationStart: performance.timeOrigin,
   36 |           loadComplete: performance.now(),
   37 |         });
   38 |       }).observe({ entryTypes: ['largest-contentful-paint'] });
   39 |       
   40 |       // Fallback timeout
   41 |       setTimeout(() => resolve({ LCP: 0, navigationStart: 0, loadComplete: 0 }), 5000);
   42 |     });
   43 |   });
   44 |   
   45 |   return metrics;
   46 | }
   47 |
   48 | test.describe('Comprehensive Application Tests', () => {
   49 |   test.beforeEach(async ({ page }) => {
   50 |     // Set viewport for consistent testing
   51 |     await page.setViewportSize({ width: 1280, height: 720 });
   52 |     
   53 |     // Navigate to application
   54 |     await page.goto(TEST_CONFIG.baseURL);
   55 |     await waitForPageLoad(page);
   56 |   });
   57 |
   58 |   test.describe('Core Application Flow', () => {
   59 |     test('should complete full chat workflow', async ({ page }) => {
   60 |       // Test chat interface
   61 |       const chatInput = page.locator('[data-testid="chat-input"]');
   62 |       const sendButton = page.locator('[data-testid="send-button"]');
   63 |       
   64 |       // Send a message
   65 |       await chatInput.fill('Hello, can you help me with fitness advice?');
   66 |       await sendButton.click();
   67 |       
   68 |       // Wait for response
   69 |       await expect(page.locator('[data-testid="chat-message"]')).toBeVisible({ timeout: 10000 });
   70 |       
   71 |       // Verify message appears
   72 |       await expect(page.locator('text=Hello, can you help me with fitness advice?')).toBeVisible();
   73 |       
   74 |       // Verify AI response appears
   75 |       await expect(page.locator('[role="assistant"]')).toBeVisible({ timeout: 15000 });
   76 |     });
   77 |
>  78 |     test('should complete NeuraFit onboarding flow', async ({ page }) => {
      |     ^ Error: browserType.launch: Executable doesn't exist at /Users/salscrudato/Library/Caches/ms-playwright/firefox-1482/firefox/Nightly.app/Contents/MacOS/firefox
   79 |       // Navigate to NeuraFit
   80 |       await page.click('text=NeuraFit');
   81 |       await waitForPageLoad(page);
   82 |       
   83 |       // Start onboarding if not completed
   84 |       const startButton = page.locator('text=Get Started');
   85 |       if (await startButton.isVisible()) {
   86 |         await startButton.click();
   87 |       }
   88 |       
   89 |       // Step 1: Fitness Level
   90 |       await expect(page.locator('text=What\'s your fitness level?')).toBeVisible();
   91 |       await page.click('[data-testid="fitness-level-beginner"]');
   92 |       await page.click('text=Continue');
   93 |       
   94 |       // Step 2: Goals
   95 |       await expect(page.locator('text=What are your fitness goals?')).toBeVisible();
   96 |       await page.click('[data-testid="goal-weight-loss"]');
   97 |       await page.click('text=Continue');
   98 |       
   99 |       // Step 3: Equipment
  100 |       await expect(page.locator('text=What equipment do you have?')).toBeVisible();
  101 |       await page.click('[data-testid="equipment-bodyweight"]');
  102 |       await page.click('text=Continue');
  103 |       
  104 |       // Step 4: Time Availability
  105 |       await expect(page.locator('text=How much time do you have?')).toBeVisible();
  106 |       await page.click('[data-testid="time-30-minutes"]');
  107 |       await page.click('text=Continue');
  108 |       
  109 |       // Step 5: Personal Information
  110 |       await expect(page.locator('text=Tell us about yourself')).toBeVisible();
  111 |       await page.fill('[data-testid="age-input"]', '25');
  112 |       await page.click('[data-testid="gender-male"]');
  113 |       await page.fill('[data-testid="weight-input"]', '70');
  114 |       await page.click('text=Complete Setup');
  115 |       
  116 |       // Verify dashboard appears
  117 |       await expect(page.locator('text=Your Fitness Dashboard')).toBeVisible();
  118 |     });
  119 |
  120 |     test('should generate and display workout', async ({ page }) => {
  121 |       // Navigate to NeuraFit
  122 |       await page.click('text=NeuraFit');
  123 |       await waitForPageLoad(page);
  124 |       
  125 |       // Generate workout
  126 |       const generateButton = page.locator('text=Generate Workout');
  127 |       if (await generateButton.isVisible()) {
  128 |         await generateButton.click();
  129 |         
  130 |         // Wait for workout generation
  131 |         await expect(page.locator('[data-testid="workout-card"]')).toBeVisible({ timeout: 15000 });
  132 |         
  133 |         // Verify workout details
  134 |         await expect(page.locator('text=exercises')).toBeVisible();
  135 |         await expect(page.locator('text=minutes')).toBeVisible();
  136 |       }
  137 |     });
  138 |   });
  139 |
  140 |   test.describe('Performance Validation', () => {
  141 |     test('should meet Core Web Vitals thresholds', async ({ page }) => {
  142 |       const metrics = await measurePerformance(page);
  143 |       
  144 |       // Validate LCP (Largest Contentful Paint)
  145 |       expect(metrics.LCP).toBeLessThan(TEST_CONFIG.performanceThresholds.LCP);
  146 |       
  147 |       // Validate page load time
  148 |       expect(metrics.loadComplete).toBeLessThan(3000); // 3 seconds
  149 |     });
  150 |
  151 |     test('should load critical resources quickly', async ({ page }) => {
  152 |       const startTime = Date.now();
  153 |       
  154 |       await page.goto(TEST_CONFIG.baseURL);
  155 |       
  156 |       // Wait for critical elements
  157 |       await expect(page.locator('header')).toBeVisible();
  158 |       await expect(page.locator('main')).toBeVisible();
  159 |       
  160 |       const loadTime = Date.now() - startTime;
  161 |       expect(loadTime).toBeLessThan(2000); // 2 seconds for critical resources
  162 |     });
  163 |
  164 |     test('should handle large datasets efficiently', async ({ page }) => {
  165 |       // Navigate to a page with potentially large data
  166 |       await page.click('text=NeuraFit');
  167 |       await waitForPageLoad(page);
  168 |       
  169 |       const startTime = Date.now();
  170 |       
  171 |       // Interact with data-heavy components
  172 |       const dashboard = page.locator('[data-testid="fitness-dashboard"]');
  173 |       if (await dashboard.isVisible()) {
  174 |         await dashboard.scrollIntoView();
  175 |       }
  176 |       
  177 |       const interactionTime = Date.now() - startTime;
  178 |       expect(interactionTime).toBeLessThan(1000); // 1 second for interactions
```