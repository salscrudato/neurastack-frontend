import {
    Box,
    Flex,
    IconButton,
    Text,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiArrowUpBold } from 'react-icons/pi';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { Loader } from '../components/LoadingSpinner';
import OfflineIndicator from '../components/OfflineIndicator';
import { SaveSessionButton } from '../components/SaveSessionButton';
import { useReducedMotion } from '../hooks/useAccessibility';
import { useChatStore } from '../store/useChatStore';
// import { usePerformanceAlerts } from '../hooks/usePerformanceMonitor'; // Disabled to improve performance
import { useAuthStore } from '../store/useAuthStore';
import { useHistoryStore } from '../store/useHistoryStore';

export function ChatPage() {
  const msgs = useChatStore(s => s.messages);
  const isLoading = useChatStore(s => s.isLoading);

  // Auth store
  const user = useAuthStore(s => s.user);

  // History store
  const { loadAllSessions } = useHistoryStore();

  // Analytics tracking
  // const { trackChatFeature } = useChatAnalytics(); // Removed since clear chat functionality moved to SaveSessionButton

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  // const { alerts, clearAlerts } = usePerformanceAlerts(); // Disabled to improve performance



  // Modern color values - light mode only
  const bgColor = "#FAFBFC";
  const containerBg = "#FAFBFC";

  const scrollButtonBg = "#FFFFFF";
  const scrollButtonColor = "#64748B";
  const scrollButtonHoverBg = "#F8FAFC";
  const heroTextColor = "#475569";
  const heroSubTextColor = "#64748B";

  // Enhanced responsive configuration
  const chatConfig = useMemo(() => ({
    container: {
      padding: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
      gap: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }
    },
    hero: {
      fontSize: { xs: "lg", sm: "xl", md: "2xl", lg: "3xl", xl: "4xl" },
      subFontSize: { xs: "md", sm: "lg", md: "xl", lg: "2xl", xl: "3xl" },
      padding: { xs: 4, sm: 5, md: 6, lg: 8, xl: 10 }
    },
    scrollButton: {
      size: { xs: "sm", sm: "md", md: "md", lg: "lg" },
      bottom: { xs: "80px", sm: "90px", md: "100px", lg: "110px", xl: "120px" },
      right: { xs: "12px", sm: "16px", md: "20px", lg: "24px", xl: "28px" }
    }
  }), []);

  // Animation configuration
  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
    scale: prefersReducedMotion ? 'none' : 'scale(1.05)'
  }), [prefersReducedMotion]);

  // Load sessions when user is authenticated (no chat history loading - backend handles memory)
  useEffect(() => {
    if (user) {
      loadAllSessions();
    }
  }, [user, loadAllSessions]);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Enhanced scroll handling with performance optimization
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!isNearBottom && msgs.length > 0);
  }, [msgs.length]);

  // Debounced scroll handler for performance
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 16); // ~60fps
    };

    container.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, [prefersReducedMotion]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Scroll to bottom with 'End' key
    if (e.key === 'End' && e.ctrlKey) {
      e.preventDefault();
      scrollToBottom();
    }
    // Scroll to top with 'Home' key
    if (e.key === 'Home' && e.ctrlKey) {
      e.preventDefault();
      messagesContainerRef.current?.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  }, [scrollToBottom, prefersReducedMotion]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);





  // Performance alerts disabled to improve performance
  // useEffect(() => {
  //   alerts.forEach(alert => {
  //     toast({
  //       title: "Performance Warning",
  //       description: alert,
  //       status: "warning",
  //       duration: 5000,
  //       isClosable: true,
  //       onCloseComplete: clearAlerts,
  //     });
  //   });
  // }, [alerts, toast, clearAlerts]);

  return (
    <Flex
      direction="column"
      h="100%"
      p="0px"
      bg={bgColor}
      position="relative"
      // Enhanced mobile support
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Dynamic viewport height for mobile
        minHeight: ['100vh', '100dvh'],
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
        }
      }}
    >
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Enhanced hero prompt */}
      {msgs.length === 0 && (
        <Flex
          flex={1}
          align="center"
          justify="center"
          px={chatConfig.hero.padding}
          pb={{ xs: 24, sm: 20, md: 16, lg: 0 }} // Enhanced mobile spacing
          role="main"
          aria-label="Welcome message"
        >
          <Box textAlign="center" maxW={{ xs: "sm", sm: "md", md: "lg", lg: "xl" }}>
            <Text
              fontSize={chatConfig.hero.fontSize}
              lineHeight="short"
              fontWeight="semibold"
              color={heroTextColor}
              mb={{ xs: 2, sm: 2, md: 3, lg: 4 }}
              // Enhanced accessibility
              as="h1"
              role="heading"
              aria-level={1}
            >
              What do you want to know?
            </Text>
            <Text
              fontSize={chatConfig.hero.subFontSize}
              color={heroSubTextColor}
              fontWeight="normal"
              opacity={0.8}
              lineHeight="relaxed"
              // Enhanced accessibility
              as="p"
              role="text"
            >
              Our team is happy to assist you...
            </Text>
          </Box>
        </Flex>
      )}

      {/* Enhanced messages container */}
      <Box
        ref={messagesContainerRef}
        flex="1 1 0"
        overflowY="auto"
        px={chatConfig.container.padding}
        py={{ xs: 4, sm: 4, md: 2, lg: 2.5, xl: 3 }}
        bg={containerBg}
        position="relative"
        // Enhanced scrolling performance
        sx={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: prefersReducedMotion ? 'auto' : 'smooth',
          // Enhanced mobile support with proper header spacing
          '@media (max-width: 768px)': {
            paddingX: 2,
            paddingTop: 4, // Increased top padding for mobile
            paddingBottom: 2,
          }
        }}
        // Enhanced accessibility
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        <Flex
          direction="column"
          align="stretch"
          gap={chatConfig.container.gap}
          // Enhanced performance
          sx={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          {msgs.map((m, index) => {
            // Check if this is the first assistant message
            const isFirstAssistantMessage = m.role === 'assistant' &&
              msgs.slice(0, index).every(prevMsg => prevMsg.role !== 'assistant');

            return (
              <Box
                key={m.id}
                id={`message-${m.id}`}
                px={{ xs: 0.5, sm: 1, md: 0 }}
                // Enhanced accessibility
                role="article"
                aria-label={`Message ${index + 1} from ${m.role}`}
              >
                <ChatMessage
                  message={m}
                  isFirstAssistantMessage={isFirstAssistantMessage}
                  isHighlighted={false}
                />
              </Box>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <Box px={4} py={2}>
              <Loader variant="team" />
            </Box>
          )}

          {/* Save Session Button - appears after messages */}
          {msgs.length > 0 && !isLoading && (
            <SaveSessionButton />
          )}

          <div ref={bottomRef} />
        </Flex>
      </Box>

      {/* Enhanced Scroll to bottom button */}
      {showScrollToBottom && (
        <IconButton
          aria-label="Scroll to bottom of chat"
          icon={<PiArrowUpBold />}
          position="absolute"
          bottom={chatConfig.scrollButton.bottom}
          right={chatConfig.scrollButton.right}
          size={chatConfig.scrollButton.size}
          borderRadius="full"
          bg={scrollButtonBg}
          color={scrollButtonColor}
          boxShadow="lg"
          transition={animationConfig.transition}
          // Enhanced touch targets
          minW={{ xs: "44px", sm: "46px", md: "48px", lg: "52px" }}
          h={{ xs: "44px", sm: "46px", md: "48px", lg: "52px" }}
          _hover={{
            bg: scrollButtonHoverBg,
            transform: animationConfig.transform,
            boxShadow: "xl"
          }}
          _focus={{
            outline: "2px solid #4F9CF9",
            outlineOffset: "2px",
            bg: scrollButtonHoverBg
          }}
          _active={{
            transform: prefersReducedMotion ? 'none' : 'scale(0.95)',
            bg: scrollButtonHoverBg
          }}
          onClick={scrollToBottom}
          zIndex={10}
          transform="rotate(180deg)"
          // Enhanced touch interactions
          sx={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      )}

      {/* input */}
      <ChatInput />
    </Flex>
  );
}
