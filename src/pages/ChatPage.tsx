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

  // Enhanced responsive configuration with ChatGPT-style desktop centering
  const chatConfig = useMemo(() => ({
    container: {
      // Mobile: full width with padding
      // Desktop: centered container with max width - optimized for modern chat UX
      padding: {
        base: 1,    // Mobile: 4px padding (reduced for wider content)
        sm: 2,      // Small: 8px padding (reduced for wider content)
        md: 0,      // Desktop: no padding (handled by centered container)
        lg: 0,      // Large: no padding
        xl: 0       // XL: no padding
      },
      gap: { base: 3, sm: 4, md: 5, lg: 6, xl: 7 }, // Increased desktop spacing
      // Desktop container constraints - wider for better readability
      maxWidth: {
        base: "100%",
        md: "800px",   // Increased from 768px
        lg: "900px",   // Increased for large screens
        xl: "1000px"   // Increased for XL screens
      },
      centerPadding: {
        md: 8,    // Increased from 6
        lg: 12,   // Increased from 8
        xl: 16    // Increased from 12
      }
    },
    hero: {
      fontSize: { base: "xl", sm: "2xl", md: "3xl", lg: "4xl", xl: "4xl" }, // Larger desktop text
      subFontSize: { base: "md", sm: "lg", md: "xl", lg: "2xl", xl: "2xl" }, // Larger desktop subtext
      padding: { base: 4, sm: 6, md: 12, lg: 16, xl: 20 } // More generous desktop padding
    },
    scrollButton: {
      size: { base: "sm", sm: "md", md: "md", lg: "lg" },
      bottom: { base: "100px", sm: "110px", md: "140px", lg: "150px", xl: "160px" }, // Adjusted for new input height
      right: { base: "16px", sm: "20px", md: "32px", lg: "40px", xl: "48px" } // More spacing from edge
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
      minH="100%"
      p="0px"
      bg={bgColor}
      position="relative"
      data-testid="chat-page"
      // Enhanced mobile support with proper header spacing
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Ensure content can scroll properly
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        // Mobile viewport support with proper header spacing
        '@media (max-width: 768px)': {
          // Full viewport height minus fixed header
          height: 'calc(100vh - 56px)',
          minHeight: 'calc(100vh - 56px)',
          maxHeight: 'calc(100vh - 56px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
        // Desktop viewport support with improved spacing
        '@media (min-width: 769px)': {
          height: 'calc(100vh - 64px)',
          minHeight: 'calc(100vh - 64px)',
          maxHeight: 'calc(100vh - 64px)',
          // Add subtle background pattern for desktop
          background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)',
        },
        '@supports (-webkit-touch-callout: none)': {
          '@media (max-width: 768px)': {
            height: 'calc(-webkit-fill-available - 56px)',
            minHeight: 'calc(-webkit-fill-available - 56px)',
            maxHeight: 'calc(-webkit-fill-available - 56px)',
          },
          '@media (min-width: 769px)': {
            height: 'calc(-webkit-fill-available - 64px)',
            minHeight: 'calc(-webkit-fill-available - 64px)',
            maxHeight: 'calc(-webkit-fill-available - 64px)',
          }
        }
      }}
    >
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Enhanced hero prompt with centered container */}
      {msgs.length === 0 && (
        <Flex
          flex={1}
          align="center"
          justify="center"
          w="100%"
          role="main"
          aria-label="Welcome message"
        >
          <Box
            w="100%"
            maxW={chatConfig.container.maxWidth}
            px={chatConfig.container.centerPadding}
            py={chatConfig.hero.padding}
          >
            <Box textAlign="center" maxW={{ base: "sm", sm: "md", md: "2xl", lg: "3xl" }} mx="auto">
              <Text
                fontSize={chatConfig.hero.fontSize}
                lineHeight={{ base: "short", md: "shorter" }}
                fontWeight={{ base: "semibold", md: "bold" }}
                color={heroTextColor}
                mb={{ base: 2, sm: 2, md: 4, lg: 6 }}
                // Enhanced accessibility
                as="h1"
                role="heading"
                aria-level={1}
                // Better desktop typography
                letterSpacing={{ base: "normal", md: "-0.025em" }}
              >
                What do you want to know?
              </Text>
              <Text
                fontSize={chatConfig.hero.subFontSize}
                color={heroSubTextColor}
                fontWeight={{ base: "normal", md: "medium" }}
                opacity={{ base: 0.8, md: 0.7 }}
                lineHeight={{ base: "relaxed", md: "normal" }}
                // Enhanced accessibility
                as="p"
                role="text"
                // Better desktop spacing
                maxW={{ base: "full", md: "2xl" }}
                mx="auto"
              >
                Our team is happy to assist you...
              </Text>
            </Box>
          </Box>
        </Flex>
      )}

      {/* Enhanced messages container with centered layout */}
      <Box
        ref={messagesContainerRef}
        flex="1"
        w="100%"
        bg={containerBg}
        // Enhanced scrolling performance with mobile optimization
        overflowY="auto"
        overflowX="hidden"
        sx={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          // Enhanced mobile support with wider content area
          '@media (max-width: 768px)': {
            paddingX: 1, // Reduced from 3 for wider content
            paddingY: 2,
            // Ensure messages container doesn't exceed viewport
            maxHeight: 'calc(100vh - 56px - 120px)', // viewport - header - input area
          },
          // Desktop support with centered container and enhanced spacing
          '@media (min-width: 769px)': {
            maxHeight: 'calc(100vh - 64px - 160px)', // viewport - header - input area (adjusted for larger input)
            display: 'flex',
            justifyContent: 'center',
            paddingY: 6, // Increased vertical padding
            paddingX: 4, // Add horizontal padding for better edge spacing
          }
        }}
        // Enhanced accessibility
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Centered container for desktop, full width for mobile */}
        <Box
          w="100%"
          maxW={chatConfig.container.maxWidth}
          px={{
            base: chatConfig.container.padding.base,
            sm: chatConfig.container.padding.sm,
            md: chatConfig.container.centerPadding.md,
            lg: chatConfig.container.centerPadding.lg,
            xl: chatConfig.container.centerPadding.xl
          }}
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
                  px={{ base: 0, sm: 0.5, md: 0 }} // Reduced mobile padding for wider content
                  py={{ base: 0, md: 1 }} // Add subtle vertical spacing on desktop
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
