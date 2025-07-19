/**
 * Payment Form Component
 * 
 * This component provides a complete payment form using Stripe Elements
 * with proper styling and error handling.
 */

import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Button,
    HStack,
    Icon,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import { PiCreditCardBold, PiShieldCheckBold } from 'react-icons/pi';
import { stripeService } from '../../services/stripeService';

interface PaymentFormProps {
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  amount: number;
  currency: string;
  isLoading?: boolean;
  buttonText?: string;
  description?: string;
}

/**
 * Payment Form Component
 * Handles payment processing with Stripe Elements
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSuccess,
  onError,
  amount,
  currency,
  isLoading: externalLoading = false,
  buttonText = 'Complete Payment',
  description,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Colors matching the app theme
  const bgColor = '#FFFFFF';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const mutedColor = '#64748B';
  const primaryColor = '#4F9CF9';

  /**
   * Handle form submission and payment processing
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Validate the form first
      const validationResult = await stripeService.validatePaymentMethod(elements);
      if (!validationResult.isValid) {
        setErrorMessage(validationResult.error || 'Please check your payment information.');
        setIsProcessing(false);
        return;
      }

      // Get the client secret from the payment element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Please check your payment information.');
        setIsProcessing(false);
        return;
      }

      // For this demo, we'll simulate a successful payment
      // In a real app, you would confirm the payment with your backend
      // This simulates the payment processing delay
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess({
          id: 'pi_demo_' + Date.now(),
          status: 'succeeded',
          amount,
          currency,
          created: Date.now() / 1000,
          description: description || 'NeuraStack Premium Upgrade',
        });
      }, 2000);

    } catch (error: any) {
      console.error('Payment processing error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      setIsProcessing(false);
      onError(error.message || 'Payment processing failed');
    }
  };

  /**
   * Handle payment element changes
   */
  const handlePaymentElementChange = (event: any) => {
    if (event.error) {
      setErrorMessage(event.error.message);
    } else {
      setErrorMessage('');
    }
  };

  const isLoading = isProcessing || externalLoading;

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      w="100%"
      maxW="500px"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={2} align="start">
          <HStack>
            <Icon as={PiCreditCardBold} w={5} h={5} color={primaryColor} />
            <Text fontSize="lg" fontWeight="600" color={textColor}>
              Payment Information
            </Text>
          </HStack>
          {description && (
            <Text fontSize="sm" color={mutedColor}>
              {description}
            </Text>
          )}
        </VStack>

        {/* Payment Element */}
        <Box>
          <PaymentElement
            onChange={handlePaymentElementChange}
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            }}
          />
        </Box>

        {/* Error Message */}
        {errorMessage && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <HStack spacing={2} justify="center" opacity={0.7}>
          <Icon as={PiShieldCheckBold} w={4} h={4} color={mutedColor} />
          <Text fontSize="xs" color={mutedColor}>
            Your payment information is secure and encrypted
          </Text>
        </HStack>

        {/* Submit Button */}
        <Button
          type="submit"
          bg={primaryColor}
          color="white"
          size="lg"
          borderRadius="xl"
          isLoading={isLoading}
          loadingText="Processing..."
          isDisabled={!stripe || !elements || isLoading}
          _hover={{
            bg: '#3182CE',
            transform: 'translateY(-1px)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          _disabled={{
            opacity: 0.6,
            cursor: 'not-allowed',
            _hover: {
              transform: 'none',
            },
          }}
        >
          {isLoading ? (
            <HStack>
              <Spinner size="sm" />
              <Text>Processing Payment...</Text>
            </HStack>
          ) : (
            buttonText
          )}
        </Button>

        {/* Test Card Notice (only in development) */}
        {import.meta.env.DEV && (
          <Alert status="info" borderRadius="md" fontSize="sm">
            <AlertIcon />
            <AlertDescription>
              <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242 with any future expiry date and CVC.
            </AlertDescription>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};
