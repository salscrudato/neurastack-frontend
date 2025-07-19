/**
 * Payment Success Page
 * 
 * This page is displayed after a successful payment to provide
 * confirmation and next steps to the user.
 */

import {
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    HStack,
    Icon,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { PiArrowRightBold, PiCheckCircleBold, PiCrownBold } from 'react-icons/pi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  // Colors matching the app theme
  const bgColor = '#FAFBFC';
  const cardBg = '#FFFFFF';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const mutedColor = '#64748B';
  const primaryColor = '#4F9CF9';
  const successColor = '#38A169';

  // Get payment details from URL params
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentStatus = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    // If no payment details, redirect to subscription page
    if (!paymentIntentId && !paymentStatus) {
      navigate('/subscription');
    }
  }, [paymentIntentId, paymentStatus, navigate]);

  const handleContinue = () => {
    navigate('/chat');
  };

  const handleViewSubscription = () => {
    navigate('/subscription');
  };

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
        {/* Success Icon */}
        <Box
          w={20}
          h={20}
          bg={successColor}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={PiCheckCircleBold} w={12} h={12} color="white" />
        </Box>

        {/* Success Message */}
        <VStack spacing={2} textAlign="center">
          <Text fontSize="2xl" fontWeight="700" color={textColor}>
            Payment Successful!
          </Text>
          <Text fontSize="lg" color={mutedColor}>
            Welcome to NeuraStack Premium
          </Text>
        </VStack>

        {/* Payment Details Card */}
        <Card
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          w="100%"
        >
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={PiCrownBold} w={6} h={6} color="gold" />
                <Text fontSize="lg" fontWeight="600" color={textColor}>
                  Premium Features Activated
                </Text>
              </HStack>

              <Divider borderColor={borderColor} />

              <VStack spacing={3} align="start">
                <Text fontSize="md" color={textColor} fontWeight="500">
                  You now have access to:
                </Text>
                
                <VStack spacing={2} align="start" pl={4}>
                  <HStack>
                    <Icon as={PiCheckCircleBold} w={4} h={4} color={successColor} />
                    <Text fontSize="sm" color={textColor}>
                      Unlimited AI requests per day
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={PiCheckCircleBold} w={4} h={4} color={successColor} />
                    <Text fontSize="sm" color={textColor}>
                      Access to all premium AI models
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={PiCheckCircleBold} w={4} h={4} color={successColor} />
                    <Text fontSize="sm" color={textColor}>
                      Priority processing and faster responses
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={PiCheckCircleBold} w={4} h={4} color={successColor} />
                    <Text fontSize="sm" color={textColor}>
                      Advanced analytics and insights
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={PiCheckCircleBold} w={4} h={4} color={successColor} />
                    <Text fontSize="sm" color={textColor}>
                      Premium customer support
                    </Text>
                  </HStack>
                </VStack>
              </VStack>

              {paymentIntentId && (
                <>
                  <Divider borderColor={borderColor} />
                  <Box
                    bg="#F7FAFC"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={3}
                  >
                    <Text fontSize="xs" color={mutedColor}>
                      <strong>Payment ID:</strong> {paymentIntentId}
                    </Text>
                    <Text fontSize="xs" color={mutedColor}>
                      <strong>User:</strong> {user?.email || 'N/A'}
                    </Text>
                  </Box>
                </>
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
            onClick={handleContinue}
            rightIcon={<Icon as={PiArrowRightBold} />}
            _hover={{
              bg: '#3182CE',
              transform: 'translateY(-1px)',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
          >
            Start Using Premium Features
          </Button>

          <Button
            variant="outline"
            borderColor={borderColor}
            color={textColor}
            size="md"
            borderRadius="xl"
            w="100%"
            onClick={handleViewSubscription}
            _hover={{
              bg: '#F7FAFC',
            }}
          >
            View Subscription Details
          </Button>
        </VStack>

        {/* Support Note */}
        <Text fontSize="sm" color={mutedColor} textAlign="center" maxW="400px">
          If you have any questions about your subscription or need help getting started,
          please don't hesitate to contact our support team.
        </Text>
      </VStack>
    </Box>
  );
}
