import {
    Box,
    Fade,
    HStack,
    IconButton,
    InputGroup,
    InputRightElement,
    ScaleFade,
    Text,
    Textarea,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiArrowUpBold } from "react-icons/pi";
import { useReducedMotion } from "../hooks/useAccessibility";
import { useChatStore } from "../store/useChatStore";

import { createErrorToast } from "../utils/errorHandler";
import { debounce } from "../utils/performanceOptimizer";
import { logSecurityEvent, validateInput } from "../utils/securityUtils";

/**
 * Enhanced ChatInput with advanced mobile/desktop optimization
 * Features:
 * - Smart auto-resize with performance optimization
 * - Enhanced mobile touch interactions
 * - Advanced accessibility features
 * - Intelligent placeholder suggestions
 * - Performance-optimized event handling
 */
export default function ChatInput() {
  const send = useChatStore((s) => s.sendMessage);
  const busy = useChatStore((s) => s.isLoading);
  const [txt, setTxt] = useState("");
  const [charCount, setCharCount] = useState(0);

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const prefersReducedMotion = useReducedMotion();



  // Enhanced input configuration with elegant rounded design - Made smaller
  const inputConfig = useMemo(() => ({
    minHeight: { xs: "40px", sm: "42px", md: "44px", lg: "46px", xl: "48px" },
    maxHeight: { xs: "120px", sm: "130px", md: "140px", lg: "150px", xl: "160px" },
    fontSize: { xs: "14px", sm: "14px", md: "15px", lg: "15px", xl: "16px" }, // Smaller font size
    padding: { xs: 3, sm: 3.5, md: 4, lg: 4.5, xl: 5 },
    // More rounded edges for modern, elegant design
    borderRadius: { xs: "3xl", sm: "3xl", md: "4xl", lg: "4xl", xl: "4xl" },
    // Optimized circular send button sizes for mobile and desktop
    sendButton: {
      base: "36px",  // Mobile: reduced from too large
      sm: "38px",    // Small mobile: slightly larger
      md: "42px",    // Desktop: increased for better click target
      lg: "44px",    // Large desktop: better visibility
      xl: "46px"     // XL desktop: optimal size
    }
  }), []);

  // Enhanced animation configuration with performance optimization
  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
    scale: prefersReducedMotion ? 'none' : 'scale(1.02)',
    focusTransform: prefersReducedMotion ? 'none' : 'translateY(-1px) scale(1.01)',
    shadowTransition: prefersReducedMotion ? 'none' : 'box-shadow 0.2s ease'
  }), [prefersReducedMotion]);

  // Mobile detection for enhanced touch interactions
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }, []);

  // Enhanced smart suggestions with contextual intelligence
  const placeholderSuggestions = useMemo(() => [
    "What do you want to know?",
    "Ask me anything...",
    "How can I help you today?",
    "What's on your mind?",
    "Need help with something?",
    "Tell me about...",
    "Help me understand...",
    "Explain how to...",
    "Give me ideas for...",
    "What are the benefits of...",
    "Compare and contrast...",
    "Walk me through...",
    "What's the best way to...",
    "Can you analyze...",
    "Help me solve..."
  ], []);

  const MAX_CHARS = 10000; // Increased limit - let backend control token restrictions

  // Performance-optimized text analysis with security validation
  const debouncedTextAnalysis = useMemo(
    () => debounce((text: string) => {
      setCharCount(text.length);

      // Real-time security validation (non-blocking)
      const validation = validateInput(text);
      if (!validation.isValid && text.length > 100) { // Only validate longer inputs
        logSecurityEvent({
          action: 'suspicious_input_detected',
          severity: 'low',
          details: { reason: validation.reason, inputLength: text.length }
        });
      }
    }, 100),
    []
  );

  useEffect(() => {
    debouncedTextAnalysis(txt);
  }, [txt, debouncedTextAnalysis]);

  // Enhanced placeholder cycling with focus awareness
  useEffect(() => {
    if (txt.length === 0 && !isFocused) {
      const interval = setInterval(() => {
        setCurrentPlaceholderIndex((prev) =>
          (prev + 1) % placeholderSuggestions.length
        );
      }, 4000); // Slightly slower for better UX

      return () => clearInterval(interval);
    }
  }, [txt.length, isFocused, placeholderSuggestions.length]);

  // Auto-resize functionality with performance optimization
  const handleAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate new height
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;

    // Apply height with constraints - smaller max heights
    const maxHeight = isMobile ? 120 : 160;
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [isMobile]);

  // Enhanced focus management
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    handleAutoResize();
  }, [handleAutoResize]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Enhanced send handler with security validation and haptic feedback
  const handleSend = useCallback(async () => {
    if (busy || !txt.trim()) return;

    const trimmedText = txt.trim();

    // Security validation
    const validation = validateInput(trimmedText);
    if (!validation.isValid) {
      logSecurityEvent({
        action: 'input_validation_failed',
        severity: 'medium',
        details: { reason: validation.reason, inputLength: trimmedText.length }
      });

      toast({
        title: "Invalid Input",
        description: validation.reason || "Please check your message and try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Length validation with user-friendly feedback
    if (trimmedText.length > MAX_CHARS) {
      toast({
        title: "Message too long",
        description: `Please keep your message under ${MAX_CHARS.toLocaleString()} characters. Current: ${trimmedText.length.toLocaleString()}`,
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Haptic feedback for mobile devices
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50); // Subtle haptic feedback
    }

    try {
      await send(txt.trim());

      // Enhanced cleanup with smooth transitions
      setTxt("");
      setCharCount(0);
      setIsFocused(false);

      // Smooth height reset
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Success haptic feedback
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]); // Success pattern
      }
    } catch (error) {
      // Enhanced error handling with haptic feedback
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]); // Error pattern
      }

      const errorToast = createErrorToast(error, {
        component: 'ChatInput',
        action: 'sendMessage'
      });

      // Only show toast for non-Firebase errors
      if (!error || !(error instanceof Error) || !error.message.includes('Firebase')) {
        toast(errorToast);
      }
    }
  }, [busy, txt, toast, send, isMobile]);

  // Enhanced keyboard handling with composition support
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't handle shortcuts during composition (for international keyboards)
    if (isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Enhanced Escape key functionality
    if (e.key === "Escape") {
      e.preventDefault();
      setTxt("");
      setCharCount(0);
      setIsFocused(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.blur();
      }
    }

    // Desktop-specific shortcuts
    if (!isMobile) {
      // Ctrl/Cmd + Enter for send (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }

      // Ctrl/Cmd + K to focus input (if not already focused)
      if ((e.ctrlKey || e.metaKey) && e.key === "k" && !isFocused) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    }
  }, [handleSend, isComposing, isMobile, isFocused]);

  // Composition event handlers for international keyboard support
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // Enhanced color system with dark grey send button
  const colorSystem = useMemo(() => ({
    shell: {
      bg: "#FFFFFF",
      border: isFocused ? "#3b82f6" : "#CBD5E1",
      shadow: isFocused
        ? "0 0 0 1px #3b82f6, 0 8px 24px rgba(59, 130, 246, 0.15)"
        : "0 2px 8px rgba(0, 0, 0, 0.04)"
    },
    page: {
      bg: "#FAFBFC",
      borderTop: "#E2E8F0"
    },
    button: {
      bg: txt.trim() ? "#374151" : "#F8FAFC", // Dark grey when ready
      color: txt.trim() ? "white" : "#64748B",
      border: txt.trim() ? "none" : "1px solid #CBD5E1",
      hover: {
        bg: txt.trim() ? "#1F2937" : "#E2E8F0", // Darker grey on hover
        border: txt.trim() ? "transparent" : "#94A3B8"
      },
      disabled: {
        bg: "#F1F5F9",
        color: "#94A3B8",
        border: "#E2E8F0"
      }
    },
    text: {
      primary: "#1E293B",
      placeholder: "#94A3B8",
      hint: "#94A3B8",
      hover: "#94A3B8"
    }
  }), [isFocused, txt]);

  return (
    <Box
      ref={containerRef}
      w="full"
      bg={colorSystem.page.bg}
      borderTopWidth="1px"
      borderColor={colorSystem.page.borderTop}
      position="sticky"
      bottom={0}
      zIndex={100}
      flexShrink={0}
      // Enhanced mobile support with performance optimization
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Safe area support for mobile devices
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        // Performance optimizations
        willChange: isFocused ? 'transform' : 'auto',
        backfaceVisibility: 'hidden',
        // Ensure input stays at bottom on mobile with proper sizing
        '@media (max-width: 768px)': {
          paddingX: 3,
          paddingY: 2,
          position: 'sticky',
          bottom: 0,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          // Prevent input from taking too much space
          maxHeight: '120px',
        },
        // Desktop optimization with centered container and enhanced styling
        '@media (min-width: 769px)': {
          maxHeight: '160px', // Increased for better desktop experience
          display: 'flex',
          justifyContent: 'center',
          paddingY: 6, // Increased vertical padding
          paddingX: 4, // Add horizontal padding
          // Subtle desktop-specific styling
          borderTop: '1px solid rgba(226, 232, 240, 0.6)',
          background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
        }
      }}
    >
      {/* Centered container for desktop, full width for mobile */}
      <Box
        w="100%"
        maxW={{
          base: "100%",
          md: "800px",   // Increased to match chat container
          lg: "900px",   // Increased for large screens
          xl: "1000px"   // Increased for XL screens
        }}
        px={{
          base: 1,    // Reduced from 3 for wider input on mobile
          sm: 2,      // Reduced from 3.5 for wider input on small screens
          md: 8,      // Increased from 6
          lg: 12,     // Increased from 8
          xl: 16      // Increased from 12
        }}
      >
        <ScaleFade in={true} initialScale={0.95}>
          <InputGroup
            w="full"
            bg="transparent"
            borderWidth="0"
            borderColor="transparent"
            borderRadius={inputConfig.borderRadius}
            px={{ base: 3, sm: 3.5, md: 0 }}
            py={{ base: 2.5, sm: 3, md: 3.5, lg: 4, xl: 4.5 }}
            alignItems="center"
            transition={animationConfig.transition}
            boxShadow="none"
            // Enhanced accessibility
            role="group"
            aria-label="Message input area"
            aria-expanded={isFocused}
            aria-busy={busy}
          >
          <Textarea
            ref={textareaRef}
            flex={1}
            variant="unstyled"
            placeholder={placeholderSuggestions[currentPlaceholderIndex]}
            value={txt}
            onChange={(e) => {
              setTxt(e.target.value);
              handleAutoResize();
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            isDisabled={busy}
            rows={1}
            minH={inputConfig.minHeight}
            maxH={inputConfig.maxHeight}
            resize="none"
            // Enhanced accessibility
            aria-label="Type your message here"
            aria-describedby="input-hints"
            aria-invalid={charCount > MAX_CHARS}
            aria-multiline="true"
            aria-expanded={isFocused}
            // Enhanced mobile support
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
            // Enhanced border and styling for desktop/mobile
            borderWidth="1px"
            borderColor={isFocused ? "#3b82f6" : "rgba(203, 213, 225, 0.8)"}
            borderRadius={inputConfig.borderRadius}
            bg="rgba(255, 255, 255, 0.98)" // Slightly more opaque for better readability
            backdropFilter="blur(12px)" // Increased blur for better glass effect
            boxShadow={isFocused
              ? "0 0 0 1px #3b82f6, 0 20px 50px rgba(59, 130, 246, 0.12)" // Enhanced desktop shadow
              : "0 4px 16px rgba(0, 0, 0, 0.06)" // Better default shadow
            }
            _placeholder={{
              color: colorSystem.text.placeholder,
              transition: animationConfig.transition,
              fontSize: inputConfig.fontSize,
              opacity: isFocused ? 0.5 : 0.7,
              transform: isFocused ? 'translateY(-1px)' : 'none'
            }}
            _focus={{
              outline: "none",
              borderColor: "#3b82f6",
              boxShadow: "0 0 0 1px #3b82f6, 0 20px 50px rgba(59, 130, 246, 0.12)", // Enhanced focus shadow
              transform: animationConfig.focusTransform,
            }}
            _hover={{
              borderColor: colorSystem.text.hover,
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)", // Enhanced hover shadow
              transform: prefersReducedMotion ? 'none' : 'translateY(-2px)', // Slightly more lift
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
              bg: "#F8FAFC"
            }}
            // Enhanced touch interactions with performance optimization
            sx={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              // Prevent zoom on iOS
              '@media (max-width: 768px)': {
                fontSize: '16px !important',
              },
              // Performance optimizations
              willChange: 'height',
              backfaceVisibility: 'hidden',
              // Enhanced scrolling
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#CBD5E1',
                borderRadius: '2px',
              },
            }}
            color={colorSystem.text.primary}
            pr={{ base: "4rem", sm: "4.5rem", md: "5rem", lg: "5.5rem" }} // Adjusted for new button sizes
            pl={{ base: "1rem", md: "1.5rem" }}
            py={{ base: "1rem", md: "1.25rem" }}
            fontSize={inputConfig.fontSize}
            lineHeight="1.5"
            fontWeight="400"
          />

          <InputRightElement
            width={{ base: "3.5rem", sm: "4rem", md: "4.5rem", lg: "5rem" }} // Adjusted for new button sizes
            top="50%"
            transform="translateY(-50%)"
            pr={{ base: 1, sm: 1, md: 1.5, lg: 2 }} // Adjusted padding
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            h="100%"
          >
            <HStack spacing={{ base: 1, md: 1.5 }} align="center" w="100%" justify="flex-end">

              {/* Smaller Circular Dark Grey Send Button */}
              <IconButton
                aria-label={txt.trim() ? "Send message" : "Enter a message to send"}
                aria-disabled={busy || !txt.trim()}
                icon={<PiArrowUpBold size={txt.trim() ? (isMobile ? 18 : 22) : (isMobile ? 16 : 20)} />}
                onClick={handleSend}
                isLoading={busy}
                size="sm"
                w={inputConfig.sendButton}
                h={inputConfig.sendButton}
                minW={inputConfig.sendButton}
                minH={inputConfig.sendButton}
                bg={colorSystem.button.bg}
                color={colorSystem.button.color}
                border={colorSystem.button.border}
                transition={animationConfig.transition}
                _hover={{
                  bg: colorSystem.button.hover.bg,
                  borderColor: colorSystem.button.hover.border,
                  transform: animationConfig.scale,
                  boxShadow: txt.trim() ? "0 4px 12px rgba(55, 65, 81, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
                _focus={{
                  boxShadow: txt.trim()
                    ? "0 0 0 2px rgba(55, 65, 81, 0.3)"
                    : "0 0 0 2px rgba(100, 116, 139, 0.3)",
                  outline: "2px solid transparent",
                  outlineOffset: "2px"
                }}
                _active={{
                  transform: prefersReducedMotion ? 'none' : "scale(0.90)",
                  bg: txt.trim() ? "#111827" : "#E2E8F0"
                }}
                _disabled={{
                  bg: colorSystem.button.disabled.bg,
                  color: colorSystem.button.disabled.color,
                  borderColor: colorSystem.button.disabled.border,
                  cursor: "not-allowed",
                  opacity: 0.6,
                  transform: "none"
                }}
                borderRadius="full"
                isDisabled={busy || !txt.trim()}
                flexShrink={0}
                sx={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  // Enhanced icon visibility and animation
                  '& svg': {
                    color: 'currentColor !important',
                    filter: txt.trim() ? 'none' : 'contrast(1.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: txt.trim() ? 'scale(1.05)' : 'scale(1)'
                  },
                  // Performance optimization
                  willChange: 'transform, box-shadow',
                  backfaceVisibility: 'hidden'
                }}
              />
            </HStack>
          </InputRightElement>
          </InputGroup>
        </ScaleFade>

        {/* Enhanced Input Hints and Status */}
        <Fade in={isFocused || txt.trim().length > 0}>
          <VStack spacing={1} mt={2} id="input-hints">
            {/* Send Instructions */}
            {txt.trim() && (
              <HStack spacing={3} justify="center" w="full">
                <Text
                  fontSize={{ base: "2xs", md: "xs" }}
                  color={colorSystem.text.hint}
                  opacity={0.8}
                  fontWeight="500"
                >
                  {isMobile ? "⏎ Send" : "⏎ Send • ⇧⏎ New line"}
                </Text>
              </HStack>
            )}

            {/* Desktop Shortcuts Hint */}
            {!isMobile && isFocused && !txt.trim() && (
              <Text
                fontSize="2xs"
                color={colorSystem.text.hint}
                opacity={0.6}
                textAlign="center"
                fontWeight="400"
              >
                Tip: Use Ctrl+K to focus input • Esc to clear
              </Text>
            )}
          </VStack>
        </Fade>
      </Box>
    </Box>
  );
}