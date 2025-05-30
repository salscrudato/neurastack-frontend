import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  IconButton,
  HStack,
  Tooltip,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { PiTrashBold, PiArrowUpBold, PiMagnifyingGlassBold } from 'react-icons/pi';
import { useChatStore } from '../store/useChatStore';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ChatSearch from '../components/ChatSearch';
import OfflineIndicator, { ConnectionQuality } from '../components/OfflineIndicator';
import { Header } from '../components/Header';
import { usePerformanceAlerts } from '../hooks/usePerformanceMonitor';

export function ChatPage() {
  const msgs = useChatStore(s => s.messages);
  const clearMessages = useChatStore(s => s.clearMessages);
  const isLoading = useChatStore(s => s.isLoading);
  const retryCount = useChatStore(s => s.retryCount);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { alerts, clearAlerts } = usePerformanceAlerts();

  // Pre-compute all color mode values to avoid conditional hook calls
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const containerBg = useColorModeValue("gray.50", "gray.900");
  const searchIconColor = useColorModeValue("gray.500", "gray.400");
  const searchIconHoverColor = useColorModeValue("blue.600", "blue.300");
  const clearIconColor = useColorModeValue("gray.500", "gray.400");
  const clearIconHoverColor = useColorModeValue("red.500", "red.400");
  const highlightBg = useColorModeValue("yellow.100", "yellow.800");
  const retryTextColor = useColorModeValue("gray.500", "gray.400");
  const scrollButtonBg = useColorModeValue("white", "gray.700");
  const scrollButtonColor = useColorModeValue("gray.600", "gray.300");
  const scrollButtonHoverBg = useColorModeValue("gray.50", "gray.600");
  const heroTextColor = useColorModeValue("gray.600", "gray.200");
  const heroSubTextColor = useColorModeValue("gray.600", "gray.300");

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Check if user has scrolled up to show scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom && msgs.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [msgs.length]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearChat = () => {
    clearMessages();
    onClose();
    toast({
      title: "Chat cleared",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSearchResultSelect = (messageId: string) => {
    setHighlightedMessageId(messageId);

    // Scroll to the message
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Clear highlight after a few seconds
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    }
  };

  // Show performance alerts
  useEffect(() => {
    alerts.forEach(alert => {
      toast({
        title: "Performance Warning",
        description: alert,
        status: "warning",
        duration: 5000,
        isClosable: true,
        onCloseComplete: clearAlerts,
      });
    });
  }, [alerts, toast, clearAlerts]);

  return (
    <Flex
      direction="column"
      h="100vh"
      p="0px"
      bg={bgColor}
      position="relative"
    >
      <Header />

      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Connection quality indicator */}
      <ConnectionQuality />

      {/* Search functionality */}
      {showSearch && (
        <ChatSearch onResultSelect={handleSearchResultSelect} />
      )}

      {/* hero prompt */}
      {msgs.length === 0 && (
        <Flex
          flex={1}
          align="center"
          justify="center"
          px={6}
          pb={{ base: 24, md: 0 }}   /* avoid overlap with input on mobile */
        >
          <Box textAlign="center">
            <Text
              fontSize="2xl"
              lineHeight="short"
              fontWeight="semibold"
              color={heroTextColor}
            >
              What do you want to know?
            </Text>
            <Text
              mt={2}
              fontSize="2xl"
              color={heroSubTextColor}
              fontWeight="normal"
            >
              Our team is happy to assist you...
            </Text>
          </Box>
        </Flex>
      )}

      {/* messages */}
      <Box
        ref={messagesContainerRef}
        flex="1 1 0"
        overflowY="auto"
        px={4}
        py={2}
        bg={containerBg}
        position="relative"
      >
        {/* Action buttons */}
        {msgs.length > 0 && (
          <HStack justify="flex-end" mb={4} spacing={2}>
            <Tooltip label="Search messages" hasArrow>
              <IconButton
                aria-label="Search messages"
                icon={<PiMagnifyingGlassBold />}
                size="sm"
                variant="ghost"
                onClick={() => setShowSearch(!showSearch)}
                color={showSearch ? "blue.500" : searchIconColor}
                _hover={{ color: searchIconHoverColor }}
              />
            </Tooltip>

            <Tooltip label="Clear chat history" hasArrow>
              <IconButton
                aria-label="Clear chat"
                icon={<PiTrashBold />}
                size="sm"
                variant="ghost"
                onClick={onOpen}
                color={clearIconColor}
                _hover={{ color: clearIconHoverColor }}
              />
            </Tooltip>
          </HStack>
        )}

        <Flex direction="column" align="stretch" gap={0}>
          {msgs.map(m => (
            <Box
              key={m.id}
              id={`message-${m.id}`}
              bg={highlightedMessageId === m.id ? highlightBg : "transparent"}
              borderRadius="md"
              transition="background-color 0.3s"
            >
              <ChatMessage m={m} />
            </Box>
          ))}

          {/* Loading indicator with retry count */}
          {isLoading && retryCount > 0 && (
            <Box textAlign="center" py={4}>
              <Text fontSize="sm" color={retryTextColor}>
                Retrying... (attempt {retryCount + 1}/4)
              </Text>
            </Box>
          )}

          <div ref={bottomRef} />
        </Flex>
      </Box>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <IconButton
          aria-label="Scroll to bottom"
          icon={<PiArrowUpBold />}
          position="absolute"
          bottom="120px"
          right="20px"
          size="md"
          borderRadius="full"
          bg={scrollButtonBg}
          color={scrollButtonColor}
          boxShadow="lg"
          _hover={{
            bg: scrollButtonHoverBg,
            transform: "translateY(-2px)"
          }}
          onClick={scrollToBottom}
          zIndex={10}
          transform="rotate(180deg)"
        />
      )}

      {/* input */}
      <ChatInput />

      {/* Clear chat confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Chat History
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to clear all messages? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClearChat} ml={3}>
                Clear
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}
