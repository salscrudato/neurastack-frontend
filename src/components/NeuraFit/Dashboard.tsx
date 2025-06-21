import {
  Box,
  Button,
  Card,
  CardBody,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import {
  PiClockBold,
  PiHeartBold,
  PiPlayBold,
  PiTrophyBold
} from 'react-icons/pi';

interface DashboardProps {
  onStartWorkout: () => void;
  onViewProgress: () => void;
  onViewHistory?: () => void;
  onEditSpecificSetting?: (step: number) => void;
}

export default function Dashboard({ onStartWorkout, onViewProgress, onViewHistory, onEditSpecificSetting }: DashboardProps) {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const bgColor = useColorModeValue('linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', 'gray.900');
  const glassBorder = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');







  // Get current time for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Box
      h="100%"
      bgGradient={bgColor}
      overflow={{ base: "auto", md: "auto" }}
      overflowX="hidden"
      position="relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
      // Enhanced mobile support with proper viewport constraints
      sx={{
        overscrollBehavior: 'contain',
        '@media (max-width: 768px)': {
          // Ensure dashboard content fits within mobile viewport
          maxHeight: 'calc(100vh - 56px)',
          height: 'calc(100vh - 56px)',
        },
        '@media (min-width: 769px)': {
          maxHeight: 'calc(100vh - 64px)',
          height: 'calc(100vh - 64px)',
        }
      }}
    >
      <VStack
        spacing={{ base: 3, md: 3 }}
        p={{ base: 3, md: 4 }}
        maxW="4xl"
        mx="auto"
        minH="100%"
        w="100%"
        pb={{ base: 4, md: 6 }}
      >
        {/* Personalized Hero Section */}
        <VStack spacing={{ base: 2, md: 2 }} textAlign="center" w="100%" py={{ base: 2, md: 2 }}>
          <Text
            fontSize={{ base: "lg", md: "lg" }}
            fontWeight="medium"
            color="gray.600"
            lineHeight={{ base: "1.4", md: "1.3" }}
            px={{ base: 2, md: 0 }}
          >
            {getGreeting()}. Your AI-powered workout is waiting.
          </Text>
        </VStack>

        {/* Quick Stats Overview */}
        {/* <Card
          bg={cardBg}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={glassBorder}
          borderRadius="2xl"
          w="100%"
          maxW="500px"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
          }}
        >
          <CardBody p={{ base: 6, md: 5 }} textAlign="center">
            <VStack spacing={{ base: 4, md: 3 }}>
              <Icon as={PiHeartBold} boxSize={{ base: 8, md: 7 }} color="purple.400" />
              <VStack spacing={{ base: 2, md: 1 }}>
                <Text fontSize={{ base: "3xl", md: "2xl" }} fontWeight="bold" color="purple.500">
                  {totalMinutesPerWeek}
                </Text>
                <Text fontSize={{ base: "lg", md: "md" }} color={subtextColor} fontWeight="medium">
                  minutes per week
                </Text>
              </VStack>
              <Text fontSize={{ base: "md", md: "sm" }} color="gray.600" textAlign="center" lineHeight="1.4">
                Your weekly fitness commitment
              </Text>
            </VStack>
          </CardBody>
        </Card> */}

        {/* Profile Setup Grid - All 6 Steps */}
        <VStack spacing={{ base: 4, md: 3 }} w="100%" maxW="700px">
          <VStack spacing={{ base: 2, md: 1 }} textAlign="center">
            <Text fontSize={{ base: "lg", md: "md" }} fontWeight="bold" color="gray.700" lineHeight="1.2">
              Complete Your Profile Setup
            </Text>
            <Text fontSize={{ base: "sm", md: "xs" }} color="gray.600" lineHeight="1.4" maxW="500px">
              Customize each section to get the most personalized AI workout experience
            </Text>
          </VStack>
          <SimpleGrid columns={2} spacing={{ base: 3, md: 2 }} w="100%">
            {/* Step 1: Fitness Level */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(0)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={{ base: 3, md: 3 }} textAlign="center" minH={{ base: "80px", md: "70px" }}>
                <VStack spacing={{ base: 2, md: 1 }} justify="center" h="100%">
                  <Icon as={PiTrophyBold} boxSize={{ base: 5, md: 4 }} color="blue.400" />
                  <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="medium" color="gray.700" lineHeight="1.3">
                    Fitness Level
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Step 2: Goals */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(1)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={{ base: 3, md: 3 }} textAlign="center" minH={{ base: "80px", md: "70px" }}>
                <VStack spacing={{ base: 2, md: 1 }} justify="center" h="100%">
                  <Icon as={PiHeartBold} boxSize={{ base: 5, md: 4 }} color="green.400" />
                  <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="medium" color="gray.700" lineHeight="1.3">
                    Goals
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Step 3: Equipment */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(2)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={{ base: 3, md: 3 }} textAlign="center" minH={{ base: "80px", md: "70px" }}>
                <VStack spacing={{ base: 2, md: 1 }} justify="center" h="100%">
                  <Icon as={PiTrophyBold} boxSize={{ base: 5, md: 4 }} color="orange.400" />
                  <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="medium" color="gray.700" lineHeight="1.3">
                    Equipment
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Step 4: Personal Info */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(3)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={{ base: 3, md: 3 }} textAlign="center" minH={{ base: "80px", md: "70px" }}>
                <VStack spacing={{ base: 2, md: 1 }} justify="center" h="100%">
                  <Icon as={PiHeartBold} boxSize={{ base: 5, md: 4 }} color="teal.400" />
                  <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="medium" color="gray.700" lineHeight="1.3">
                    Personal Info
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Step 5: Injuries & Limitations */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(4)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={{ base: 3, md: 3 }} textAlign="center" minH={{ base: "80px", md: "70px" }}>
                <VStack spacing={{ base: 2, md: 1 }} justify="center" h="100%">
                  <Icon as={PiHeartBold} boxSize={{ base: 5, md: 4 }} color="red.400" />
                  <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="medium" color="gray.700" lineHeight="1.3">
                    Injuries & Limitations
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Step 6: Time Preferences */}
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={glassBorder}
              borderRadius="xl"
              as="button"
              onClick={() => onEditSpecificSetting?.(5)}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardBody p={{ base: 3, md: 3 }} textAlign="center" minH={{ base: "80px", md: "70px" }}>
                <VStack spacing={{ base: 2, md: 1 }} justify="center" h="100%">
                  <Icon as={PiClockBold} boxSize={{ base: 5, md: 4 }} color="purple.400" />
                  <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="medium" color="gray.700" lineHeight="1.3">
                    Time Preferences
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>



        {/* Primary Action Section */}
        <VStack spacing={{ base: 4, md: 3 }} w="100%" pt={{ base: 2, md: 1 }}>
          <VStack spacing={{ base: 2, md: 1 }} textAlign="center">
            <Text fontSize={{ base: "lg", md: "md" }} fontWeight="bold" color="gray.700" lineHeight="1.2">
              Ready to Start Your Workout?
            </Text>
            <Text fontSize={{ base: "sm", md: "xs" }} color="gray.600" lineHeight="1.4" maxW="400px">
              Generate a personalized AI workout based on your profile and preferences
            </Text>
          </VStack>

          <Button
            size="lg"
            w="100%"
            maxW="450px"
            h={{ base: "68px", md: "65px" }}
            leftIcon={<Icon as={PiPlayBold} boxSize={{ base: 7, md: 6 }} />}
            onClick={onStartWorkout}
            fontSize={{ base: "xl", md: "xl" }}
            fontWeight="bold"
            borderRadius="2xl"
            bgGradient="linear(135deg, blue.400 0%, purple.500 100%)"
            color="white"
            border="none"
            boxShadow="0 8px 25px rgba(66, 153, 225, 0.3)"
            _hover={{
              bgGradient: "linear(135deg, blue.500 0%, purple.600 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 35px rgba(66, 153, 225, 0.4)"
            }}
            _active={{
              transform: "translateY(-1px)"
            }}
            transition="all 0.3s ease"
          >
            Generate AI Workout
          </Button>

          {/* Secondary Actions */}
          <VStack spacing={{ base: 3, md: 2 }} w="100%">
            <Button
              variant="ghost"
              colorScheme="blue"
              size={{ base: "lg", md: "md" }}
              w="100%"
              maxW="450px"
              h={{ base: "56px", md: "50px" }}
              leftIcon={<Icon as={PiTrophyBold} boxSize={{ base: 6, md: 5 }} />}
              onClick={onViewProgress}
              fontSize={{ base: "lg", md: "md" }}
              fontWeight="medium"
              borderRadius="xl"
              _hover={{
                bg: "blue.50",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s ease"
            >
              View Progress & Analytics
            </Button>

            {onViewHistory && (
              <Button
                variant="ghost"
                colorScheme="purple"
                size={{ base: "lg", md: "md" }}
                w="100%"
                maxW="450px"
                h={{ base: "56px", md: "50px" }}
                leftIcon={<Icon as={PiClockBold} boxSize={{ base: 6, md: 5 }} />}
                onClick={onViewHistory}
                fontSize={{ base: "lg", md: "md" }}
                fontWeight="medium"
                borderRadius="xl"
                _hover={{
                  bg: "purple.50",
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s ease"
              >
                Workout History
              </Button>
            )}
          </VStack>
        </VStack>
      </VStack>
    </Box>
  );
}
