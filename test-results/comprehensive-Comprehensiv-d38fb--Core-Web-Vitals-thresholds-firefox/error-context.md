# Test info

- Name: Comprehensive Application Tests >> Performance Validation >> should meet Core Web Vitals thresholds
- Location: /Users/salscrudato/Projects/neurastack-frontend/tests/e2e/comprehensive.spec.ts:141:5

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
   78 |     test('should complete NeuraFit onboarding flow', async ({ page }) => {
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
> 141 |     test('should meet Core Web Vitals thresholds', async ({ page }) => {
      |     ^ Error: browserType.launch: Executable doesn't exist at /Users/salscrudato/Library/Caches/ms-playwright/firefox-1482/firefox/Nightly.app/Contents/MacOS/firefox
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
  179 |     });
  180 |   });
  181 |
  182 |   test.describe('Accessibility Compliance', () => {
  183 |     test('should have proper heading hierarchy', async ({ page }) => {
  184 |       const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  185 |       
  186 |       expect(headings.length).toBeGreaterThan(0);
  187 |       
  188 |       // Check for h1
  189 |       const h1 = await page.locator('h1').first();
  190 |       await expect(h1).toBeVisible();
  191 |     });
  192 |
  193 |     test('should support keyboard navigation', async ({ page }) => {
  194 |       // Test tab navigation
  195 |       await page.keyboard.press('Tab');
  196 |       
  197 |       // Verify focus is visible
  198 |       const focusedElement = await page.locator(':focus');
  199 |       await expect(focusedElement).toBeVisible();
  200 |       
  201 |       // Test multiple tab presses
  202 |       for (let i = 0; i < 5; i++) {
  203 |         await page.keyboard.press('Tab');
  204 |         const currentFocus = await page.locator(':focus');
  205 |         await expect(currentFocus).toBeVisible();
  206 |       }
  207 |     });
  208 |
  209 |     test('should have proper ARIA labels', async ({ page }) => {
  210 |       // Check for navigation landmarks
  211 |       await expect(page.locator('[role="navigation"]')).toBeVisible();
  212 |       
  213 |       // Check for main content
  214 |       await expect(page.locator('[role="main"], main')).toBeVisible();
  215 |       
  216 |       // Check for buttons with labels
  217 |       const buttons = await page.locator('button').all();
  218 |       for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
  219 |         const ariaLabel = await button.getAttribute('aria-label');
  220 |         const textContent = await button.textContent();
  221 |         
  222 |         // Button should have either aria-label or text content
  223 |         expect(ariaLabel || textContent?.trim()).toBeTruthy();
  224 |       }
  225 |     });
  226 |
  227 |     test('should have sufficient color contrast', async ({ page }) => {
  228 |       // This is a simplified test - in practice, you'd use axe-core
  229 |       const textElements = await page.locator('p, span, div').all();
  230 |       
  231 |       for (const element of textElements.slice(0, 10)) { // Check first 10 elements
  232 |         const styles = await element.evaluate((el) => {
  233 |           const computed = window.getComputedStyle(el);
  234 |           return {
  235 |             color: computed.color,
  236 |             backgroundColor: computed.backgroundColor,
  237 |           };
  238 |         });
  239 |         
  240 |         // Basic check - ensure colors are defined
  241 |         expect(styles.color).toBeTruthy();
```