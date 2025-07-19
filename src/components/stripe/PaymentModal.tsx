/**
 * Payment Modal Component
 * 
 * This component provides a modal interface for payment processing
 * with proper success and error handling.
 */

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Button,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Divider,
} from '@chakra-ui/react';
import { PiCheckCircleBold, PiCrownBold, PiXCircleBold } from 'react-icons/pi';
import { StripeProvider } from './StripeProvider';
import { PaymentForm } from './PaymentForm';
import { formatAmount } from '../../lib/stripe-config';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntent: any) => void;
  amount: number;
  currency: string;
  title?: string;
  description?: string;
  features?: string[];
}

type PaymentState = 'form' | 'processing' | 'success' | 'error';

/**
 * Payment Modal Component
 * Handles the complete payment flow in a modal interface
 */
export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  currency,
  title = 'Upgrade to Premium',
  description = 'Get access to premium features and unlimited usage',
  features = [
    'Unlimited AI requests',
    'Access to all premium models',
    'Priority processing',
    'Advanced analytics',
    'Email support',
  ],
}) => {
  const [paymentState, setPaymentState] = useState<PaymentState>('form');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Colors matching the app theme
  const bgColor = '#FFFFFF';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const mutedColor = '#64748B';
  const primaryColor = '#4F9CF9';
  const successColor = '#38A169';
  const errorColor = '#E53E3E';

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentResult(paymentIntent);
    setPaymentState('success');
    
    // Call the parent success handler after a short delay
    setTimeout(() => {
      onSuccess(paymentIntent);
      handleClose();
    }, 2000);
  };

  /**
   * Handle payment error
   */
  const handlePaymentError = (error: string) => {
    setErrorMessage(error);
    setPaymentState('error');
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setPaymentState('form');
    setPaymentResult(null);
    setErrorMessage('');
    onClose();
  };

  /**
   * Retry payment
   */
  const handleRetry = () => {
    setPaymentState('form');
    setErrorMessage('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg" 
      closeOnOverlayClick={paymentState === 'form'}
      closeOnEsc={paymentState === 'form'}
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        mx={4}
        my={8}
      >
        <ModalHeader>
          <HStack>
            <Icon as={PiCrownBold} w={6} h={6} color={primaryColor} />
            <Text fontSize="xl" fontWeight="700" color={textColor}>
              {title}
            </Text>
          </HStack>
        </ModalHeader>
        
        {paymentState === 'form' && <ModalCloseButton />}

        <ModalBody pb={6}>
          {/* Payment Form State */}
          {paymentState === 'form' && (
            <VStack spacing={6} align="stretch">
              {/* Plan Details */}
              <Box>
                <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                  Premium Plan - {formatAmount(amount, currency)}/month
                </Text>
                <Text fontSize="sm" color={mutedColor} mb={4}>
                  {description}
                </Text>
                
                <VStack align="start" spacing={2}>
                  {features.map((feature, index) => (
                    <HStack key={index} spacing={2}>
                      <Icon as={PiCheckCircleBold} w={4} h={4} color={successColor} />
                      <Text fontSize="sm" color={textColor}>
                        {feature}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <Divider borderColor={borderColor} />

              {/* Payment Form */}
              <StripeProvider>
                <PaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  amount={amount}
                  currency={currency}
                  buttonText={`Pay ${formatAmount(amount, currency)}`}
                  description="Complete your upgrade to premium"
                />
              </StripeProvider>
            </VStack>
          )}

          {/* Success State */}
          {paymentState === 'success' && (
            <VStack spacing={6} align="center" py={8}>
              <Icon as={PiCheckCircleBold} w={16} h={16} color={successColor} />
              <VStack spacing={2} align="center">
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Payment Successful!
                </Text>
                <Text fontSize="md" color={mutedColor} textAlign="center">
                  Welcome to NeuraStack Premium! Your account has been upgraded.
                </Text>
              </VStack>
              
              {paymentResult && (
                <Box
                  bg="#F7FAFC"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={4}
                  w="100%"
                >
                  <Text fontSize="sm" color={mutedColor}>
                    <strong>Payment ID:</strong> {paymentResult.id}
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    <strong>Amount:</strong> {formatAmount(paymentResult.amount, paymentResult.currency)}
                  </Text>
                </Box>
              )}
            </VStack>
          )}

          {/* Error State */}
          {paymentState === 'error' && (
            <VStack spacing={6} align="center" py={8}>
              <Icon as={PiXCircleBold} w={16} h={16} color={errorColor} />
              <VStack spacing={2} align="center">
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Payment Failed
                </Text>
                <Text fontSize="md" color={mutedColor} textAlign="center">
                  We couldn't process your payment. Please try again.
                </Text>
              </VStack>

              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  {errorMessage}
                </AlertDescription>
              </Alert>

              <HStack spacing={3}>
                <Button
                  variant="outline"
                  borderColor={borderColor}
                  color={textColor}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  bg={primaryColor}
                  color="white"
                  onClick={handleRetry}
                  _hover={{ bg: '#3182CE' }}
                >
                  Try Again
                </Button>
              </HStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
