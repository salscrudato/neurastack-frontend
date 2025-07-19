/**
 * Stripe Test Utilities
 * 
 * Utility functions for testing Stripe integration in development
 */

import { STRIPE_TEST_CARDS } from '../lib/stripe-config';

/**
 * Test scenarios for Stripe integration
 */
export const STRIPE_TEST_SCENARIOS = {
  successful_payment: {
    card: STRIPE_TEST_CARDS.visa,
    expiry: '12/25',
    cvc: '123',
    zip: '12345',
    description: 'Standard successful payment test',
  },
  declined_payment: {
    card: STRIPE_TEST_CARDS.declined,
    expiry: '12/25',
    cvc: '123',
    zip: '12345',
    description: 'Test declined payment handling',
  },
  insufficient_funds: {
    card: STRIPE_TEST_CARDS.insufficientFunds,
    expiry: '12/25',
    cvc: '123',
    zip: '12345',
    description: 'Test insufficient funds error',
  },
  expired_card: {
    card: STRIPE_TEST_CARDS.expired,
    expiry: '12/20', // Past date
    cvc: '123',
    zip: '12345',
    description: 'Test expired card error',
  },
} as const;

/**
 * Log test scenario information to console
 */
export const logTestScenario = (scenarioName: keyof typeof STRIPE_TEST_SCENARIOS) => {
  const scenario = STRIPE_TEST_SCENARIOS[scenarioName];
  
  console.group(`🧪 Stripe Test Scenario: ${scenarioName}`);
  console.log('📋 Description:', scenario.description);
  console.log('💳 Card Number:', scenario.card);
  console.log('📅 Expiry:', scenario.expiry);
  console.log('🔒 CVC:', scenario.cvc);
  console.log('📍 ZIP:', scenario.zip);
  console.groupEnd();
};

/**
 * Validate test environment
 */
export const validateTestEnvironment = (): boolean => {
  const checks = [
    {
      name: 'Development Mode',
      check: () => import.meta.env.DEV,
      message: 'Should be in development mode for testing',
    },
    {
      name: 'Stripe Publishable Key',
      check: () => !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      message: 'Stripe publishable key should be set',
    },
    {
      name: 'Test Key Format',
      check: () => import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_'),
      message: 'Should use test publishable key (pk_test_...)',
    },
  ];

  console.group('🔍 Stripe Test Environment Validation');
  
  let allPassed = true;
  
  checks.forEach(({ name, check, message }) => {
    const passed = check();
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${message}`);
    if (!passed) allPassed = false;
  });
  
  console.groupEnd();
  
  if (allPassed) {
    console.log('🎉 All environment checks passed! Ready for testing.');
  } else {
    console.warn('⚠️ Some environment checks failed. Please review configuration.');
  }
  
  return allPassed;
};

/**
 * Test payment form validation
 */
export const testPaymentFormValidation = () => {
  console.group('🧪 Payment Form Validation Tests');
  
  const testCases = [
    {
      name: 'Valid Visa Card',
      card: '4242424242424242',
      expected: 'valid',
    },
    {
      name: 'Invalid Card Number',
      card: '1234567890123456',
      expected: 'invalid',
    },
    {
      name: 'Incomplete Card Number',
      card: '4242424242',
      expected: 'incomplete',
    },
  ];
  
  testCases.forEach(({ name, card, expected }) => {
    console.log(`📝 ${name}: ${card} (expected: ${expected})`);
  });
  
  console.groupEnd();
};

/**
 * Display test instructions
 */
export const displayTestInstructions = () => {
  console.group('📖 Stripe Integration Test Instructions');
  
  console.log('1. 🌐 Navigate to the subscription page');
  console.log('2. 🔘 Click "Upgrade to Premium" button');
  console.log('3. 💳 Use test card: 4242 4242 4242 4242');
  console.log('4. 📅 Enter any future expiry (e.g., 12/25)');
  console.log('5. 🔒 Enter any 3-digit CVC (e.g., 123)');
  console.log('6. ✅ Complete the payment');
  console.log('7. 🎉 Verify success message appears');
  
  console.log('\n🚨 Error Testing:');
  console.log('- Use card 4000 0000 0000 0002 for declined payment');
  console.log('- Use card 4000 0000 0000 9995 for insufficient funds');
  console.log('- Use card 4000 0000 0000 0069 for expired card');
  
  console.groupEnd();
};

/**
 * Run all test validations
 */
export const runStripeTests = () => {
  console.clear();
  console.log('🚀 Starting Stripe Integration Tests...\n');
  
  validateTestEnvironment();
  console.log('');
  
  displayTestInstructions();
  console.log('');
  
  testPaymentFormValidation();
  console.log('');
  
  console.log('🎯 Ready to test! Open the subscription page and try the payment flow.');
};

// Auto-run tests in development mode
if (import.meta.env.DEV) {
  // Delay to ensure console is ready
  setTimeout(() => {
    runStripeTests();
  }, 1000);
}
