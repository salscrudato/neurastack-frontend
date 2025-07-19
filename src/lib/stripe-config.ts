/**
 * Stripe Configuration
 * 
 * This file contains the Stripe configuration and initialization logic
 * for the NeuraStack frontend application.
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error(
    'Missing Stripe publishable key. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.'
  );
}

// Initialize Stripe instance (singleton pattern)
let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance
 * This function ensures we only initialize Stripe once and reuse the same instance
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

/**
 * Stripe configuration constants
 */
export const STRIPE_CONFIG = {
  // Publishable key for client-side operations
  publishableKey: stripePublishableKey,
  
  // Stripe Elements appearance configuration
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#4F9CF9',
      colorBackground: '#ffffff',
      colorText: '#1E293B',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#ffffff',
      },
      '.Input:focus': {
        border: '2px solid #4F9CF9',
        boxShadow: '0 0 0 1px #4F9CF9',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: '8px',
      },
    },
  },
  
  // Payment Element options
  paymentElementOptions: {
    layout: 'tabs' as const,
    paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
  },
} as const;

/**
 * Test card numbers for development
 * These are official Stripe test card numbers that can be used during development
 */
export const STRIPE_TEST_CARDS = {
  // Visa - Success
  visa: '4242424242424242',
  
  // Visa (debit) - Success
  visaDebit: '4000056655665556',
  
  // Mastercard - Success
  mastercard: '5555555555554444',
  
  // American Express - Success
  amex: '378282246310005',
  
  // Declined card
  declined: '4000000000000002',
  
  // Insufficient funds
  insufficientFunds: '4000000000009995',
  
  // Expired card
  expired: '4000000000000069',
  
  // Incorrect CVC
  incorrectCvc: '4000000000000127',
  
  // Processing error
  processingError: '4000000000000119',
} as const;

/**
 * Common Stripe error messages and their user-friendly equivalents
 */
export const STRIPE_ERROR_MESSAGES = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'Your card\'s security code is incorrect. Please check and try again.',
  insufficient_funds: 'Your card has insufficient funds. Please try a different card.',
  invalid_number: 'Your card number is invalid. Please check and try again.',
  invalid_expiry_month: 'Your card\'s expiration month is invalid.',
  invalid_expiry_year: 'Your card\'s expiration year is invalid.',
  invalid_cvc: 'Your card\'s security code is invalid.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  generic: 'An unexpected error occurred. Please try again or contact support.',
} as const;

/**
 * Subscription pricing configuration
 * This should match your Stripe product/price configuration
 */
export const SUBSCRIPTION_PRICES = {
  premium: {
    monthly: {
      priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
      amount: 2999, // $29.99 in cents
      currency: 'usd',
      interval: 'month',
    },
    yearly: {
      priceId: 'price_premium_yearly', // Replace with actual Stripe price ID
      amount: 29999, // $299.99 in cents
      currency: 'usd',
      interval: 'year',
    },
  },
} as const;

/**
 * Format amount for display
 * Converts cents to dollars with proper formatting
 */
export const formatAmount = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

/**
 * Get user-friendly error message from Stripe error
 */
export const getStripeErrorMessage = (error: any): string => {
  if (!error) return STRIPE_ERROR_MESSAGES.generic;
  
  const errorCode = error.code || error.type;
  
  if (errorCode in STRIPE_ERROR_MESSAGES) {
    return STRIPE_ERROR_MESSAGES[errorCode as keyof typeof STRIPE_ERROR_MESSAGES];
  }
  
  // Return the error message if it's user-friendly, otherwise use generic
  if (error.message && error.message.length < 100) {
    return error.message;
  }
  
  return STRIPE_ERROR_MESSAGES.generic;
};
