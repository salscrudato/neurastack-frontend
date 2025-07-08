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
import { SaveSessionButton } from '../components/SaveSessionButton';
import { useReducedMotion } from '../hooks/useAccessibility';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useHistoryStore } from '../store/useHistoryStore';

export function ChatPage() {
  const msgs = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);

  // Auth and history stores
  const user = useAuthStore((s) => s.user);
  const { loadAllSessions } = useHistoryStore();

  // Refs and state
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [, setFocusedMessageIndex] = useState(-1);
  const prefersReducedMotion = useReducedMotion();

  // Color scheme
  const bgColor = "#FAFBFC";
  const containerBg = "#FAFBFC";
  const scrollButtonBg = "#FFFFFF";
  const scrollButtonColor = "#4F9CF9";
  const scrollButtonHoverBg = "#F8FAFC";
  const heroTextColor = "#1E293B";
  const heroSubTextColor = "#64748B";

  // Responsive configuration
  const chatConfig = useMemo(
    () => ({
      container: {
        padding: {
          base: "clamp(0.25rem, 1vw, 0.5rem)",
          sm: "clamp(0.5rem, 1.5vw, 0.75rem)",
          md: 0,
          lg: 0,
          xl: 0,
        },
        gap: {
          base: "clamp(0.75rem, 2.5vw, 1.25rem)", // Increased for better mobile readability
          sm: "clamp(0.75rem, 2.5vw, 1.25rem)",
          md: "clamp(1rem, 3vw, 1.5rem)",
          lg: "clamp(1.25rem, 3.5vw, 1.75rem)",
          xl: "clamp(1.5rem, 4vw, 2rem)",
        },
        maxWidth: {
          base: "100%",
          md: "850px",
          lg: "950px",
          xl: "1050px",
        },
        centerPadding: {
          md: "clamp(1.5rem, 4vw, 2rem)",
          lg: "clamp(2rem, 5vw, 2.5rem)",
          xl: "clamp(2.5rem, 6vw, 3rem)",
        },
      },
      hero: {
        fontSize: { base: "lg", sm: "xl", md: "2xl", lg: "3xl", xl: "4xl" }, // Adjusted for small screens
        subFontSize: { base: "sm", sm: "md", md: "lg", lg: "xl", xl: "2xl" },
        padding: { base: 4, sm: 6, md: 8, lg: 10, xl: 12 }, // Reduced for mobile
      },
      scrollButton: {
        size: { base: "sm", sm: "md", md: "md", lg: "lg" },
        bottom: { base: "80px", sm: "85px", md: "100px", lg: "110px", xl: "120px" },
        right: { base: "16px", sm: "20px", md: "32px", lg: "40px", xl: "48px" },
      },
    }),
    []
  );

  // Animation configuration
  const animationConfig = useMemo(
    () => ({
      transition: prefersReducedMotion ? "none" : "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      transform: prefersReducedMotion ? "none" : "translateY(-2px)",
    }),
    [prefersReducedMotion]
  );

  // Load sessions when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllSessions();
    }
  }, [user, loadAllSessions]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Scroll handling
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!isNearBottom && msgs.length > 0);
  }, [msgs.length]);

  // Debounced scroll handler
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          setFocusedMessageIndex((prev) => {
            const newIndex = Math.max(0, prev - 1);
            document.getElementById(`message-${msgs[newIndex]?.id}`)?.focus();
            return newIndex;
          });
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedMessageIndex((prev) => {
            const newIndex = Math.min(msgs.length - 1, prev + 1);
            document.getElementById(`message-${msgs[newIndex]?.id}`)?.focus();
            return newIndex;
          });
          break;
        case "Home":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setFocusedMessageIndex(0);
            document.getElementById(`message-${msgs[0]?.id}`)?.focus();
          }
          break;
        case "End":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const lastIndex = msgs.length - 1;
            setFocusedMessageIndex(lastIndex);
            document.getElementById(`message-${msgs[lastIndex]?.id}`)?.focus();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [msgs]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  // Additional keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "End" && e.ctrlKey) {
        e.preventDefault();
        scrollToBottom();
      }
      if (e.key === "Home" && e.ctrlKey) {
        e.preventDefault();
        messagesContainerRef.current?.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    },
    [scrollToBottom, prefersReducedMotion]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Flex
      direction="column"
      h="100%"
      minH="100%"
      p="0px"
      bg={bgColor}
      position="relative"
      data-testid="chat-page"
      sx={{
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        "@media (max-width: 768px)": {
          height: "calc(100vh - env(safe-area-inset-top) - 60px)",
          minHeight: "calc(100vh - env(safe-area-inset-top) - 60px)",
          maxHeight: "calc(100vh - env(safe-area-inset-top) - 60px)",
          paddingBottom: "calc(100px + env(safe-area-inset-bottom))",
          overflowY: "auto",
          overscrollBehavior: "contain",
          // Enhanced mobile scrolling
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
          // Prevent content from jumping during keyboard show/hide
          position: "relative",
        },
        "@media (min-width: 769px)": {
          height: "calc(100vh - 64px)",
          minHeight: "calc(100vh - 64px)",
          maxHeight: "calc(100vh - 64px)",
          background: "#FAFBFC",
        },
        "@supports (-webkit-touch-callout: none)": {
          "@media (max-width: 768px)": {
            height: "calc(-webkit-fill-available - 56px)",
            minHeight: "calc(-webkit-fill-available - 56px)",
            maxHeight: "calc(-webkit-fill-available - 56px)",
          },
          "@media (min-width: 769px)": {
            height: "calc(-webkit-fill-available - 64px)",
            minHeight: "calc(-webkit relentless-available - 64px)",
            maxHeight: "calc(-webkit-fill-available - 64px)",
          },
        },
      }}
    >
      {/* Hero Section */}
      {msgs.length === 0 && (
        <Flex flex={1} align="center" justify="center" w="100%" role="main" aria-label="Welcome message">
          <Box w="100%" maxW={chatConfig.container.maxWidth} px={chatConfig.container.centerPadding} py={chatConfig.hero.padding}>
            <Box textAlign="center" maxW={{ base: "sm", sm: "md", md: "2xl", lg: "3xl" }} mx="auto">
              <Text
                fontSize={chatConfig.hero.fontSize}
                lineHeight="shorter"
                fontWeight="bold"
                color={heroTextColor}
                mb={4}
                as="h1"
                role="heading"
                aria-level={1}
              >
                What do you want to know?
              </Text>
              <Text
                fontSize={chatConfig.hero.subFontSize}
                color={heroSubTextColor}
                fontWeight="medium"
                opacity={0.8}
                lineHeight="normal"
                as="p"
                role="text"
                maxW="2xl"
                mx="auto"
              >
                The team will look into it...
              </Text>
            </Box>
          </Box>
        </Flex>
      )}

      {/* Messages Container */}
      <Box
        ref={messagesContainerRef}
        flex="1"
        w="100%"
        bg={containerBg}
        overflowY="auto"
        overflowX="hidden"
        sx={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          "@media (max-width: 768px)": {
            paddingX: "clamp(0.5rem, 2vw, 1rem)",
            paddingY: "clamp(0.5rem, 2vw, 1rem)",
            paddingBottom: "clamp(0.5rem, 2vw, 1rem)",
            maxHeight: "calc(100vh - clamp(52px, 12vw, 56px) - clamp(80px, 20vw, 100px))",
            scrollBehavior: "smooth",
            scrollSnapType: "y proximity",
            touchAction: "pan-y",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          },
          "@media (min-width: 769px)": {
            maxHeight: "calc(100vh - 64px - clamp(120px, 15vw, 140px))",
            display: "flex",
            justifyContent: "center",
            paddingY: "clamp(1rem, 3vw, 1.5rem)",
            paddingX: "clamp(1rem, 2vw, 1.25rem)",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.05)", borderRadius: "3px" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(79, 156, 249, 0.3)",
              borderRadius: "3px",
              "&:hover": { background: "rgba(79, 156, 249, 0.5)" },
            },
          },
        }}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        <Box w="100%" maxW={chatConfig.container.maxWidth} px={chatConfig.container.centerPadding}>
          <Flex direction="column" align="stretch" gap={chatConfig.container.gap}>
            {msgs.map((m, index) => {
              const isFirstAssistantMessage =
                m.role === "assistant" && msgs.slice(0, index).every((prevMsg) => prevMsg.role !== "assistant");
              return (
                <Box
                  key={m.id}
                  id={`message-${m.id}`}
                  px={0}
                  py={0}
                  role="article"
                  aria-label={`Message ${index + 1} from ${m.role === "user" ? "you" : "AI assistant"}`}
                  aria-describedby={`message-content-${m.id}`}
                  tabIndex={-1}
                  _focus={{ outline: "none" }}
                >
                  <ChatMessage message={m} isFirstAssistantMessage={isFirstAssistantMessage} isHighlighted={false} />
                </Box>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <Box px={4} py={2}>
                <Loader variant="team" />
              </Box>
            )}

            {/* Save Session Button */}
            {msgs.length > 0 && !isLoading && <SaveSessionButton />}

            <div ref={bottomRef} />
          </Flex>
        </Box>
      </Box>

      {/* Scroll to Bottom Button */}
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
          minW={{ base: "44px", sm: "46px", md: "48px", lg: "52px" }}
          h={{ base: "44px", sm: "46px", md: "48px", lg: "52px" }}
          _hover={{
            bg: scrollButtonHoverBg,
            transform: animationConfig.transform,
            boxShadow: "0 8px 32px rgba(79, 156, 249, 0.2)",
            borderColor: "rgba(79, 156, 249, 0.2)",
          }}
          _focus={{ outline: "2px solid #4F9CF9", outlineOffset: "2px", bg: scrollButtonHoverBg }}
          _active={{ transform: prefersReducedMotion ? "none" : "scale(0.95)", bg: scrollButtonHoverBg }}
          onClick={scrollToBottom}
          zIndex={10}
          transform="rotate(180deg)"
          sx={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        />
      )}

      {/* Chat Input */}
      <ChatInput />
    </Flex>
  );
}