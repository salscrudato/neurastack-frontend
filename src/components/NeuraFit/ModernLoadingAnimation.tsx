import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, memo } from 'react';

const MotionBox = motion(Box);

interface ModernLoadingAnimationProps {
  isVisible: boolean;
  messages?: string[];
  title?: string;
}

const defaultMessages = [
  'Analyzing your fitness profile...',
  'Selecting optimal exercises...',
  'Customizing workout intensity...',
  'Finalizing your personalized routine...',
  'Almost ready!'
];

const ModernLoadingAnimation = memo(function ModernLoadingAnimation({
  isVisible,
  messages = defaultMessages,
  title = 'Creating Your Workout'
}: ModernLoadingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessageIndex(0);
      setProgress(0);
      return;
    }

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible, messages.length]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <MotionBox
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.8)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MotionBox
          bg={bgColor}
          borderRadius="2xl"
          p={{ base: 8, md: 12 }}
          maxW={{ base: "90%", md: "md" }}
          w="full"
          mx={4}
          shadow="2xl"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
        >
          <VStack spacing={8} align="stretch">
            {/* Title */}
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              color={textColor}
              textAlign="center"
            >
              {title}
            </Text>

            {/* Modern Wave Animation */}
            <Box position="relative" h="60px" overflow="hidden">
              {[...Array(5)].map((_, i) => (
                <MotionBox
                  key={i}
                  position="absolute"
                  top="50%"
                  left={0}
                  right={0}
                  h="4px"
                  bg={`linear-gradient(90deg, 
                    rgba(59, 130, 246, 0.1) 0%, 
                    rgba(59, 130, 246, 0.8) 50%, 
                    rgba(147, 51, 234, 0.8) 100%
                  )`}
                  borderRadius="full"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  style={{
                    transform: `translateY(${(i - 2) * 8}px)`,
                    opacity: 1 - Math.abs(i - 2) * 0.2
                  }}
                />
              ))}
            </Box>

            {/* Progress Bar */}
            <Box>
              <Box
                w="full"
                h="6px"
                bg={useColorModeValue('gray.200', 'gray.700')}
                borderRadius="full"
                overflow="hidden"
              >
                <MotionBox
                  h="full"
                  bg="linear-gradient(90deg, #3B82F6, #9333EA)"
                  borderRadius="full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </Box>
              <Text
                fontSize="sm"
                color={subtextColor}
                textAlign="center"
                mt={2}
              >
                {Math.round(progress)}% Complete
              </Text>
            </Box>

            {/* Rotating Messages */}
            <Box minH="50px" display="flex" alignItems="center" justifyContent="center">
              <AnimatePresence mode="wait">
                <MotionBox
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color={subtextColor}
                    textAlign="center"
                    fontWeight="medium"
                  >
                    {messages[currentMessageIndex]}
                  </Text>
                </MotionBox>
              </AnimatePresence>
            </Box>

            {/* Pulsing Dots */}
            <Box display="flex" justifyContent="center" gap={2}>
              {[...Array(3)].map((_, i) => (
                <MotionBox
                  key={i}
                  w="8px"
                  h="8px"
                  bg="blue.500"
                  borderRadius="full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </Box>
          </VStack>
        </MotionBox>
      </MotionBox>
    </AnimatePresence>
  );
});

export default ModernLoadingAnimation;
