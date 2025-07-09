/**
 * Simplified Chat Page
 * 
 * Streamlined chat interface with improved performance,
 * better mobile optimization, and cleaner architecture.
 */

import {
    Box,
    Flex,
    IconButton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PiArrowDownBold } from 'react-icons/pi';
import ChatInput from '../components/features/chat/ChatInput';
import ChatMessage from '../components/features/chat/ChatMessage';
import { APP_CONFIG } from '../config/app';
import { useOptimizedDevice } from '../hooks/core/useOptimizedDevice';
import { useChatLoading, useChatMessages } from '../stores/useChatStore';

// ============================================================================
// Types
// ============================================================================

interface ChatPageProps {
  /** Hide welcome message */
  hideWelcome?: boolean;

  /** Custom placeholder for input */
  inputPlaceholder?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ChatPageSimplified: React.FC<ChatPageProps> = ({
  hideWelcome = false,
  inputPlaceholder,
}) => {
  // Hooks
  const { capabilities, config } = useOptimizedDevice();
  const messages = useChatMessages();
  const isLoading = useChatLoading();
  // const user = useAuthStore(state => state.user);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // State
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Lock scrolling on mount and unlock on unmount
  useEffect(() => {
    // Add classes to lock scrolling
    document.body.classList.add('chat-page-active');
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('chat-page');
    }

    return () => {
      // Remove classes to restore scrolling
      document.body.classList.remove('chat-page-active');
      if (rootElement) {
        rootElement.classList.remove('chat-page');
      }
    };
  }, []);

