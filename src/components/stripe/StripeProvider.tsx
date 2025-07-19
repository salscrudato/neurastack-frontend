/**
 * Stripe Provider Component
 * 
 * This component wraps the application with Stripe Elements provider
 * to enable Stripe functionality throughout the app.
 */

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, STRIPE_CONFIG } from '../../lib/stripe-config';

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

/**
 * Stripe Provider Component
 * Provides Stripe context to child components
 */
export const StripeProvider: React.FC<StripeProviderProps> = ({ 
  children, 
  clientSecret 
}) => {
  const stripePromise = getStripe();

  const options = {
    clientSecret,
    appearance: STRIPE_CONFIG.appearance,
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : { appearance: STRIPE_CONFIG.appearance }}>
      {children}
    </Elements>
  );
};
