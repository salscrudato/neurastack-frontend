# Test info

- Name: Comprehensive Application Tests >> Security >> should handle authentication properly
- Location: /Users/salscrudato/Projects/neurastack-frontend/tests/e2e/comprehensive.spec.ts:367:5

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
  267 |       await page.setViewportSize({ width: 768, height: 1024 });
  268 |       await page.reload();
  269 |       await waitForPageLoad(page);
  270 |       
  271 |       // Verify tablet layout
  272 |       await expect(page.locator('header')).toBeVisible();
  273 |       await expect(page.locator('main')).toBeVisible();
  274 |     });
  275 |
  276 |     test('should work on desktop devices', async ({ page }) => {
  277 |       // Set desktop viewport
  278 |       await page.setViewportSize({ width: 1920, height: 1080 });
  279 |       await page.reload();
  280 |       await waitForPageLoad(page);
  281 |       
  282 |       // Verify desktop layout
  283 |       await expect(page.locator('header')).toBeVisible();
  284 |       await expect(page.locator('main')).toBeVisible();
  285 |     });
  286 |   });
  287 |
  288 |   test.describe('Error Handling', () => {
  289 |     test('should handle network errors gracefully', async ({ page }) => {
  290 |       // Simulate offline mode
  291 |       await page.context().setOffline(true);
  292 |       
  293 |       // Try to interact with the app
  294 |       const chatInput = page.locator('[data-testid="chat-input"]');
  295 |       if (await chatInput.isVisible()) {
  296 |         await chatInput.fill('Test message');
  297 |         await page.click('[data-testid="send-button"]');
  298 |         
  299 |         // Should show error message
  300 |         await expect(page.locator('text=network error, text=connection failed')).toBeVisible({ timeout: 5000 });
  301 |       }
  302 |       
  303 |       // Restore online mode
  304 |       await page.context().setOffline(false);
  305 |     });
  306 |
  307 |     test('should handle API errors gracefully', async ({ page }) => {
  308 |       // Mock API to return errors
  309 |       await page.route('**/api/**', route => {
  310 |         route.fulfill({
  311 |           status: 500,
  312 |           contentType: 'application/json',
  313 |           body: JSON.stringify({ error: 'Internal Server Error' }),
  314 |         });
  315 |       });
  316 |       
  317 |       // Try to use functionality that calls API
  318 |       const generateButton = page.locator('text=Generate Workout');
  319 |       if (await generateButton.isVisible()) {
  320 |         await generateButton.click();
  321 |         
  322 |         // Should show error message
  323 |         await expect(page.locator('text=error, text=failed')).toBeVisible({ timeout: 5000 });
  324 |       }
  325 |     });
  326 |   });
  327 |
  328 |   test.describe('Data Persistence', () => {
  329 |     test('should persist user preferences', async ({ page }) => {
  330 |       // Set some preferences
  331 |       await page.click('text=NeuraFit');
  332 |       await waitForPageLoad(page);
  333 |       
  334 |       // Make changes to profile if possible
  335 |       const editButton = page.locator('[data-testid="edit-profile"]');
  336 |       if (await editButton.isVisible()) {
  337 |         await editButton.click();
  338 |         
  339 |         // Make some changes
  340 |         await page.fill('[data-testid="age-input"]', '30');
  341 |         await page.click('text=Save');
  342 |         
  343 |         // Reload page
  344 |         await page.reload();
  345 |         await waitForPageLoad(page);
  346 |         
  347 |         // Verify changes persisted
  348 |         await editButton.click();
  349 |         const ageInput = page.locator('[data-testid="age-input"]');
  350 |         await expect(ageInput).toHaveValue('30');
  351 |       }
  352 |     });
  353 |   });
  354 |
  355 |   test.describe('Security', () => {
  356 |     test('should not expose sensitive information', async ({ page }) => {
  357 |       // Check that no API keys or sensitive data is exposed in the client
  358 |       const pageContent = await page.content();
  359 |       
  360 |       // Common patterns that shouldn't be in client-side code
  361 |       expect(pageContent).not.toContain('sk-'); // OpenAI API keys
  362 |       expect(pageContent).not.toContain('AIza'); // Google API keys
  363 |       expect(pageContent).not.toContain('password');
  364 |       expect(pageContent).not.toContain('secret');
  365 |     });
  366 |
> 367 |     test('should handle authentication properly', async ({ page }) => {
      |     ^ Error: browserType.launch: Executable doesn't exist at /Users/salscrudato/Library/Caches/ms-playwright/firefox-1482/firefox/Nightly.app/Contents/MacOS/firefox
  368 |       // This would test authentication flows if implemented
  369 |       // For now, just verify no authentication errors
  370 |       const errors = [];
  371 |       page.on('console', msg => {
  372 |         if (msg.type() === 'error') {
  373 |           errors.push(msg.text());
  374 |         }
  375 |       });
  376 |       
  377 |       await page.reload();
  378 |       await waitForPageLoad(page);
  379 |       
  380 |       // Filter out known non-critical errors
  381 |       const criticalErrors = errors.filter(error => 
  382 |         !error.includes('favicon') && 
  383 |         !error.includes('manifest') &&
  384 |         !error.includes('service-worker')
  385 |       );
  386 |       
  387 |       expect(criticalErrors).toHaveLength(0);
  388 |     });
  389 |   });
  390 | });
  391 |
```