  // Scroll to bottom utility
  const scrollToBottom = useCallback((smooth = true) => {
    if (!bottomRef.current) return;
    
    setIsAutoScrolling(true);
    bottomRef.current.scrollIntoView({
      behavior: smooth && !config.shouldReduceAnimations ? 'smooth' : 'auto',
      block: 'end',
    });
    
    // Reset auto-scrolling flag after animation
    setTimeout(() => setIsAutoScrolling(false), 500);
  }, [config.shouldReduceAnimations]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || isAutoScrolling) return;

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollToBottom(!isNearBottom && messages.length > 0);
  }, [isAutoScrolling, messages.length]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Auto-scroll for user messages or if already near bottom
      if (lastMessage.role === 'user' || !showScrollToBottom) {
        scrollToBottom();
      }
    }
  }, [messages.length, scrollToBottom, showScrollToBottom]);

  // Responsive configuration
  const layoutConfig = {
    container: {
      maxW: APP_CONFIG.CHAT.CONTAINER.MAX_WIDTH,
      px: capabilities.isMobile ? 4 : 6,
      py: capabilities.isMobile ? 4 : 6,
    },
    messages: {
      gap: capabilities.isMobile ? 4 : 3,
      pb: capabilities.isMobile ? 6 : 4,
    },
  };





  return (
    <Flex
      className="chat-page-container"
      direction="column"
      w="100%"
      position="relative"
      bg="#f9f9f9"
      overflow="hidden"
      sx={{
        // Performance optimizations
        contain: 'layout style',
        willChange: 'auto',
        // Account for fixed header and ensure proper scroll boundaries
        height: capabilities.isMobile
          ? 'calc(100vh - 56px)' // Mobile header height
          : 'calc(100vh - 64px)', // Desktop header height
        minHeight: capabilities.isMobile
          ? 'calc(100dvh - 56px)' // Dynamic viewport height for mobile
          : 'calc(100dvh - 64px)', // Dynamic viewport height for desktop
        maxHeight: capabilities.isMobile
          ? 'calc(100vh - 56px)'
          : 'calc(100vh - 64px)',
        // Position below fixed header
        marginTop: capabilities.isMobile ? '56px' : '64px',
        // Lock scrolling - only messages container should scroll
        overflowY: 'hidden',
        overflowX: 'hidden',
      }}
    >
      {/* Welcome Message - Only show when no messages */}
      {!hideWelcome && messages.length === 0 && !isLoading && (
        <Flex
          flex="1"
          align="center"
          justify="center"
          direction="column"
          px={capabilities.isMobile ? 6 : 8}
          py={8}
        >
          <Text
            fontSize={capabilities.isMobile ? "2xl" : "3xl"}
            fontWeight="400"
            color="#374151"
            textAlign="center"
            lineHeight="1.3"
            letterSpacing="-0.01em"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            mb={4}
          >
            How can I help you?
          </Text>
        </Flex>
      )}

      {/* Messages Container */}
      <Box
        className="chat-messages-container"
        ref={messagesContainerRef}
        flex="1"
        overflowY="auto"
        onScroll={handleScroll}
        pb={capabilities.isMobile ? "120px" : "100px"} // Space for fixed input
        sx={{
          // Enhanced scrolling with proper boundaries
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent',
          // Ensure scroll area is properly constrained
          height: '100%',
          maxHeight: '100%',
          // Force this to be the only scrollable area
          overflowY: 'auto !important',
          overflowX: 'hidden !important',

          // Performance optimizations
          contain: 'layout style',
          willChange: 'scroll-position',

          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,0,0,0.3)',
          },
        }}
      >
        <Box {...layoutConfig.container} mx="auto">
          <VStack spacing={4} align="stretch">


            {/* Messages */}
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isFirstAssistantMessage={
                  message.role === 'assistant' && 
                  messages.slice(0, index).every(m => m.role !== 'assistant')
                }
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <Flex justify="flex-start" px={4}>
                <Box
                  bg="#ffffff"
                  border="1px solid #e5e7eb"
                  borderRadius="18px"
                  p={4}
                >
                  <Flex align="center" gap={2}>
                    <Box
                      w="8px"
                      h="8px"
                      bg={APP_CONFIG.THEME.COLORS.ACCENT}
                      borderRadius="50%"
                      animation={config.shouldReduceAnimations ? 'none' : 'pulse 1.5s ease-in-out infinite'}
                    />
                    <Box
                      w="8px"
                      h="8px"
                      bg={APP_CONFIG.THEME.COLORS.ACCENT}
                      borderRadius="50%"
                      animation={config.shouldReduceAnimations ? 'none' : 'pulse 1.5s ease-in-out infinite 0.2s'}
                    />
                    <Box
                      w="8px"
                      h="8px"
                      bg={APP_CONFIG.THEME.COLORS.ACCENT}
                      borderRadius="50%"
                      animation={config.shouldReduceAnimations ? 'none' : 'pulse 1.5s ease-in-out infinite 0.4s'}
                    />
                    <Text
                      ml={2}
                      fontSize="sm"
                      color="#6b7280"
                    >
                      ChatGPT is typing...
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            )}

            {/* Bottom spacer */}
            <Box ref={bottomRef} h="1px" />
          </VStack>
        </Box>
      </Box>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <IconButton
          icon={<PiArrowDownBold />}
          aria-label="Scroll to bottom"
          position="fixed"
          bottom={capabilities.isMobile ? "100px" : "120px"}
          right={6}
          size="lg"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.9)"
          color={APP_CONFIG.THEME.COLORS.ACCENT}
          border="1px solid rgba(226, 232, 240, 0.6)"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
          _hover={{
            bg: "rgba(255, 255, 255, 0.95)",
            transform: config.shouldReduceAnimations ? "none" : "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
          }}
          _active={{
            transform: config.shouldReduceAnimations ? "none" : "scale(0.95)",
          }}
          onClick={() => scrollToBottom()}
          zIndex={APP_CONFIG.UI.Z_INDEX.FIXED}
          transition="all 0.2s ease"
          sx={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        />
      )}

      {/* Chat Input */}
      <ChatInput
        placeholder={inputPlaceholder}
        autoFocus={messages.length === 0}
      />
    </Flex>
  );
};

export default ChatPageSimplified;
