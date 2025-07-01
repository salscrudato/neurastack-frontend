import {
  Box,
  HStack,
  IconButton,
  InputGroup,
  InputRightElement,
  ScaleFade,
  Textarea,
  useToast
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



  // Enhanced input configuration with modern clean design
  const inputConfig = useMemo(() => ({
    minHeight: { xs: "44px", sm: "46px", md: "48px", lg: "50px", xl: "52px" },
    // Optimized for exactly 3 lines of text with proper line height
    maxHeight: { xs: "84px", sm: "90px", md: "96px", lg: "102px", xl: "108px" }, // ~3 lines
    fontSize: { xs: "16px", sm: "16px", md: "16px", lg: "16px", xl: "16px" }, // Consistent 16px for better readability
    lineHeight: "1.4", // Optimal line height for readability
    padding: { xs: 3, sm: 3.5, md: 4, lg: 4.5, xl: 5 },
    // Ultra-rounded edges for modern, clean design
    borderRadius: "24px", // Consistent ultra-rounded design
    // Optimized circular send button sizes for mobile and desktop
    sendButton: {
      base: "36px",  // Mobile: better touch target
      sm: "36px",    // Small mobile: consistent size
      md: "40px",    // Desktop: clean and proportional
      lg: "40px",    // Large desktop: consistent
      xl: "40px"     // XL desktop: optimal size
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

  // 10 short, innovative prompt suggestions for one-line display
  const placeholderSuggestions = useMemo(() => [
    "Explain an AI ensemble with voting",
    "How do I create a React app?",
    "Why is Hackensack, NJ elite?",
    "Design a quick leg workout",
    "Analyze remote work impacts",
    "Generate solutions for world hunger",
    "Plan a budget weekend trip",
    "Teach me something about Hackensack",
    "Brainstorm app ideas for 2024",
    "Help write a persuasive email"
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

  // Auto-resize functionality optimized for 3-line maximum
  const handleAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate new height
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;

    // Calculate line height and max height for exactly 3 lines
    const lineHeight = 24; // 16px font * 1.4 line-height + padding
    const maxHeight = lineHeight * 3 + 16; // 3 lines + padding
    const minHeight = isMobile ? 44 : 48;

    // Apply height with constraints
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = `${newHeight}px`;

    // Enable internal scrolling when content exceeds 3 lines
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }, [isMobile]);

  // Enhanced focus management with mobile optimization
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    handleAutoResize();

    // Mobile-specific optimizations
    if (isMobile) {
      // Prevent body scroll when input is focused
      document.body.style.overflow = 'hidden';
      // Ensure input stays in view
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Delay to allow keyboard animation
    }
  }, [handleAutoResize, isMobile]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    // Restore body scroll on mobile when input loses focus
    if (isMobile) {
      document.body.style.overflow = 'auto';
    }
  }, [isMobile]);

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

  // Enhanced color system with modern glass design
  const colorSystem = useMemo(() => ({
    shell: {
      bg: "rgba(255, 255, 255, 0.95)",
      border: isFocused ? "#4F9CF9" : "rgba(226, 232, 240, 0.8)",
      shadow: isFocused
        ? "0 0 0 1px #4F9CF9, 0 8px 32px rgba(79, 156, 249, 0.15), 0 4px 16px rgba(79, 156, 249, 0.08)"
        : "0 2px 12px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.02)"
    },
    page: {
      bg: "#FAFBFC",
      borderTop: "transparent" // Remove border for cleaner look
    },
    button: {
      bg: txt.trim() ? "linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)" : "#F1F5F9",
      color: txt.trim() ? "white" : "#94A3B8",
      border: "none", // Remove borders for cleaner look
      hover: {
        bg: txt.trim() ? "linear-gradient(135deg, #3B82F6 0%, #5B21B6 100%)" : "#E2E8F0",
        border: "transparent",
        transform: "translateY(-1px)",
        shadow: txt.trim() ? "0 8px 20px rgba(79, 156, 249, 0.35)" : "0 4px 12px rgba(0, 0, 0, 0.08)"
      },
      disabled: {
        bg: "#F1F5F9",
        color: "#CBD5E1",
        border: "transparent"
      }
    },
    text: {
      primary: "#1E293B",
      placeholder: "#94A3B8",
      hint: "#64748B",
      hover: "#64748B"
    }
  }), [isFocused, txt]);

  return (
    <Box
      ref={containerRef}
      w="full"
      bg="transparent" // Remove white background
      borderTopWidth="0"
      position="sticky"
      bottom={0}
      zIndex={100}
      flexShrink={0}
      // Enhanced mobile support with performance optimization
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Safe area support for mobile devices
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)', // Reduced padding
        // Performance optimizations
        willChange: isFocused ? 'transform' : 'auto',
        backfaceVisibility: 'hidden',
        // Optimized mobile input for native app feeling
        '@media (max-width: 768px)': {
          paddingX: 2, // Reduced padding to minimize white space
          paddingY: 0, // No vertical padding to eliminate extra space
          position: 'fixed', // Fixed positioning for better mobile behavior
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)', // Reduced
          // Allow expansion for 3 lines of text
          maxHeight: '120px', // Reduced to minimize blocking
          zIndex: 1000, // Ensure it stays above content
          // Transparent background to not block content
          background: 'transparent',
        },
        // Desktop optimization with centered container and clean styling
        '@media (min-width: 769px)': {
          maxHeight: '140px', // Reduced
          display: 'flex',
          justifyContent: 'center',
          paddingY: 0, // No vertical padding to eliminate extra space
          paddingX: 2, // Reduced horizontal padding
          // Transparent background
          background: 'transparent',
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
          base: 1,    // Minimal padding for maximum input width on mobile
          sm: 2,      // Slightly more on small screens
          md: 8,      // Maintained desktop spacing
          lg: 12,     // Maintained large screen spacing
          xl: 16      // Maintained XL screen spacing
        }}
      >
        <ScaleFade in={true} initialScale={0.95}>
          <InputGroup
            w="full"
            bg="transparent"
            borderWidth="0"
            borderColor="transparent"
            borderRadius={inputConfig.borderRadius}
            px={{ base: 2, sm: 2, md: 0 }} // Minimal mobile padding to reduce white space
            py={{ base: 0, sm: 0, md: 1, lg: 1, xl: 1 }} // Minimal padding to eliminate extra space
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
            // Enhanced border and styling for modern clean design
            borderWidth="1px"
            borderColor={isFocused ? "#4F9CF9" : "rgba(226, 232, 240, 0.6)"}
            borderRadius="20px" // More rounded for modern Apple-like design
            bg="rgba(255, 255, 255, 0.95)" // Enhanced glass background
            backdropFilter="blur(24px)" // Enhanced blur for premium glass effect
            lineHeight={inputConfig.lineHeight} // Consistent line height for proper 3-line calculation
            boxShadow={isFocused
              ? "0 0 0 1px rgba(79, 156, 249, 0.3), 0 8px 32px rgba(79, 156, 249, 0.15), 0 4px 16px rgba(79, 156, 249, 0.08)" // Enhanced focus shadow
              : "0 2px 12px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.02)" // Enhanced glass shadow
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
              borderColor: "#4F9CF9",
              boxShadow: "0 0 0 1px #4F9CF9, 0 12px 40px rgba(79, 156, 249, 0.08)", // Clean focus shadow
              transform: animationConfig.focusTransform,
            }}
            _hover={{
              borderColor: "#4F9CF9",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)", // Subtle hover shadow
              transform: prefersReducedMotion ? 'none' : 'translateY(-1px)', // Gentle lift
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
              bg: "#F8FAFC"
            }}
            // Enhanced touch interactions with performance optimization and scrollbar styling
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
              // Enhanced scrolling with hidden scrollbar
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
            color={colorSystem.text.primary}
            pr={{ base: "3rem", sm: "3.5rem", md: "4.5rem", lg: "5rem" }} // Optimized for mobile width
            pl={{ base: "1rem", md: "1.5rem" }} // Reduced mobile padding
            py={{ base: "0.875rem", md: "1.25rem" }} // Reduced mobile padding
            fontSize={inputConfig.fontSize}
            fontWeight="400"
          />

          <InputRightElement
            width={{ base: "3rem", sm: "3.5rem", md: "4rem", lg: "4.5rem" }} // Adjusted for smaller button sizes
            top="50%"
            transform="translateY(-50%)"
            pr={{ base: 1, sm: 1, md: 1.5, lg: 2 }} // Adjusted padding
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            h="100%"
          >
            <HStack spacing={{ base: 1, md: 1.5 }} align="center" w="100%" justify="flex-end">

              {/* Modern Clean Send Button */}
              <IconButton
                aria-label={txt.trim() ? "Send message" : "Enter a message to send"}
                aria-disabled={busy || !txt.trim()}
                icon={<PiArrowUpBold size={txt.trim() ? (isMobile ? 16 : 18) : (isMobile ? 14 : 16)} />}
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
                  boxShadow: txt.trim() ? "0 4px 16px rgba(79, 156, 249, 0.25)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
                }}
                _focus={{
                  boxShadow: txt.trim()
                    ? "0 0 0 2px rgba(79, 156, 249, 0.3)"
                    : "0 0 0 2px rgba(148, 163, 184, 0.3)",
                  outline: "2px solid transparent",
                  outlineOffset: "2px"
                }}
                _active={{
                  transform: prefersReducedMotion ? 'none' : "scale(0.95)",
                  bg: txt.trim() ? "#3B82F6" : "#E2E8F0"
                }}
                _disabled={{
                  bg: colorSystem.button.disabled.bg,
                  color: colorSystem.button.disabled.color,
                  borderColor: colorSystem.button.disabled.border,
                  cursor: "not-allowed",
                  opacity: 0.5,
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


      </Box>
    </Box>
  );
}