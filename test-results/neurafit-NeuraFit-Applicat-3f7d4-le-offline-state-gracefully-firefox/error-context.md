# Test info

- Name: NeuraFit Application >> should handle offline state gracefully
- Location: /Users/salscrudato/Projects/neurastack-frontend/tests/e2e/neurafit.spec.ts:171:3

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
   71 |       await page.click('text=Bodyweight');
   72 |       await page.click('text=Next');
   73 |       await page.click('text=Complete Setup');
   74 |     }
   75 |     
   76 |     // Click Generate AI Workout
   77 |     await page.click('text=Generate AI Workout');
   78 |     
   79 |     // Should see workout generation screen
   80 |     await expect(page.locator('text=Ready for Your Workout?')).toBeVisible();
   81 |     await page.click('text=Generate AI Workout');
   82 |     
   83 |     // Wait for workout generation (this might take a moment)
   84 |     await expect(page.locator('text=Generating Your Workout')).toBeVisible();
   85 |     
   86 |     // Should eventually see the generated workout
   87 |     await expect(page.locator('text=Start Workout')).toBeVisible({ timeout: 30000 });
   88 |     
   89 |     // Start the workout
   90 |     await page.click('text=Start Workout');
   91 |     
   92 |     // Should see workout in progress
   93 |     await expect(page.locator('text=Complete Exercise')).toBeVisible();
   94 |   });
   95 |
   96 |   test('should view progress tracking', async ({ page }) => {
   97 |     // Navigate to NeuraFit dashboard
   98 |     await page.goto('/apps/neurafit');
   99 |     
  100 |     // Skip onboarding if needed
  101 |     const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
  102 |     if (onboardingExists) {
  103 |       await page.click('text=Beginner');
  104 |       await page.click('text=Next');
  105 |       await page.click('text=Weight Loss');
  106 |       await page.click('text=Next');
  107 |       await page.click('text=Bodyweight');
  108 |       await page.click('text=Next');
  109 |       await page.click('text=Complete Setup');
  110 |     }
  111 |     
  112 |     // Click View Progress
  113 |     await page.click('text=View Progress');
  114 |     
  115 |     // Should see progress tracking page
  116 |     await expect(page.locator('text=Your Fitness Progress')).toBeVisible();
  117 |     await expect(page.locator('text=Workouts')).toBeVisible();
  118 |     await expect(page.locator('text=Time Trained')).toBeVisible();
  119 |     await expect(page.locator('text=Current Streak')).toBeVisible();
  120 |   });
  121 |
  122 |   test('should edit profile', async ({ page }) => {
  123 |     // Navigate to NeuraFit dashboard
  124 |     await page.goto('/apps/neurafit');
  125 |     
  126 |     // Complete onboarding first
  127 |     const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
  128 |     if (onboardingExists) {
  129 |       await page.click('text=Beginner');
  130 |       await page.click('text=Next');
  131 |       await page.click('text=Weight Loss');
  132 |       await page.click('text=Next');
  133 |       await page.click('text=Bodyweight');
  134 |       await page.click('text=Next');
  135 |       await page.click('text=Complete Setup');
  136 |     }
  137 |     
  138 |     // Click Edit Profile
  139 |     await page.click('text=Edit Profile');
  140 |     
  141 |     // Should be back to onboarding
  142 |     await expect(page.locator('text=Choose your fitness level')).toBeVisible();
  143 |   });
  144 |
  145 |   test('should be responsive on mobile', async ({ page }) => {
  146 |     // Set mobile viewport
  147 |     await page.setViewportSize({ width: 375, height: 667 });
  148 |     
  149 |     await page.goto('/apps/neurafit');
  150 |     
  151 |     // Check that elements are properly sized for mobile
  152 |     const onboardingContainer = page.locator('[data-testid="onboarding-container"]').first();
  153 |     if (await onboardingContainer.isVisible()) {
  154 |       const boundingBox = await onboardingContainer.boundingBox();
  155 |       expect(boundingBox?.width).toBeLessThanOrEqual(375);
  156 |     }
  157 |     
  158 |     // Check that buttons are touch-friendly (at least 44px height)
  159 |     const buttons = page.locator('button');
  160 |     const buttonCount = await buttons.count();
  161 |     
  162 |     for (let i = 0; i < Math.min(buttonCount, 5); i++) {
  163 |       const button = buttons.nth(i);
  164 |       if (await button.isVisible()) {
  165 |         const boundingBox = await button.boundingBox();
  166 |         expect(boundingBox?.height).toBeGreaterThanOrEqual(40);
  167 |       }
  168 |     }
  169 |   });
  170 |
> 171 |   test('should handle offline state gracefully', async ({ page, context }) => {
      |   ^ Error: browserType.launch: Executable doesn't exist at /Users/salscrudato/Library/Caches/ms-playwright/firefox-1482/firefox/Nightly.app/Contents/MacOS/firefox
  172 |     // Navigate to NeuraFit
  173 |     await page.goto('/apps/neurafit');
  174 |     
  175 |     // Go offline
  176 |     await context.setOffline(true);
  177 |     
  178 |     // Try to generate a workout (should show appropriate error/offline message)
  179 |     const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
  180 |     if (onboardingExists) {
  181 |       await page.click('text=Beginner');
  182 |       await page.click('text=Next');
  183 |       await page.click('text=Weight Loss');
  184 |       await page.click('text=Next');
  185 |       await page.click('text=Bodyweight');
  186 |       await page.click('text=Next');
  187 |       await page.click('text=Complete Setup');
  188 |     }
  189 |     
  190 |     await page.click('text=Generate AI Workout');
  191 |     await page.click('text=Generate AI Workout');
  192 |     
  193 |     // Should handle offline state (either show offline indicator or error message)
  194 |     // The exact behavior depends on implementation
  195 |     await expect(page.locator('text=offline').or(page.locator('text=network')).or(page.locator('text=connection'))).toBeVisible({ timeout: 10000 });
  196 |   });
  197 | });
  198 |
```