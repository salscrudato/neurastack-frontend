import { Box, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';
import { PiCheckCircleBold } from 'react-icons/pi';

const MotionBox = motion(Box);

interface SuccessAnimationProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  onComplete?: () => void;
}

const SuccessAnimation = memo(function SuccessAnimation({
  isVisible,
  title = 'Success!',
  message = 'Your feedback has been submitted',
  onComplete
}: SuccessAnimationProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  if (!isVisible) return null;

  return (
    <AnimatePresence onExitComplete={onComplete}>
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
          maxW={{ base: "90%", md: "sm" }}
          w="full"
          mx={4}
          shadow="2xl"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 50 }}
          transition={{ 
            duration: 0.5, 
            type: "spring", 
            stiffness: 300,
            damping: 20
          }}
        >
          <VStack spacing={6} align="center">
            {/* Success Icon with Animation */}
            <MotionBox
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2,
                duration: 0.6,
                type: "spring",
                stiffness: 200
              }}
            >
              <MotionBox
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <Icon
                  as={PiCheckCircleBold}
                  boxSize={{ base: 16, md: 20 }}
                  color="green.500"
                />
              </MotionBox>
            </MotionBox>

            {/* Success Message */}
            <VStack spacing={2} textAlign="center">
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color={textColor}
                >
                  {title}
                </Text>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color={subtextColor}
                >
                  {message}
                </Text>
              </MotionBox>
            </VStack>

            {/* Confetti-like particles */}
            <Box position="relative" w="full" h="20px">
              {[...Array(8)].map((_, i) => (
                <MotionBox
                  key={i}
                  position="absolute"
                  w="4px"
                  h="4px"
                  bg={`hsl(${i * 45}, 70%, 60%)`}
                  borderRadius="full"
                  left={`${10 + i * 10}%`}
                  initial={{ 
                    y: 0, 
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    y: [-20, -40, -20],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    delay: 0.5 + i * 0.1,
                    duration: 1.5,
                    repeat: 1,
                    ease: "easeOut"
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

export default SuccessAnimation;
