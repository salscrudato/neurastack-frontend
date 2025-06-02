import { test, expect } from '@playwright/test';

test.describe('NeuraFit Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to NeuraFit from splash page', async ({ page }) => {
    // Wait for the splash page to load
    await expect(page.locator('text=Welcome to neurastack')).toBeVisible();
    
    // Click on "Continue as Guest" or similar button
    await page.click('text=Continue as Guest');
    
    // Navigate to Apps page
    await page.click('text=Apps');
    
    // Click on NeuraFit
    await page.click('text=NeuraFit');
    
    // Should be on NeuraFit onboarding
    await expect(page.locator('text=Choose your fitness level')).toBeVisible();
  });

  test('should complete NeuraFit onboarding flow', async ({ page }) => {
    // Navigate to NeuraFit (assuming we start from the app)
    await page.goto('/apps/neurafit');
    
    // Step 1: Fitness Level
    await expect(page.locator('text=Choose your fitness level')).toBeVisible();
    await page.click('text=Beginner');
    await page.click('text=Next');
    
    // Step 2: Goals
    await expect(page.locator('text=Select your goals')).toBeVisible();
    await page.click('text=Weight Loss');
    await page.click('text=Muscle Gain');
    await page.click('text=Next');
    
    // Step 3: Equipment
    await expect(page.locator('text=Pick your equipment')).toBeVisible();
    await page.click('text=Bodyweight');
    await page.click('text=Dumbbells');
    await page.click('text=Next');
    
    // Step 4: Time
    await expect(page.locator('text=Set your schedule')).toBeVisible();
    await page.selectOption('select[name="availableTime"]', '30');
    await page.check('input[value="monday"]');
    await page.check('input[value="wednesday"]');
    await page.check('input[value="friday"]');
    await page.click('text=Complete Setup');
    
    // Should see dashboard
    await expect(page.locator('text=Welcome to NeuraFit')).toBeVisible();
    await expect(page.locator('text=Generate AI Workout')).toBeVisible();
  });

  test('should generate and start a workout', async ({ page }) => {
    // Assume we're already on the dashboard (completed onboarding)
    await page.goto('/apps/neurafit');
    
    // Skip onboarding if it appears (for this test, we'll mock completed state)
    const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
    if (onboardingExists) {
      // Complete onboarding quickly
      await page.click('text=Beginner');
      await page.click('text=Next');
      await page.click('text=Weight Loss');
      await page.click('text=Next');
      await page.click('text=Bodyweight');
      await page.click('text=Next');
      await page.click('text=Complete Setup');
    }
    
    // Click Generate AI Workout
    await page.click('text=Generate AI Workout');
    
    // Should see workout generation screen
    await expect(page.locator('text=Ready for Your Workout?')).toBeVisible();
    await page.click('text=Generate AI Workout');
    
    // Wait for workout generation (this might take a moment)
    await expect(page.locator('text=Generating Your Workout')).toBeVisible();
    
    // Should eventually see the generated workout
    await expect(page.locator('text=Start Workout')).toBeVisible({ timeout: 30000 });
    
    // Start the workout
    await page.click('text=Start Workout');
    
    // Should see workout in progress
    await expect(page.locator('text=Complete Exercise')).toBeVisible();
  });

  test('should view progress tracking', async ({ page }) => {
    // Navigate to NeuraFit dashboard
    await page.goto('/apps/neurafit');
    
    // Skip onboarding if needed
    const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
    if (onboardingExists) {
      await page.click('text=Beginner');
      await page.click('text=Next');
      await page.click('text=Weight Loss');
      await page.click('text=Next');
      await page.click('text=Bodyweight');
      await page.click('text=Next');
      await page.click('text=Complete Setup');
    }
    
    // Click View Progress
    await page.click('text=View Progress');
    
    // Should see progress tracking page
    await expect(page.locator('text=Your Fitness Progress')).toBeVisible();
    await expect(page.locator('text=Workouts')).toBeVisible();
    await expect(page.locator('text=Time Trained')).toBeVisible();
    await expect(page.locator('text=Current Streak')).toBeVisible();
  });

  test('should edit profile', async ({ page }) => {
    // Navigate to NeuraFit dashboard
    await page.goto('/apps/neurafit');
    
    // Complete onboarding first
    const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
    if (onboardingExists) {
      await page.click('text=Beginner');
      await page.click('text=Next');
      await page.click('text=Weight Loss');
      await page.click('text=Next');
      await page.click('text=Bodyweight');
      await page.click('text=Next');
      await page.click('text=Complete Setup');
    }
    
    // Click Edit Profile
    await page.click('text=Edit Profile');
    
    // Should be back to onboarding
    await expect(page.locator('text=Choose your fitness level')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/apps/neurafit');
    
    // Check that elements are properly sized for mobile
    const onboardingContainer = page.locator('[data-testid="onboarding-container"]').first();
    if (await onboardingContainer.isVisible()) {
      const boundingBox = await onboardingContainer.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    }
    
    // Check that buttons are touch-friendly (at least 44px height)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const boundingBox = await button.boundingBox();
        expect(boundingBox?.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should handle offline state gracefully', async ({ page, context }) => {
    // Navigate to NeuraFit
    await page.goto('/apps/neurafit');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to generate a workout (should show appropriate error/offline message)
    const onboardingExists = await page.locator('text=Choose your fitness level').isVisible();
    if (onboardingExists) {
      await page.click('text=Beginner');
      await page.click('text=Next');
      await page.click('text=Weight Loss');
      await page.click('text=Next');
      await page.click('text=Bodyweight');
      await page.click('text=Next');
      await page.click('text=Complete Setup');
    }
    
    await page.click('text=Generate AI Workout');
    await page.click('text=Generate AI Workout');
    
    // Should handle offline state (either show offline indicator or error message)
    // The exact behavior depends on implementation
    await expect(page.locator('text=offline').or(page.locator('text=network')).or(page.locator('text=connection'))).toBeVisible({ timeout: 10000 });
  });
});
