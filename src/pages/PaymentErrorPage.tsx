/**
 * Payment Error Page
 * 
 * This page is displayed when a payment fails or encounters an error,
 * providing helpful information and next steps to the user.
 */


import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Button,
    Card,
    CardBody,
    HStack,
    Icon,
    Text,
    VStack,
} from '@chakra-ui/react';
import { PiArrowLeftBold, PiCreditCardBold, PiXCircleBold } from 'react-icons/pi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStripeErrorMessage } from '../lib/stripe-config';

export default function PaymentErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Colors matching the app theme
  const bgColor = '#FAFBFC';
  const cardBg = '#FFFFFF';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const mutedColor = '#64748B';
  const primaryColor = '#4F9CF9';
  const errorColor = '#E53E3E';

  // Get error details from URL params
  const errorType = searchParams.get('error');
  const errorMessage = searchParams.get('error_description');

  const handleRetryPayment = () => {
    navigate('/subscription');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    window.open('mailto:support@neurastack.ai?subject=Payment Issue', '_blank');
  };

  // Get user-friendly error message
  const displayErrorMessage = errorMessage 
    ? getStripeErrorMessage({ message: errorMessage, code: errorType })
    : 'We encountered an issue processing your payment. Please try again.';

  return (
    <Box
      w="100%"
      h="100vh"
      bg={bgColor}
      overflow="auto"
      pt={{ base: "calc(56px + 16px)", md: "calc(60px + 24px)" }}
      pb={{ base: "calc(env(safe-area-inset-bottom, 0px) + 16px)", md: "24px" }}
      px={{ base: 4, md: 4 }}
    >
      <VStack spacing={8} w="100%" maxW="600px" mx="auto" py={8}>
        {/* Error Icon */}
        <Box
          w={20}
          h={20}
          bg={errorColor}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={PiXCircleBold} w={12} h={12} color="white" />
        </Box>

        {/* Error Message */}
        <VStack spacing={2} textAlign="center">
          <Text fontSize="2xl" fontWeight="700" color={textColor}>
            Payment Failed
          </Text>
          <Text fontSize="lg" color={mutedColor}>
            We couldn't process your payment
          </Text>
        </VStack>

        {/* Error Details Card */}
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          w="100%"
        >
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  {displayErrorMessage}
                </AlertDescription>
              </Alert>

              <VStack spacing={3} align="start">
                <Text fontSize="md" color={textColor} fontWeight="500">
                  Common solutions:
                </Text>
                
                <VStack spacing={2} align="start" pl={4}>
                  <Text fontSize="sm" color={textColor}>
                    • Check that your card details are correct
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    • Ensure your card has sufficient funds
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    • Verify that your card supports online payments
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    • Try a different payment method
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    • Contact your bank if the issue persists
                  </Text>
                </VStack>
              </VStack>

              {(errorType || errorMessage) && (
                <Box
                  bg="#FEF2F2"
                  border="1px solid"
                  borderColor="#FECACA"
                  borderRadius="md"
                  p={3}
                >
                  <Text fontSize="xs" color={mutedColor}>
                    <strong>Error Details:</strong>
                  </Text>
                  {errorType && (
                    <Text fontSize="xs" color={mutedColor}>
                      <strong>Type:</strong> {errorType}
                    </Text>
                  )}
                  {errorMessage && (
                    <Text fontSize="xs" color={mutedColor}>
                      <strong>Message:</strong> {errorMessage}
                    </Text>
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <VStack spacing={3} w="100%">
          <Button
            bg={primaryColor}
            color="white"
            size="lg"
            borderRadius="xl"
            w="100%"
            onClick={handleRetryPayment}
            leftIcon={<Icon as={PiCreditCardBold} />}
            _hover={{
              bg: '#3182CE',
              transform: 'translateY(-1px)',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
          >
            Try Payment Again
          </Button>

          <HStack spacing={3} w="100%">
            <Button
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="md"
              borderRadius="xl"
              flex={1}
              onClick={handleGoBack}
              leftIcon={<Icon as={PiArrowLeftBold} />}
              _hover={{
                bg: '#F7FAFC',
              }}
            >
              Go Back
            </Button>

            <Button
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              size="md"
              borderRadius="xl"
              flex={1}
              onClick={handleContactSupport}
              _hover={{
                bg: '#F7FAFC',
              }}
            >
              Contact Support
            </Button>
          </HStack>
        </VStack>

        {/* Help Note */}
        <Text fontSize="sm" color={mutedColor} textAlign="center" maxW="400px">
          If you continue to experience issues, our support team is here to help.
          We'll work with you to resolve any payment problems quickly.
        </Text>
      </VStack>
    </Box>
  );
}
