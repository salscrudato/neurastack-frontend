import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';

// Helper function to format time remaining
const formatTimeRemaining = (milliseconds: number): string => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
};

export function RateLimitModal() {
  const rateLimitModal = useChatStore((s) => s.rateLimitModal);
  const closeRateLimitModal = useChatStore((s) => s.closeRateLimitModal);
  const [timeRemaining, setTimeRemaining] = useState(rateLimitModal.timeRemaining);

  // Update countdown every second
  useEffect(() => {
    if (!rateLimitModal.isOpen) return;

    setTimeRemaining(rateLimitModal.timeRemaining);
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          closeRateLimitModal();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitModal.isOpen, rateLimitModal.timeRemaining, closeRateLimitModal]);

  return (
    <Modal 
      isOpen={rateLimitModal.isOpen} 
      onClose={closeRateLimitModal}
      isCentered
      size="sm"
    >
      <ModalOverlay 
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="blur(8px)"
      />
      <ModalContent
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(20px)"
        borderRadius="16px"
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        mx={4}
      >
        <ModalHeader
          fontSize="lg"
          fontWeight="600"
          color="gray.800"
          pb={2}
        >
          Rate Limit Reached
        </ModalHeader>
        
        <ModalBody pb={4}>
          <VStack spacing={3} align="stretch">
            <Text color="gray.600" fontSize="sm" lineHeight="1.5">
              Guest users can send one message per minute to ensure fair usage for everyone.
            </Text>
            
            <Box
              bg="rgba(79, 156, 249, 0.1)"
              border="1px solid rgba(79, 156, 249, 0.2)"
              borderRadius="12px"
              p={3}
              textAlign="center"
            >
              <Text fontSize="sm" color="gray.700" mb={1}>
                Please try again in:
              </Text>
              <Text fontSize="lg" fontWeight="600" color="#4F9CF9">
                {formatTimeRemaining(timeRemaining)}
              </Text>
            </Box>
            
            <Text color="gray.500" fontSize="xs" textAlign="center">
              Sign in with Google for unlimited messaging
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter pt={2}>
          <Button
            onClick={closeRateLimitModal}
            size="sm"
            bg="white"
            border="1px solid #4F9CF9"
            color="#4F9CF9"
            borderRadius="8px"
            fontWeight="500"
            _hover={{
              bg: "rgba(79, 156, 249, 0.05)",
              borderColor: "#3B82F6"
            }}
            _active={{
              transform: "scale(0.98)"
            }}
            width="full"
          >
            Got it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
