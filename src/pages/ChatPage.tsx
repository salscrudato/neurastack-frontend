import {
    Box,
    Flex,
    IconButton,
    Text
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiArrowUpBold } from 'react-icons/pi';
import ChatInput from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { Loader } from '../components/LoadingSpinner';
import { SaveSessionButton } from '../components/SaveSessionButton';
import { useReducedMotion } from '../hooks/useAccessibility';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useHistoryStore } from '../store/useHistoryStore';

export function ChatPage() {
  const msgs = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const { loadAllSessions } = useHistoryStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const bgColor = "#FAFBFC";
  const containerBg = "#FAFBFC";
  const scrollButtonBg = "#FFFFFF";
  const scrollButtonColor = "#4F9CF9";
  const scrollButtonHoverBg = "#F8FAFC";

  const chatConfig = useMemo(() => ({
    container: {
      padding: { base: "clamp(0.25rem, 1vw, 0.5rem)", sm: "clamp(0.5rem, 1.5vw, 0.75rem)", md: 0 },
      gap: { base: "clamp(0.75rem, 2.5vw, 1.25rem)", md: "clamp(1rem, 3vw, 1.5rem)", lg: "clamp(1.25rem, 3.5vw, 1.75rem)", xl: "clamp(1.5rem, 4vw, 2rem)" },
      maxWidth: { base: "100%", md: "850px", lg: "950px", xl: "1050px" },
      centerPadding: { md: "clamp(1.5rem, 4vw, 2rem)", lg: "clamp(2rem, 5vw, 2.5rem)", xl: "clamp(2.5rem, 6vw, 3rem)" },
    },
    hero: {
      fontSize: { base: "lg", sm: "xl", md: "2xl", lg: "3xl", xl: "4xl" },
      subFontSize: { base: "sm", sm: "md", md: "lg", lg: "xl", xl: "2xl" },
      padding: { base: 4, sm: 6, md: 8, lg: 10, xl: 12 },
    },
    scrollButton: {
      size: { base: "sm", sm: "md", lg: "lg" },
      bottom: { base: "80px", sm: "85px", md: "100px", lg: "110px", xl: "120px" },
      right: { base: "16px", sm: "20px", md: "32px", lg: "40px", xl: "48px" },
    },
  }), []);

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
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 16);
    };
    container.addEventListener("scroll", debouncedHandleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [prefersReducedMotion]);

  // Simple keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === "Home" && (e.ctrlKey || e.metaKey)) || (e.key === "End" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        if (e.key === "Home") {
          messagesContainerRef.current?.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        } else {
          scrollToBottom();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [prefersReducedMotion, scrollToBottom]);

  return (
    <Box
      h="100%"
      w="100%"
      bg={bgColor}
      position="relative"
      data-testid="chat-page"
      overflow="hidden"
      sx={{
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        "@media (min-width: 769px)": { background: "#FAFBFC" },
        // Use full available height without scrolling
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Box
        ref={messagesContainerRef}
        flex="1"
        w="100%"
        bg={containerBg}
        overflowY="auto"
        overflowX="hidden"
        px={{ base: "clamp(0.5rem, 2vw, 1rem)", md: "clamp(1rem, 4vw, 2rem)" }}
        py={{ base: "clamp(0.5rem, 2vw, 1rem)", md: "clamp(1rem, 3vw, 1.5rem)" }}
        sx={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          scrollBehavior: "smooth",
          scrollSnapType: "y proximity",
          touchAction: "pan-y",
          // Use full available height - no extra padding needed since layout is constrained
          height: "100%",
          maxHeight: "100%",
          "@media (max-width: 768px)": {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" }
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
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="500" color="gray.800" mb={3} letterSpacing="-0.02em">What do you want to know?</Text>
                <Text fontSize={{ base: "md", md: "lg" }} color="gray.500" fontWeight="400">The team will look into it...</Text>
              </Flex>
            )}
            {msgs.map((m, index) => (
              <Box key={m.id} id={`message-${m.id}`} px={0} py={0} role="article" aria-label={`Message ${index + 1} from ${m.role === "user" ? "you" : "AI assistant"}`} aria-describedby={`message-content-${m.id}`} tabIndex={-1} _focus={{ outline: "none" }}>
                <ChatMessage message={m} isHighlighted={false} />
              </Box>
            ))}
            {isLoading && <Box px={4} py={6}><Loader variant="ensemble" size="lg" message="AI models collaborating on your response..." /></Box>}
            {msgs.length > 0 && !isLoading && <SaveSessionButton />}
            <div ref={bottomRef} />
          </Flex>
        </Box>
      </Box>
      {showScrollToBottom && (
        <IconButton
          aria-label="Scroll to bottom of chat"
          icon={<PiArrowUpBold />}
          position="absolute"
          bottom={{ base: "16px", md: "20px" }}
          right={{ base: 4, md: 6 }}
          size={{ base: "md", md: "lg" }}
          borderRadius="full"
          bg={scrollButtonBg}
          color={scrollButtonColor}
          boxShadow="0 4px 20px rgba(79, 156, 249, 0.15)"
          transition={animationConfig.transition}
          border="1px solid rgba(79, 156, 249, 0.1)"
          minW={{ base: "44px", sm: "46px", md: "48px", lg: "52px" }}
          h={{ base: "44px", sm: "46px", md: "48px", lg: "52px" }}
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
          onClick={scrollToBottom}
          zIndex={999}
          transform="rotate(180deg)"
          sx={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent"
          }}
        />
      )}
      <ChatInput />
    </Box>
  );
}