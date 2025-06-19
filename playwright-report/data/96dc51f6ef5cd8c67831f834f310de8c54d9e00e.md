# Test info

- Name: NeuraFit Application >> should navigate to NeuraFit from splash page
- Location: /Users/salscrudato/Projects/neurastack-frontend/tests/e2e/neurafit.spec.ts:8:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/salscrudato/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('NeuraFit Application', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/');
   6 |   });
   7 |
>  8 |   test('should navigate to NeuraFit from splash page', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /Users/salscrudato/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
   9 |     // Wait for the splash page to load
   10 |     await expect(page.locator('text=Welcome to neurastack')).toBeVisible();
   11 |     
   12 |     // Click on "Continue as Guest" or similar button
   13 |     await page.click('text=Continue as Guest');
   14 |     
   15 |     // Navigate to Apps page
   16 |     await page.click('text=Apps');
   17 |     
   18 |     // Click on NeuraFit
   19 |     await page.click('text=NeuraFit');
   20 |     
   21 |     // Should be on NeuraFit onboarding
   22 |     await expect(page.locator('text=Choose your fitness level')).toBeVisible();
   23 |   });
   24 |
   25 |   test('should complete NeuraFit onboarding flow', async ({ page }) => {
   26 |     // Navigate to NeuraFit (assuming we start from the app)
   27 |     await page.goto('/apps/neurafit');
   28 |     
   29 |     // Step 1: Fitness Level
   30 |     await expect(page.locator('text=Choose your fitness level')).toBeVisible();
   31 |     await page.click('text=Beginner');
   32 |     await page.click('text=Next');
   33 |     
   34 |     // Step 2: Goals
   35 |     await expect(page.locator('text=Select your goals')).toBeVisible();
   36 |     await page.click('text=Weight Loss');
   37 |     await page.click('text=Muscle Gain');
   38 |     await page.click('text=Next');
   39 |     
   40 |     // Step 3: Equipment
   41 |     await expect(page.locator('text=Pick your equipment')).toBeVisible();
   42 |     await page.click('text=Bodyweight');
   43 |     await page.click('text=Dumbbells');
   44 |     await page.click('text=Next');
   45 |     
   46 |     // Step 4: Time
   47 |     await expect(page.locator('text=Set your schedule')).toBeVisible();
   48 |     await page.selectOption('select[name="availableTime"]', '30');
   49 |     await page.check('input[value="monday"]');
   50 |     await page.check('input[value="wednesday"]');
   51 |     await page.check('input[value="friday"]');
   52 |     await page.click('text=Complete Setup');
   53 |     
   54 |     // Should see dashboard
   55 |     await expect(page.locator('text=Welcome to NeuraFit')).toBeVisible();
   56 |     await expect(page.locator('text=Generate AI Workout')).toBeVisible();
   57 |   });
   58 |
   59 |   test('should generate and start a workout', async ({ page }) => {
   60 |     // Assume we're already on the dashboard (completed onboarding)
   61 |     await page.goto('/apps/neurafit');
   62 |     
   63 |     // Skip onboarding if it appears (for this test, we'll mock completed state)
   64 |     const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
   65 |     if (onboardingExists) {
   66 |       // Complete onboarding quickly
   67 |       await page.click('text=Beginner');
   68 |       await page.click('text=Next');
   69 |       await page.click('text=Weight Loss');
   70 |       await page.click('text=Next');
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
```