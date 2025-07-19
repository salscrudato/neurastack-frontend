/**
 * Stripe Service
 * 
 * This service handles all Stripe-related operations including:
 * - Payment intent creation and confirmation
 * - Subscription management
 * - Payment processing
 * - Error handling
 */

import type { PaymentIntent, Stripe, StripeElements } from '@stripe/stripe-js';
import { getStripe, getStripeErrorMessage, SUBSCRIPTION_PRICES } from '../lib/stripe-config';

/**
 * Payment processing result interface
 */
export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Subscription creation request interface
 */
export interface CreateSubscriptionRequest {
  userId: string;
  priceId: string;
  paymentMethodId?: string;
  customerEmail?: string;
  customerName?: string;
}

/**
 * Subscription creation result interface
 */
export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  clientSecret?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Payment intent creation request interface
 */
export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  userId: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Stripe Service Class
 * Handles all Stripe operations with proper error handling and validation
 */
class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;

  private constructor() {}

  /**
   * Get singleton instance of StripeService
   */
  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Initialize Stripe instance
   */
  private async initializeStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await getStripe();
    }
    return this.stripe;
  }

  /**
   * Create a payment intent for one-time payments
   * This would typically call your backend API to create the payment intent
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentResult> {
    try {
      // In a real application, this would call your backend API
      // For now, we'll simulate the API call
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          userId: request.userId,
          description: request.description || 'NeuraStack Premium Subscription',
          metadata: {
            userId: request.userId,
            ...request.metadata,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { client_secret, payment_intent } = await response.json();

      return {
        success: true,
        paymentIntent: {
          id: payment_intent.id,
          client_secret,
          status: payment_intent.status,
        } as PaymentIntent,
      };
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      
      return {
        success: false,
        error: {
          code: 'PAYMENT_INTENT_CREATION_FAILED',
          message: getStripeErrorMessage(error),
          details: error,
        },
      };
    }
  }

  /**
   * Confirm payment with Stripe Elements
   */
  async confirmPayment(
    _clientSecret: string,
    elements: StripeElements,
    returnUrl?: string
  ): Promise<PaymentResult> {
    try {
      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || window.location.origin + '/subscription/success',
        },
        redirect: 'if_required',
      });

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || 'PAYMENT_CONFIRMATION_FAILED',
            message: getStripeErrorMessage(error),
            details: error,
          },
        };
      }

      return {
        success: true,
        paymentIntent,
      };
    } catch (error: any) {
      console.error('Failed to confirm payment:', error);
      
      return {
        success: false,
        error: {
          code: 'PAYMENT_CONFIRMATION_FAILED',
          message: getStripeErrorMessage(error),
          details: error,
        },
      };
    }
  }

  /**
   * Create a subscription
   * This would typically call your backend API to create the subscription
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResult> {
    try {
      // TODO: Replace with actual backend API call
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: request.userId,
          priceId: request.priceId,
          paymentMethodId: request.paymentMethodId,
          customerEmail: request.customerEmail,
          customerName: request.customerName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { subscription_id, client_secret } = await response.json();

      return {
        success: true,
        subscriptionId: subscription_id,
        clientSecret: client_secret,
      };
    } catch (error: any) {
      console.error('Failed to create subscription:', error);
      
      return {
        success: false,
        error: {
          code: 'SUBSCRIPTION_CREATION_FAILED',
          message: getStripeErrorMessage(error),
          details: error,
        },
      };
    }
  }

  /**
   * Process premium upgrade payment
   * This is a simplified version that creates a one-time payment for premium access
   */
  async processPremiumUpgrade(userId: string, userEmail?: string): Promise<PaymentResult> {
    try {
      // For now, we'll use a one-time payment for premium access
      // In a real application, you might want to use subscriptions instead
      const premiumPrice = SUBSCRIPTION_PRICES.premium.monthly;
      
      return await this.createPaymentIntent({
        amount: premiumPrice.amount,
        currency: premiumPrice.currency,
        userId,
        description: 'NeuraStack Premium Upgrade - Monthly Access',
        metadata: {
          userId,
          tier: 'premium',
          duration: '30 days',
          userEmail: userEmail || '',
        },
      });
    } catch (error: any) {
      console.error('Failed to process premium upgrade:', error);
      
      return {
        success: false,
        error: {
          code: 'PREMIUM_UPGRADE_FAILED',
          message: getStripeErrorMessage(error),
          details: error,
        },
      };
    }
  }

  /**
   * Get pricing information
   */
  getPricingInfo() {
    return SUBSCRIPTION_PRICES;
  }

  /**
   * Validate payment method
   */
  async validatePaymentMethod(elements: StripeElements): Promise<{ isValid: boolean; error?: string }> {
    try {
      const stripe = await this.initializeStripe();
      if (!stripe) {
        return { isValid: false, error: 'Stripe failed to initialize' };
      }

      // Submit the form to validate all elements
      const { error } = await elements.submit();
      
      if (error) {
        return { 
          isValid: false, 
          error: getStripeErrorMessage(error) 
        };
      }

      return { isValid: true };
    } catch (error: any) {
      return { 
        isValid: false, 
        error: getStripeErrorMessage(error) 
      };
    }
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();
