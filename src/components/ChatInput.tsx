import {
    Box,
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
import { useMobileOptimization } from "../hooks/useMobileOptimization";
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
  const clearError = useChatStore((s) => s.clearError);
  const [txt, setTxt] = useState("");
  const [charCount, setCharCount] = useState(0);

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const prefersReducedMotion = useReducedMotion();



  // Enhanced mobile-first input configuration with improved touch targets
  const inputConfig = useMemo(() => ({
    // Enhanced responsive height with better mobile touch targets
    minHeight: {
      base: "56px",  // Increased for better mobile accessibility (minimum 44px + padding)
      sm: "58px",
      md: "60px",
      lg: "62px",
      xl: "64px"
    },
    // Optimized for exactly 3 lines of text with proper line height
    maxHeight: {
      base: "120px",   // 3 lines on mobile with enhanced spacing
      sm: "126px",
      md: "132px",
      lg: "138px",
      xl: "144px"
    },
    // Enhanced responsive font sizing to prevent zoom on iOS
    fontSize: {
      base: "max(16px, 1rem)",  // Prevent iOS zoom while maintaining readability
      sm: "max(16px, 1.0625rem)",
      md: "1.0625rem",
      lg: "1.125rem",
      xl: "1.1875rem"
    },
    lineHeight: "1.5", // Optimal readability
    // Enhanced responsive padding with better mobile spacing
    padding: {
      base: "clamp(0.875rem, 3.5vw, 1.125rem)",
      sm: "clamp(1rem, 3vw, 1.25rem)",
      md: "clamp(1.125rem, 2.5vw, 1.375rem)",
      lg: "clamp(1.25rem, 2vw, 1.5rem)",
      xl: "clamp(1.375rem, 1.5vw, 1.625rem)"
    },
    // Enhanced ultra-rounded edges for premium modern design
    borderRadius: "clamp(24px, 6vw, 32px)", // Increased fluid border radius
    // Enhanced circular send button sizes for optimal touch targets
    sendButton: {
      base: "48px",  // Enhanced mobile touch target (48px for better accessibility)
      sm: "50px",
      md: "52px",
      lg: "54px",
      xl: "56px"
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

  // Enhanced mobile detection with better accuracy
  const { isMobile } = useMobileOptimization();

  // Enhanced prompt suggestions with better mobile-friendly text
  const placeholderSuggestions = useMemo(() => [
    "Explain AI ensemble voting",
    "Create a React app guide",
    "Why is Hackensack elite?",
    "Design a leg workout",
    "Remote work analysis",
    "Solutions for world hunger",
    "Budget weekend trip ideas",
    "Tell me about Hackensack",
    "2024 app ideas",
    "Write persuasive email"
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

    // Enhanced mobile keyboard handling with visual viewport support
    if (isMobile) {
      // Add keyboard-visible class for CSS adjustments
      document.body.classList.add('keyboard-visible');

      // Enhanced keyboard positioning with visual viewport API
      const handleKeyboardPosition = () => {
        if (!textareaRef.current || !containerRef.current) return;

        // Use visual viewport API for better keyboard detection
        if (window.visualViewport) {
          const viewport = window.visualViewport;
          const keyboardHeight = window.innerHeight - viewport.height;

          if (keyboardHeight > 150) { // Keyboard is visible
            // Position input above keyboard
            const inputContainer = containerRef.current;
            inputContainer.style.transform = `translateY(-${keyboardHeight}px)`;
            inputContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          }
        } else {
          // Fallback for browsers without visual viewport API
          textareaRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      };

      // Immediate positioning
      handleKeyboardPosition();

      // Listen for viewport changes
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleKeyboardPosition);

        // Cleanup listener on blur
        const cleanup = () => {
          window.visualViewport?.removeEventListener('resize', handleKeyboardPosition);
        };

        // Store cleanup function for blur handler
        (textareaRef.current as any)._keyboardCleanup = cleanup;
      }

      // Delay for additional adjustments
      setTimeout(handleKeyboardPosition, 300);
    }
  }, [handleAutoResize, isMobile]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    // Enhanced mobile blur handling with keyboard cleanup
    if (isMobile) {
      // Remove keyboard-visible class
      document.body.classList.remove('keyboard-visible');

      // Reset input container position
      if (containerRef.current) {
        containerRef.current.style.transform = 'translateY(0)';
        containerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }

      // Clean up visual viewport listener
      const cleanup = (textareaRef.current as any)?._keyboardCleanup;
      if (cleanup) {
        cleanup();
        delete (textareaRef.current as any)._keyboardCleanup;
      }

      // Small delay to prevent layout jump
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = '';
        }
      }, 300);
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

      // Enhanced error filtering - only show critical errors to users
      if (!error || !(error instanceof Error)) {
        toast(errorToast);
      } else {
        const errorMessage = error.message.toLowerCase();
        const shouldShowToast = !errorMessage.includes('firebase') &&
                               !errorMessage.includes('permission') &&
                               !errorMessage.includes('insufficient') &&
                               !errorMessage.includes('sync') &&
                               !errorMessage.includes('offline');

        if (shouldShowToast) {
          toast(errorToast);
        }
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
      data-chat-input
      w="full"
      bg="transparent" // Remove white background
      borderTopWidth="0"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
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
        // Enhanced mobile input positioning for keyboard handling
        '@media (max-width: 768px)': {
          paddingX: 2,
          paddingY: 1,
          position: 'fixed !important',
          bottom: '0 !important',
          left: '0 !important',
          right: '0 !important',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 8px)',
          paddingRight: 'calc(env(safe-area-inset-right, 0px) + 8px)',
          maxHeight: '120px',
          zIndex: 1000, // Ensure it stays above content but below header
          // Enhanced background for better visibility
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(79, 156, 249, 0.08)',
          // Hardware acceleration for smooth keyboard transitions
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          // Smooth transitions for keyboard show/hide
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
          md: "850px",   // Enhanced to better match chat container
          lg: "950px",   // Enhanced for large screens
          xl: "1050px"   // Enhanced for XL screens
        }}
        px={{
          base: "clamp(0.75rem, 2vw, 1rem)",    // Enhanced mobile padding to prevent button cutoff
          sm: "clamp(1rem, 2.5vw, 1.25rem)",    // Enhanced small screen spacing
          md: "clamp(1.5rem, 4vw, 2rem)",       // Enhanced desktop spacing
          lg: "clamp(2rem, 5vw, 3rem)",         // Enhanced large screen spacing
          xl: "clamp(2.5rem, 6vw, 4rem)"        // Enhanced XL screen spacing
        }}
        position="relative"
        overflow="visible" // Ensure button overflow is visible
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
            position="relative"
            overflow="visible" // Ensure button isn't clipped
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
            className="chat-input-modern"
            placeholder={placeholderSuggestions[currentPlaceholderIndex]}
            value={txt}
            onChange={(e) => {
              setTxt(e.target.value);
              handleAutoResize();
              // Clear any existing errors when user starts typing
              if (e.target.value.trim() && clearError) {
                clearError();
              }
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
            borderWidth="1.5px"
            borderColor={isFocused ? "#4F9CF9" : "rgba(226, 232, 240, 0.8)"}
            borderRadius={inputConfig.borderRadius} // Fluid border radius
            bg="rgba(255, 255, 255, 0.98)" // Enhanced glass background
            backdropFilter="blur(32px)" // Enhanced blur for premium glass effect
            lineHeight={inputConfig.lineHeight} // Consistent line height for proper 3-line calculation
            boxShadow={isFocused
              ? "0 0 0 2px rgba(79, 156, 249, 0.2), 0 12px 40px rgba(79, 156, 249, 0.12), 0 6px 20px rgba(79, 156, 249, 0.06)" // Enhanced focus shadow
              : "0 4px 16px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.04)" // Enhanced glass shadow
            }
            _placeholder={{
              color: colorSystem.text.placeholder,
              transition: animationConfig.transition,
              fontSize: inputConfig.fontSize,
              fontWeight: "400", // Lighter weight for placeholder
              fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
              letterSpacing: "-0.008em", // Slightly less letter spacing for placeholder
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
              // Enhanced typography features
              fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11', 'ss01', 'ss02'",
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
            pr={{ base: "4rem", sm: "4.5rem", md: "5rem", lg: "5.5rem" }} // Enhanced padding to prevent button cutoff
            pl={{ base: "1rem", md: "1.5rem" }} // Consistent left padding
            py={{ base: "0.875rem", md: "1.25rem" }} // Consistent vertical padding
            fontSize={inputConfig.fontSize}
            fontWeight="450" // Slightly heavier for better readability
            fontFamily="'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"
            letterSpacing="-0.011em" // Improved letter spacing for modern look
          />

          <InputRightElement
            width={{ base: "4rem", sm: "4.5rem", md: "5rem", lg: "5.5rem" }} // Enhanced width to match textarea padding
            top="50%"
            transform="translateY(-50%)"
            pr={{ base: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1.25rem" }} // Enhanced padding for proper button positioning
            display="flex"
            alignItems="center"
            justifyContent="center" // Center the button within the container
            h="100%"
            position="absolute"
            right={0}
            zIndex={2}
          >
            {/* Enhanced Modern Send Button - Optimized Positioning */}
            <IconButton
              aria-label={txt.trim() ? "Send message" : "Enter a message to send"}
              aria-disabled={busy || !txt.trim()}
              icon={<PiArrowUpBold size={txt.trim() ? (isMobile ? 18 : 20) : (isMobile ? 16 : 18)} />}
              onClick={handleSend}
              isLoading={busy}
              size="sm"
              w={inputConfig.sendButton}
              h={inputConfig.sendButton}
              minW={inputConfig.sendButton}
              minH={inputConfig.sendButton}
              maxW={inputConfig.sendButton}
              maxH={inputConfig.sendButton}
              bg={txt.trim() ? colorSystem.button.bg : "rgba(148, 163, 184, 0.1)"}
              color={txt.trim() ? colorSystem.button.color : "rgba(148, 163, 184, 0.6)"}
              border={txt.trim() ? colorSystem.button.border : "1px solid rgba(148, 163, 184, 0.2)"}
              borderRadius="full"
              transition={animationConfig.transition}
              cursor={txt.trim() ? "pointer" : "not-allowed"}
              flexShrink={0}
              flexGrow={0}
              position="relative"
              _hover={{
                bg: txt.trim() ? colorSystem.button.hover.bg : "rgba(148, 163, 184, 0.15)",
                borderColor: txt.trim() ? colorSystem.button.hover.border : "rgba(148, 163, 184, 0.3)",
                transform: txt.trim() && !prefersReducedMotion ? "scale(1.05)" : "none",
                boxShadow: txt.trim() ? "0 8px 25px rgba(79, 156, 249, 0.35)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
              _focus={{
                boxShadow: txt.trim()
                  ? "0 0 0 3px rgba(79, 156, 249, 0.4), 0 8px 25px rgba(79, 156, 249, 0.2)"
                  : "0 0 0 2px rgba(148, 163, 184, 0.4)",
                outline: "none",
                outlineOffset: "2px"
              }}
              _active={{
                transform: prefersReducedMotion ? 'none' : "scale(0.95)",
                bg: txt.trim() ? "#3B82F6" : "#E2E8F0",
                boxShadow: txt.trim() ? "0 4px 15px rgba(79, 156, 249, 0.4)" : "0 1px 4px rgba(0, 0, 0, 0.1)"
              }}
              _disabled={{
                bg: colorSystem.button.disabled.bg,
                color: colorSystem.button.disabled.color,
                borderColor: colorSystem.button.disabled.border,
                cursor: "not-allowed",
                opacity: 0.5,
                transform: "none",
                boxShadow: "none"
              }}
              isDisabled={busy || !txt.trim()}
              sx={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                // Enhanced button positioning
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Prevent button from being cut off
                overflow: 'visible',
                // Enhanced mobile touch target
                '@media (max-width: 768px)': {
                  minWidth: inputConfig.sendButton.base,
                  minHeight: inputConfig.sendButton.base,
                },
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
          </InputRightElement>
          </InputGroup>
        </ScaleFade>


      </Box>
    </Box>
  );
}