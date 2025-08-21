import {
    Box,
    Flex,
    IconButton,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiArrowUpBold } from 'react-icons/pi';
import ChatInput from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { LazyRealTimeEnsembleVisualization } from '../components/LazyAnalyticsComponents';
import { RateLimitModal } from '../components/RateLimitModal';
import { SaveSessionButton } from '../components/SaveSessionButton';
import { useReducedMotion } from '../hooks/useAccessibility';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useHistoryStore } from '../store/useHistoryStore';

// -----------------------------------------------------------------------------
// Static layout / sizing config — declared outside component to avoid
// re‑creation on every render
// -----------------------------------------------------------------------------
const CHAT_CONFIG = {
  container: {
    padding: { base: 2, md: 0 },
    gap: { base: 3, md: 4, lg: 5 },
    maxWidth: { base: "100%", md: "850px", lg: "950px", xl: "1050px" },
    centerPadding: { md: 6, lg: 8, xl: 10 },
  },
  hero: {
    fontSize: { base: "xl", md: "2xl", lg: "3xl" },
    subFontSize: { base: "sm", md: "md", lg: "lg" },
    padding: { base: 4, md: 6, lg: 8 },
  },
  scrollButton: {
    size: { base: "sm", sm: "md", lg: "lg" },
    bottom: { base: "80px", sm: "85px", md: "100px", lg: "110px", xl: "120px" },
    right: { base: "16px", sm: "20px", md: "32px", lg: "40px", xl: "48px" },
  },
} as const;

