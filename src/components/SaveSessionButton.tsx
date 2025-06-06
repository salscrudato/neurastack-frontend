/**
 * Save Session Button Component
 * 
 * Provides a clean, modern button to save the current chat session.
 * Appears below the last message when there are messages to save.
 */

import {
  Button,
  useToast,
  Text,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import { PiFloppyDiskBold, PiCheckBold } from 'react-icons/pi';
import { useChatStore } from '../store/useChatStore';
import { useHistoryStore } from '../store/useHistoryStore';

interface SaveSessionButtonProps {
  onSaved?: () => void;
}

export function SaveSessionButton({ onSaved }: SaveSessionButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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

  return (
    <Box
      w="100%"
      display="flex"
      justifyContent="center"
      py={3}
      px={4}
    >
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
    </Box>
  );
}
