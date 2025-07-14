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
    useDisclosure
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { PiCheckBold, PiFloppyDiskBold, PiTrashBold } from 'react-icons/pi';
import { useAuthStore } from '../store/useAuthStore';
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

  const user = useAuthStore(s => s.user);
  const { messages, clearMessages } = useChatStore();
  const { saveSession } = useHistoryStore();

  // Don't show if no messages or only system messages
  const hasMessagesToSave = messages.length > 0 &&
    messages.some(msg => msg.role === 'user' || msg.role === 'assistant');

  // Don't show for guest users (anonymous users)
  const isGuestUser = !user || user.isAnonymous;

  if (!hasMessagesToSave || isGuestUser) {
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
      console.log('Session saved successfully');

      // Call callback if provided
      onSaved?.();

      // Reset saved state after a delay
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSession = () => {
    clearMessages();
    onClose();
    console.log('Session cleared - started new conversation');

    // Call callback if provided
    onSaved?.();
  };

  return (
    <>
      <Box
        w="100%"
        display="flex"
        justifyContent="center"
        py={{ base: 3, md: 4 }}
        px={{ base: 3, sm: 4, md: 6 }}
        maxW="900px"
        mx="auto"
      >
        <HStack spacing={2} flexWrap="wrap" justify="center">
          <Button
            leftIcon={isSaved ? <PiCheckBold size={12} /> : <PiFloppyDiskBold size={12} />}
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Saving..."
            variant="outline"
            size="sm"
            borderRadius="xl"
            fontWeight="600"
            px={4}
            py={2}
            h="auto"
            minH={{ base: "44px", md: "40px" }}
            minW="80px"
            fontSize="xs"
            bg="white"
            color={isSaved ? "#10B981" : "#4F9CF9"}
            border="1px solid"
            borderColor={isSaved ? "#10B981" : "#4F9CF9"}
            boxShadow="none"
            sx={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            _hover={{
              bg: isSaved ? "rgba(16, 185, 129, 0.05)" : "rgba(79, 156, 249, 0.05)",
              borderColor: isSaved ? "#059669" : "#3B82F6",
              color: isSaved ? "#059669" : "#3B82F6",
              transform: "translateY(-1px)",
              boxShadow: isSaved ? "0 2px 8px rgba(16, 185, 129, 0.15)" : "0 2px 8px rgba(79, 156, 249, 0.15)",
            }}
            _active={{
              transform: "translateY(0) scale(0.98)",
              bg: isSaved ? "rgba(16, 185, 129, 0.1)" : "rgba(79, 156, 249, 0.1)",
              boxShadow: "none",
            }}
            _focus={{
              outline: "none",
              boxShadow: isSaved ? "0 0 0 2px rgba(16, 185, 129, 0.3)" : "0 0 0 2px rgba(79, 156, 249, 0.3)",
            }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            disabled={isSaving || isSaved}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed"
            }}
          >
            {isSaved ? 'Saved!' : 'Save'}
          </Button>

          <Button
            leftIcon={<PiTrashBold size={12} />}
            onClick={onOpen}
            variant="outline"
            size="sm"
            borderRadius="xl"
            fontWeight="600"
            px={4}
            py={2}
            h="auto"
            minH={{ base: "44px", md: "40px" }}
            minW="80px"
            fontSize="xs"
            bg="white"
            color="#DC2626"
            border="1px solid"
            borderColor="#DC2626"
            boxShadow="none"
            sx={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            _hover={{
              bg: "rgba(220, 38, 38, 0.05)",
              borderColor: "#B91C1C",
              color: "#B91C1C",
              transform: "translateY(-1px)",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.15)"
            }}
            _active={{
              transform: "translateY(0) scale(0.98)",
              bg: "rgba(220, 38, 38, 0.1)",
              boxShadow: "none"
            }}
            _focus={{
              outline: "none",
              boxShadow: "0 0 0 2px rgba(220, 38, 38, 0.3)",
            }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            disabled={isSaving}
            _disabled={{
              opacity: 0.4,
              cursor: "not-allowed"
            }}
          >
            Clear
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
        <AlertDialogOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)">
          <AlertDialogContent
            borderRadius="2xl"
            bg="rgba(255, 255, 255, 0.98)"
            backdropFilter="blur(20px)"
            border="1px solid rgba(226, 232, 240, 0.3)"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            mx={4}
          >
            <AlertDialogHeader
              fontSize="xl"
              fontWeight="700"
              color="#1E293B"
              pb={2}
            >
              Clear Current Session
            </AlertDialogHeader>

            <AlertDialogBody
              fontSize="md"
              color="#475569"
              lineHeight="1.6"
              pb={6}
            >
              Are you sure you want to clear the current conversation? This will start a new session and cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter gap={3} pt={0}>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant="outline"
                borderRadius="xl"
                fontWeight="600"
                px={6}
                py={3}
                h="auto"
                minH="44px"
                bg="rgba(255, 255, 255, 0.8)"
                color="#64748B"
                border="1px solid rgba(226, 232, 240, 0.6)"
                _hover={{
                  bg: "rgba(248, 250, 252, 0.9)",
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  transform: "translateY(-1px)",
                }}
                _focus={{
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.2)",
                }}
                transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClearSession}
                variant="solid"
                borderRadius="xl"
                fontWeight="600"
                px={6}
                py={3}
                h="auto"
                minH="44px"
                bg="linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)"
                color="white"
                _hover={{
                  bg: "linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 20px rgba(220, 38, 38, 0.35)",
                }}
                _focus={{
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.2), 0 8px 20px rgba(220, 38, 38, 0.35)",
                }}
                transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Clear Session
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