export function ChatPage() {
  const msgs = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const user = useAuthStore((s) => s.user);
  const { loadAllSessions } = useHistoryStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const initialHeightRef = useRef<number>(window.innerHeight);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const prefersReducedMotion = useReducedMotion();

  const bgColor = useColorModeValue("#FAFBFC", "gray.800");
  const containerBg = useColorModeValue("#FAFBFC", "gray.800");
  const scrollButtonBg = useColorModeValue("#FFFFFF", "gray.700");
  const scrollButtonColor = "#4F9CF9"; // Keep brand colour consistent in both modes
  const scrollButtonHoverBg = useColorModeValue("#F8FAFC", "gray.600");

  // Static config (memoised by virtue of being module‑scoped)
  const chatConfig = CHAT_CONFIG;

  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? "none" : "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    transform: prefersReducedMotion ? "none" : "translateY(-2px)",
  }), [prefersReducedMotion]);

  useEffect(() => {
    if (user) loadAllSessions();
  }, [user, loadAllSessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    setShowScrollToBottom(scrollHeight - scrollTop - clientHeight >= 100 && msgs.length > 0);
  }, [msgs.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const scrollToChatBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [prefersReducedMotion]);

  // Keyboard shortcuts (Home/End + Ctrl/Cmd)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === "Home" && (e.ctrlKey || e.metaKey)) || (e.key === "End" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        if (e.key === "Home") {
          messagesContainerRef.current?.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        } else {
          scrollToChatBottom();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [prefersReducedMotion, scrollToChatBottom]);

  const handleSendMessage = useCallback(async (prompt: string) => {
    await sendMessage(prompt);
  }, [sendMessage]);

  // Consolidated viewport/keyboard resize handler
  useEffect(() => {
    const handleResize = () => {
      // Update baseline height if user rotates or enlarges viewport
      if (window.innerHeight > initialHeightRef.current) {
        initialHeightRef.current = window.innerHeight;
      }

      // Derive virtual‑keyboard height (mobile)
      const kh = initialHeightRef.current - window.innerHeight;
      setKeyboardHeight(kh > 100 ? kh : 0);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize(); // initial run
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box
      h="100vh"
      w="100%"
      bg={bgColor}
      position="relative"
      data-testid="chat-page"
      overflow="hidden"
      sx={{
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        "@media (min-width: 769px)": { background: "#FAFBFC" },
        height: ["100vh", "100dvh"],
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <Box
        ref={messagesContainerRef}
        flex="1"
        w="100%"
        bg={containerBg}
        overflowY="auto"
        overflowX="hidden"
        px={{ base: 4, md: 6 }}
        pt={{ base: "calc(4rem + env(safe-area-inset-top, 0px))", md: "5rem" }}
        pb={{ base: "120px", md: "300px" }}
        sx={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          scrollBehavior: "smooth",
          scrollSnapType: "y proximity",
          // Ensure only vertical scrolling is allowed
          touchAction: "pan-y pinch-zoom",
          // Prevent text selection from interfering with scrolling
          WebkitUserSelect: "none",
          userSelect: "none",
          // Allow text selection within message content
          "& .chat-message-content": {
            WebkitUserSelect: "text",
            userSelect: "text",
            touchAction: "manipulation"
          },
          "@media (max-width: 768px)": {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
            // Enhanced mobile scrolling
            overscrollBehaviorY: "contain",
            overscrollBehaviorX: "none"
          },
          "@media (min-width: 769px)": {
            display: "flex",
            justifyContent: "center",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.05)", borderRadius: "3px" },
            "&::-webkit-scrollbar-thumb": { background: "rgba(79, 156, 249, 0.3)", borderRadius: "3px", "&:hover": { background: "rgba(79, 156, 249, 0.5)" } }
          }
        }}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        <Box w="100%" maxW={chatConfig.container.maxWidth} px={chatConfig.container.centerPadding}>
          <Flex direction="column" align="stretch" gap={chatConfig.container.gap}>

            {msgs.length === 0 && !isLoading && (
              <Flex direction="column" align="center" justify="center" minH="60vh" textAlign="center" px={4}>
                <Text fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} fontWeight="500" color="gray.800" mb={3} letterSpacing="-0.02em">What do you want to know?</Text>
                <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} color="gray.500" fontWeight="400" mb={6}>The team will look into it...</Text>

                {/* Predictive Insights Dashboard - Temporarily disabled due to backend health endpoint issues */}
                {/* <Box w="100%" maxW="600px">
                  <PredictiveInsightsDashboard
                    isVisible={true}
                    compact={true}
                    refreshInterval={30000}
                  />
                </Box> */}
              </Flex>
            )}
            {msgs.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                isHighlighted={false}
                fullData={m.metadata?.ensembleData?.data}
              />
            ))}
            {isLoading && (
              <Box px={4} py={6}>
                <LazyRealTimeEnsembleVisualization
                  isProcessing={isLoading}
                  overallProgress={Math.random() * 100} // Simulated progress
                  consensusLevel={Math.random() * 0.8 + 0.2} // Simulated consensus
                  estimatedTime={25} // Estimated processing time
                  showAdvancedFeatures={true}
                />
              </Box>
            )}
            {msgs.length > 0 && !isLoading && <SaveSessionButton />}
            <div ref={bottomRef} />
          </Flex>
        </Box>
      </Box>
      {showScrollToBottom && (
        <IconButton
          aria-label="Scroll to bottom of chat"
          icon={<PiArrowUpBold />}
          position="fixed"
          bottom={{ ...chatConfig.scrollButton.bottom, md: `calc(${chatConfig.scrollButton.bottom.md} + ${keyboardHeight}px)` }}
          right={{ base: 4, md: 6 }}
          size="lg"
          borderRadius="full"
          bg={scrollButtonBg}
          color={scrollButtonColor}
          boxShadow="0 4px 20px rgba(79, 156, 249, 0.15)"
          transition={animationConfig.transition}
          border="1px solid rgba(79, 156, 249, 0.1)"
          w={{ base: "48px", md: "52px" }}
          h={{ base: "48px", md: "52px" }}
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
            transform: prefersReducedMotion ? "none" : "scale(0.95)",
            bg: scrollButtonHoverBg
          }}
          onClick={scrollToChatBottom}
          zIndex={999}
          transform="rotate(180deg)"
          sx={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent"
          }}
        />
      )}
      <ChatInput onSend={handleSendMessage} />
      <RateLimitModal />
    </Box>
  );
}