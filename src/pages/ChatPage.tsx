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
// Removed OfflineIndicator as PWA features were removed
import { SaveSessionButton } from '../components/SaveSessionButton';
import { useReducedMotion } from '../hooks/useAccessibility';
import { useChatStore } from '../store/useChatStore';
// import { usePerformanceAlerts } from '../hooks/usePerformanceMonitor'; // Disabled to improve performance
import { useAuthStore } from '../store/useAuthStore';
import { useHistoryStore } from '../store/useHistoryStore';

// Lazy load VirtualChatList for better performance (will be implemented later)
// const VirtualChatList = lazy(() => import('../components/VirtualChatList'));

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
  const [, setFocusedMessageIndex] = useState(-1);
  const prefersReducedMotion = useReducedMotion();
  // const { alerts, clearAlerts } = usePerformanceAlerts(); // Disabled to improve performance



  // Modern clean color values - light mode only
  const bgColor = "#FAFBFC";
  const containerBg = "#FAFBFC";

  const scrollButtonBg = "#FFFFFF";
  const scrollButtonColor = "#4F9CF9";
  const scrollButtonHoverBg = "#F8FAFC";
  const heroTextColor = "#1E293B"; // Darker for better contrast
  const heroSubTextColor = "#64748B";

  // Enhanced mobile-first responsive configuration with improved UX
  const chatConfig = useMemo(() => ({
    container: {
      // Enhanced mobile-first padding with fluid scaling
      padding: {
        base: "clamp(0.25rem, 1vw, 0.5rem)",    // Enhanced mobile: fluid padding for maximum content width
        sm: "clamp(0.5rem, 1.5vw, 0.75rem)",    // Enhanced small: fluid padding
        md: 0,      // Desktop: no padding (handled by centered container)
        lg: 0,      // Large: no padding
        xl: 0       // XL: no padding
      },
      gap: {
        base: "clamp(0.5rem, 2vw, 1rem)",       // Enhanced mobile: fluid gap spacing
        sm: "clamp(0.5rem, 2vw, 1rem)",
        md: "clamp(0.75rem, 2.5vw, 1.25rem)",
        lg: "clamp(1rem, 3vw, 1.5rem)",
        xl: "clamp(1.25rem, 3.5vw, 1.75rem)"
      },
      // Enhanced desktop container constraints - optimized for readability and input alignment
      maxWidth: {
        base: "100%",
        md: "850px",   // Enhanced to match input container
        lg: "950px",   // Enhanced for large screens
        xl: "1050px"   // Enhanced for XL screens
      },
      centerPadding: {
        md: "clamp(1.5rem, 4vw, 2rem)",         // Enhanced fluid desktop padding
        lg: "clamp(2rem, 5vw, 2.5rem)",         // Enhanced large screen padding
        xl: "clamp(2.5rem, 6vw, 3rem)"          // Enhanced XL screen padding
      }
    },
    hero: {
      fontSize: { base: "xl", sm: "2xl", md: "3xl", lg: "4xl", xl: "4xl" }, // Larger desktop text
      subFontSize: { base: "md", sm: "lg", md: "xl", lg: "2xl", xl: "2xl" }, // Larger desktop subtext
      padding: { base: 6, sm: 8, md: 16, lg: 20, xl: 24 } // Clean, generous padding
    },
    scrollButton: {
      size: { base: "sm", sm: "md", md: "md", lg: "lg" },
      bottom: { base: "80px", sm: "85px", md: "100px", lg: "110px", xl: "120px" }, // Adjusted for reduced input height
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
    console.log('🔄 ChatPage useEffect - user:', user?.uid, 'isAnonymous:', user?.isAnonymous);
    if (user) {
      console.log('🔄 Loading sessions...');
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

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation when not in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setFocusedMessageIndex(prev => {
            const newIndex = Math.max(0, prev - 1);
            const messageElement = document.getElementById(`message-${msgs[newIndex]?.id}`);
            messageElement?.focus();
            return newIndex;
          });
          break;

        case 'ArrowDown':
          event.preventDefault();
          setFocusedMessageIndex(prev => {
            const newIndex = Math.min(msgs.length - 1, prev + 1);
            const messageElement = document.getElementById(`message-${msgs[newIndex]?.id}`);
            messageElement?.focus();
            return newIndex;
          });
          break;

        case 'Home':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setFocusedMessageIndex(0);
            const messageElement = document.getElementById(`message-${msgs[0]?.id}`);
            messageElement?.focus();
          }
          break;

        case 'End':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const lastIndex = msgs.length - 1;
            setFocusedMessageIndex(lastIndex);
            const messageElement = document.getElementById(`message-${msgs[lastIndex]?.id}`);
            messageElement?.focus();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [msgs]);

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
        // Mobile viewport support with optimized scrolling
        '@media (max-width: 768px)': {
          // Full viewport height minus fixed header and input area
          height: 'calc(100vh - 60px)', // Updated for new header height
          minHeight: 'calc(100vh - 60px)',
          maxHeight: 'calc(100vh - 60px)',
          paddingBottom: '100px', // Reduced space for input area - more compact design
          // Prevent body scroll when input is focused
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        },
        // Desktop viewport support with clean background
        '@media (min-width: 769px)': {
          height: 'calc(100vh - 64px)',
          minHeight: 'calc(100vh - 64px)',
          maxHeight: 'calc(100vh - 64px)',
          // Clean, minimal background
          background: '#FAFBFC',
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
      {/* Offline indicator removed with PWA features */}

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
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }}
                lineHeight={{ base: "shorter", md: "none" }}
                fontWeight={{ base: "bold", md: "bold" }}
                color={heroTextColor}
                mb={{ base: 4, sm: 5, md: 6, lg: 8 }}
                // Enhanced accessibility
                as="h1"
                role="heading"
                aria-level={1}
                // Better desktop typography
                letterSpacing={{ base: "-0.01em", md: "-0.02em" }}
              >
                What do you want to know?
              </Text>
              <Text
                fontSize={{ base: "lg", sm: "xl", md: "2xl", lg: "2xl" }}
                color={heroSubTextColor}
                fontWeight={{ base: "normal", md: "medium" }}
                opacity={{ base: 0.7, md: 0.8 }}
                lineHeight={{ base: "relaxed", md: "normal" }}
                // Enhanced accessibility
                as="p"
                role="text"
                // Better desktop spacing
                maxW={{ base: "full", md: "2xl" }}
                mx="auto"
              >
                The team will look into it...
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
          // Enhanced mobile-first support with superior scrolling
          '@media (max-width: 768px)': {
            paddingX: "clamp(0.5rem, 2vw, 1rem)", // Fluid mobile padding
            paddingY: "clamp(0.5rem, 2vw, 1rem)", // Fluid vertical padding
            paddingBottom: "clamp(0.5rem, 2vw, 1rem)", // Minimal bottom padding for input clearance
            // Enhanced viewport calculations for better mobile experience
            maxHeight: 'calc(100vh - clamp(52px, 12vw, 56px) - clamp(80px, 20vw, 100px))', // fluid header and input heights
            // Enhanced smooth scrolling behavior
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            // Enhanced scroll snap for better UX
            scrollSnapType: 'y proximity',
            // Enhanced touch interactions
            touchAction: 'pan-y',
            // Improved scrollbar hiding while maintaining functionality
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            // Enhanced momentum scrolling
            WebkitMomentumScrolling: 'touch',
          },
          // Enhanced desktop support with centered container and fluid spacing
          '@media (min-width: 769px)': {
            maxHeight: 'calc(100vh - 64px - clamp(120px, 15vw, 140px))', // fluid input area
            display: 'flex',
            justifyContent: 'center',
            paddingY: "clamp(1rem, 3vw, 1.5rem)", // Fluid vertical padding
            paddingX: "clamp(1rem, 2vw, 1.25rem)", // Fluid horizontal padding
            // Enhanced scrollbar styling for desktop
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(79, 156, 249, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(79, 156, 249, 0.5)',
              },
            },
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
                  px={{ base: 0, sm: 0, md: 0 }} // Minimal padding for maximum content width
                  py={{ base: 0, md: 0 }} // No vertical spacing to prevent overlap
                  // Enhanced accessibility
                  role="article"
                  aria-label={`Message ${index + 1} from ${m.role === 'user' ? 'you' : 'AI assistant'}`}
                  aria-describedby={`message-content-${m.id}`}
                  tabIndex={-1}
                  _focus={{
                    outline: 'none',
                  }}
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
          boxShadow="0 4px 20px rgba(79, 156, 249, 0.15)"
          transition={animationConfig.transition}
          border="1px solid rgba(79, 156, 249, 0.1)"
          // Enhanced touch targets
          minW={{ xs: "44px", sm: "46px", md: "48px", lg: "52px" }}
          h={{ xs: "44px", sm: "46px", md: "48px", lg: "52px" }}
          _hover={{
            bg: scrollButtonHoverBg,
            transform: animationConfig.transform,
            boxShadow: "0 8px 32px rgba(79, 156, 249, 0.2)",
            borderColor: "rgba(79, 156, 249, 0.2)"
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
