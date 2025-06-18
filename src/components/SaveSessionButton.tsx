/**
 * Save Session Button Component
 * 
 * Provides a clean, modern button to save the current chat session.
 * Appears below the last message when there are messages to save.
 */

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    HStack,
    Text,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { PiCheckBold, PiFloppyDiskBold, PiTrashBold } from 'react-icons/pi';
import { useChatStore } from '../store/useChatStore';
import { useHistoryStore } from '../store/useHistoryStore';

interface SaveSessionButtonProps {
  onSaved?: () => void;
}

export function SaveSessionButton({ onSaved }: SaveSessionButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const { messages, clearMessages } = useChatStore();
  const { saveSession } = useHistoryStore();

  // Don't show if no messages or only system messages
  const hasMessagesToSave = messages.length > 0 && 
    messages.some(msg => msg.role === 'user' || msg.role === 'assistant');

  if (!hasMessagesToSave) {
    return null;
  }

  const handleSave = async () => {
    if (isSaving || isSaved) return;

    setIsSaving(true);

    try {
      // Save the session
      await saveSession(messages);

      // Clear current chat
      clearMessages();

      // Show success state
      setIsSaved(true);

      toast({
        title: 'Session saved',
        description: 'Your conversation has been saved to history',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Call callback if provided
      onSaved?.();

      // Reset saved state after a delay
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to save session:', error);

      toast({
        title: 'Failed to save session',
        description: 'Please try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSession = () => {
    clearMessages();
    onClose();

    toast({
      title: 'Session cleared',
      description: 'Started a new conversation',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    // Call callback if provided
    onSaved?.();
  };

  return (
    <>
      <Box
        w="100%"
        display="flex"
        justifyContent="center"
        py={3}
        px={4}
      >
        <HStack spacing={3}>
          <Button
            leftIcon={isSaved ? <PiCheckBold /> : <PiFloppyDiskBold />}
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Saving..."
            colorScheme={isSaved ? "green" : "blue"}
            variant="ghost"
            size="sm"
            borderRadius="lg"
            fontWeight="500"
            px={4}
            py={2}
            h="auto"
            minH="32px"
            bg={isSaved ? "green.50" : "blue.50"}
            color={isSaved ? "green.600" : "blue.600"}
            border="1px solid"
            borderColor={isSaved ? "green.200" : "blue.200"}
            _hover={{
              bg: isSaved ? "green.100" : "blue.100",
              borderColor: isSaved ? "green.300" : "blue.300",
              transform: "translateY(-1px)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 150ms ease"
            disabled={isSaving || isSaved}
          >
            <Text fontSize="sm" fontWeight="500">
              {isSaved ? 'Saved!' : 'Save Session'}
            </Text>
          </Button>

          <Button
            leftIcon={<PiTrashBold />}
            onClick={onOpen}
            colorScheme="red"
            variant="ghost"
            size="sm"
            borderRadius="lg"
            fontWeight="500"
            px={4}
            py={2}
            h="auto"
            minH="32px"
            bg="red.50"
            color="red.600"
            border="1px solid"
            borderColor="red.200"
            _hover={{
              bg: "red.100",
              borderColor: "red.300",
              transform: "translateY(-1px)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 150ms ease"
            disabled={isSaving}
          >
            <Text fontSize="sm" fontWeight="500">
              Clear Session
            </Text>
          </Button>
        </HStack>
      </Box>

      {/* Clear session confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Current Session
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to clear the current conversation? This will start a new session and cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClearSession} ml={3}>
                Clear Session
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
