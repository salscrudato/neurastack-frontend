import {
    Box,
    Flex,
    IconButton,
    InputGroup,
    InputRightElement,
    ScaleFade,
    Textarea,
    Tooltip
} from "@chakra-ui/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiArrowUpBold } from "react-icons/pi";
import { useReducedMotion } from "../hooks/useAccessibility";
import { useMobileOptimization } from "../hooks/useMobileOptimization";
import { useChatStore } from "../store/useChatStore";
import { debounce } from "../utils/performanceOptimizer";
import { logSecurityEvent, validateInput } from "../utils/securityUtils";

// Enhanced SendButton component with improved animations
const SendButton = memo(({ isActive, isLoading, onClick, isDisabled }: {
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
  isDisabled: boolean;
}) => {
  const { isMobile, triggerHaptic } = useMobileOptimization();

  const buttonStyles = useMemo(() => ({
    bg: isActive ? "rgba(255, 255, 255, 0.98)" : "rgba(248, 250, 252, 0.85)",
    color: isActive ? "var(--color-brand-primary)" : "var(--color-text-muted)",
    border: `1px solid ${isActive ? "rgba(79, 156, 249, 0.3)" : "rgba(148, 163, 184, 0.25)"}`,
    boxShadow: isActive
      ? "var(--shadow-brand), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
      : "var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
  }), [isActive]);

  return (
    <Tooltip
      label={isActive ? "Send message" : "Enter a message to send"}
      hasArrow
      placement="top"
      bg="var(--color-surface-glass-strong)"
      color="var(--color-text-primary)"
      borderRadius="var(--radius-lg)"
      backdropFilter="blur(12px)"
    >
      <IconButton
        aria-label={isActive ? "Send message" : "Enter a message to send"}
        icon={
          <Box position="relative">
            <PiArrowUpBold
              size={isActive ? (isMobile ? 18 : 20) : (isMobile ? 16 : 18)}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(-10deg)',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(79, 156, 249, 0.4))' : 'none'
              }}
            />
            {isActive && (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="24px"
                h="24px"
                borderRadius="full"
                border="2px solid rgba(79, 156, 249, 0.3)"
                animation="neuralPulse 2s ease-in-out infinite"
                sx={{
                  '@keyframes neuralPulse': {
                    '0%, 100%': {
                      transform: 'translate(-50%, -50%) scale(0.8)',
                      opacity: 0.3
                    },
                    '50%': {
                      transform: 'translate(-50%, -50%) scale(1.2)',
                      opacity: 0.1
                    }
                  }
                }}
              />
            )}
          </Box>
        }
        onClick={() => {
          if (!isDisabled && isActive) {
            triggerHaptic('button');
            onClick();
          }
        }}
        isLoading={isLoading}
        size="sm"
        w={{ base: "40px", md: "44px" }}
        h={{ base: "40px", md: "44px" }}
        minW={{ base: "40px", md: "44px" }}
        minH={{ base: "40px", md: "44px" }}
        borderRadius="full"
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        cursor={isDisabled ? "not-allowed" : (isActive ? "pointer" : "not-allowed")}
        position="relative"
        overflow="hidden"
        backdropFilter="blur(20px)"
        isDisabled={isDisabled}
        opacity={isDisabled && isActive ? 0.7 : 1}
        {...buttonStyles}
        _hover={isActive ? {
          bg: "rgba(255, 255, 255, 1)",
          borderColor: "rgba(79, 156, 249, 0.4)",
          color: "var(--color-brand-primary-hover)",
          transform: "scale(1.05) translateY(-2px)",
          boxShadow: "var(--shadow-brand-hover), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
        } : {
          bg: "rgba(248, 250, 252, 0.9)",
          borderColor: "rgba(148, 163, 184, 0.35)"
        }}
        _focus={{
          outline: "none",
          boxShadow: isActive
            ? "0 0 0 3px rgba(79, 156, 249, 0.3)"
            : "0 0 0 2px rgba(148, 163, 184, 0.3)"
        }}
        _active={{
          transform: "scale(0.95)",
          boxShadow: isActive
            ? "var(--shadow-brand-active)"
            : "var(--shadow-card)"
        }}
        sx={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          willChange: 'transform, box-shadow',
          backfaceVisibility: 'hidden'
        }}
      />
    </Tooltip>
  );
});

SendButton.displayName = 'SendButton';

interface ChatInputProps {
  onSend: (prompt: string) => Promise<void>;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const busy = useChatStore((s) => s.isLoading);
  const [txt, setTxt] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialHeightRef = useRef<number>(window.innerHeight);
  const prefersReducedMotion = useReducedMotion();
  const { isMobile, triggerHaptic } = useMobileOptimization();



  const inputConfig = useMemo(() => ({
    minHeight: { base: "48px", sm: "50px", md: "52px", lg: "54px", xl: "56px" },
    maxHeight: { base: "120px", sm: "128px", md: "136px", lg: "144px", xl: "152px" },
    fontSize: { base: "max(16px, 1rem)", sm: "max(16px, 1rem)", md: "1rem", lg: "1.0625rem", xl: "1.125rem" },
    lineHeight: "1.5",
    padding: { base: "1rem 1.25rem", sm: "1.125rem 1.375rem", md: "1.25rem 1.5rem", lg: "1.375rem 1.625rem", xl: "1.5rem 1.75rem" },
    borderRadius: "var(--radius-3xl)",
    sendButton: { base: "44px", sm: "46px", md: "48px", lg: "50px", xl: "52px" }
  }), []);

  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'var(--transition-normal)',
    hoverTransform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
    focusTransform: prefersReducedMotion ? 'none' : 'translateY(-2px) scale(1.005)',
    activeTransform: prefersReducedMotion ? 'none' : 'translateY(0px) scale(0.998)',
    shadowTransition: prefersReducedMotion ? 'none' : 'var(--transition-fast)'
  }), [prefersReducedMotion]);

  const placeholderSuggestions = useMemo(() => [
    "Explain quantum computing basics", "Generate 2025 startup ideas", "Design a sustainable workout plan", "Analyze remote work trends",
    "Create a persuasive business email", "Solutions for climate change", "Budget travel ideas for Europe", "Tell me about neural networks",
    "AI ethics discussion", "Write a short sci-fi story"
  ], []);

  const MAX_CHARS = 10000;

  const debouncedTextAnalysis = useMemo(() => debounce((text: string) => {
    setCharCount(text.length);
    const validation = validateInput(text);
    if (!validation.isValid && text.length > 100) {
      logSecurityEvent({ action: 'suspicious_input_detected', severity: 'low', details: { reason: validation.reason, inputLength: text.length } });
    }
  }, 100), []);

  useEffect(() => { debouncedTextAnalysis(txt); }, [txt, debouncedTextAnalysis]);

  useEffect(() => {
    const updateInitialHeight = () => {
      if (!document.body.classList.contains('keyboard-visible')) {
        initialHeightRef.current = window.innerHeight;
      }
    };
    window.addEventListener('resize', updateInitialHeight);
    updateInitialHeight();
    return () => window.removeEventListener('resize', updateInitialHeight);
  }, []);

  useEffect(() => {
    if (txt.length === 0 && !isFocused) {
      const interval = setInterval(() => setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length), 4000);
      return () => clearInterval(interval);
    }
  }, [txt.length, isFocused, placeholderSuggestions.length]);

  const handleAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = 24;
    const maxHeight = lineHeight * 3 + 16;
    const minHeight = isMobile ? 44 : 48;
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [isMobile]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    handleAutoResize();
    // Subtle haptic feedback on focus
    triggerHaptic('light');
    if (isMobile) {
      document.body.classList.add('keyboard-visible');
      const updateKeyboardHeight = () => {
        let kh = 0;
        if (window.visualViewport) {
          kh = window.innerHeight - window.visualViewport.height;
        } else {
          kh = initialHeightRef.current - window.innerHeight;
        }
        if (kh < 0) kh = 0;
        if (kh > 100 && isFocused) {
          if (containerRef.current) {
            containerRef.current.style.bottom = `${kh}px`;
            containerRef.current.style.transition = 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          }
        } else {
          if (containerRef.current) {
            containerRef.current.style.bottom = `0px`;
            containerRef.current.style.transition = 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          }
        }
      };
      updateKeyboardHeight();
      const eventTarget = window.visualViewport ? window.visualViewport : window;
      eventTarget.addEventListener('resize', updateKeyboardHeight);
      if (textareaRef.current) {
        (textareaRef.current as any)._keyboardCleanup = () => {
          eventTarget.removeEventListener('resize', updateKeyboardHeight);
        };
      }
      setTimeout(updateKeyboardHeight, 100);
      setTimeout(updateKeyboardHeight, 300);
    }
  }, [handleAutoResize, isMobile, isFocused, triggerHaptic]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (isMobile) {
      document.body.classList.remove('keyboard-visible');
      if (containerRef.current) {
        containerRef.current.style.bottom = '0px';
        containerRef.current.style.transition = 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      const cleanup = (textareaRef.current as any)?._keyboardCleanup;
      if (cleanup) {
        cleanup();
        delete (textareaRef.current as any)._keyboardCleanup;
      }
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = '';
        }
        initialHeightRef.current = window.innerHeight;
      }, 300);
    }
  }, [isMobile]);

  const handleSend = useCallback(async () => {
    if (busy || !txt.trim()) return;
    const trimmedText = txt.trim();
    const validation = validateInput(trimmedText);
    if (!validation.isValid) {
      logSecurityEvent({ action: 'input_validation_failed', severity: 'medium', details: { reason: validation.reason, inputLength: trimmedText.length } });
      console.warn('Invalid input:', validation.reason || "Please check your message and try again.");
      return;
    }
    if (trimmedText.length > MAX_CHARS) {
      console.warn(`Message too long: ${trimmedText.length} characters (max: ${MAX_CHARS})`);
      return;
    }
    // Enhanced haptic feedback for send action
    triggerHaptic('button');
    try {
      await onSend(trimmedText);
      setTxt("");
      setCharCount(0);
      setIsFocused(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      // Success haptic feedback
      triggerHaptic('success');
    } catch (error) {
      // Error haptic feedback
      triggerHaptic('error');
      console.error('Failed to send message:', error);
    }
  }, [busy, txt, onSend, isMobile, triggerHaptic]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    if (!isMobile) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k" && !isFocused) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    }
  }, [handleSend, isComposing, isMobile, isFocused]);

  const handleCompositionStart = useCallback(() => setIsComposing(true), []);
  const handleCompositionEnd = useCallback(() => setIsComposing(false), []);

  const colorSystem = useMemo(() => ({
    shell: { bg: "rgba(255, 255, 255, 0.95)", border: isFocused ? "#4F9CF9" : "rgba(226, 232, 240, 0.8)", shadow: isFocused ? "0 0 0 1px #4F9CF9, 0 8px 32px rgba(79, 156, 249, 0.15), 0 4px 16px rgba(79, 156, 249, 0.08)" : "0 2px 12px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.02)" },
    page: { bg: "#FAFBFC", borderTop: "transparent" },
    button: { bg: txt.trim() ? "linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)" : "#F1F5F9", color: txt.trim() ? "white" : "#94A3B8", border: "none", hover: { bg: txt.trim() ? "linear-gradient(135deg, #3B82F6 0%, #5B21B6 100%)" : "#E2E8F0", border: "transparent", transform: "translateY(-1px)", shadow: txt.trim() ? "0 8px 20px rgba(79, 156, 249, 0.35)" : "0 4px 12px rgba(0, 0, 0, 0.08)" }, disabled: { bg: "#F1F5F9", color: "#CBD5E1", border: "transparent" } },
    text: {
      primary: "#1E293B",
      placeholder: "#94A3B8",
      hint: "#64748B",
      hover: "#64748B",
      charCount: charCount > MAX_CHARS ? "red.500" : charCount > MAX_CHARS * 0.8 ? "yellow.500" : "gray.500"
    }
  }), [isFocused, txt, charCount]);

  return (
    <Box
      ref={containerRef}
      data-chat-input
      w="full"
      bg="transparent"
      borderTopWidth="0"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex="var(--z-chat-input)"
      flexShrink={0}
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        willChange: isFocused ? 'transform' : 'auto',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        padding: 'calc(env(safe-area-inset-bottom, 0px) + 8px) calc(env(safe-area-inset-left, 0px) + 8px) calc(env(safe-area-inset-bottom, 0px) + 8px) calc(env(safe-area-inset-right, 0px) + 8px)',
        '@media (max-width: 768px)': {
          padding: 'calc(env(safe-area-inset-bottom, 0px) + 12px) calc(env(safe-area-inset-left, 0px) + 8px) calc(env(safe-area-inset-bottom, 0px) + 12px) calc(env(safe-area-inset-right, 0px) + 8px)',
          maxHeight: 'var(--chat-input-height-mobile)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(79, 156, 249, 0.08)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          WebkitBackdropFilter: 'blur(20px)',
          isolation: 'isolate'
        },
        '@media (min-width: 769px)': {
          maxHeight: 'var(--chat-input-height-desktop)',
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
          background: 'transparent'
        }
      }}
    >
      <Box w="100%" maxW={{ base: "100%", md: "850px", lg: "950px", xl: "1050px" }} px={{ base: 3, md: 6, lg: 8, xl: 10 }} position="relative" overflow="visible">
        <ScaleFade in={true} initialScale={0.95}>
          <Flex direction="column" w="full">
            <InputGroup bg="transparent" border="none" borderRadius={inputConfig.borderRadius} px={{ base: 2, md: 0 }} py={{ base: 0, md: 1 }} alignItems="center" transition={animationConfig.transition} position="relative" overflow="visible" role="group" aria-label="Message input area" aria-expanded={isFocused} aria-busy={busy}>
              <Textarea
                ref={textareaRef}
                flex={1}
                variant="unstyled"
                className="chat-input-modern"
                placeholder={placeholderSuggestions[currentPlaceholderIndex]}
                value={txt}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (import.meta.env.DEV) {
                    console.log('📝 Input onChange:', { newValue, type: typeof newValue });
                  }
                  setTxt(newValue);
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
                aria-label="Type your message here"
                aria-describedby="input-hints"
                aria-invalid={charCount > MAX_CHARS}
                aria-multiline="true"
                aria-expanded={isFocused}
                autoComplete="off"
                autoCorrect="on"
                spellCheck="true"
                border="none"
                borderRadius={inputConfig.borderRadius}
                bg="var(--color-surface-glass-strong)"
                backdropFilter="blur(20px)"
                lineHeight={inputConfig.lineHeight}
                boxShadow={isFocused ? "0 0 0 2px var(--color-brand-primary), var(--shadow-brand-hover)" : "var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.6)"}
                transition={animationConfig.transition}
                _placeholder={{
                  color: "var(--color-text-muted)",
                  transition: animationConfig.transition,
                  fontSize: inputConfig.fontSize,
                  fontWeight: "400",
                  fontFamily: "var(--font-text)",
                  letterSpacing: "var(--letter-spacing-normal)",
                  opacity: isFocused ? 0.6 : 0.8,
                  transform: isFocused ? animationConfig.hoverTransform : 'none'
                }}
                _focus={{
                  outline: "none",
                  border: "none"
                }}
                _hover={{
                  transform: animationConfig.hoverTransform,
                  boxShadow: "var(--shadow-card-hover), inset 0 1px 0 rgba(255, 255, 255, 0.7)"
                }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                  bg: "#F8FAFC"
                }}
                sx={{
                  // Enhanced mobile touch interactions
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitBackdropFilter: 'blur(40px)',
                  // Prevent zoom on iOS
                  fontSize: isMobile ? '16px' : inputConfig.fontSize,
                  // Enhanced text rendering
                  fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11', 'ss01', 'ss02'",
                  // Smooth scrolling for long text
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  '@media (max-width: 768px)': { fontSize: '16px !important' },
                  willChange: 'height',
                  backfaceVisibility: 'hidden',
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': { display: 'none' }
                }}
                color={colorSystem.text.primary}
                pr={{ base: "3.5rem", sm: "4rem", md: "4.5rem", lg: "5rem" }}
                pl={{ base: "0.75rem", md: "1rem" }}
                py={{ base: "0.75rem", md: "1rem" }}
                fontSize={inputConfig.fontSize}
                fontWeight="450"
                fontFamily="'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"
                letterSpacing="-0.011em"
              />
              <InputRightElement
                width={{ base: "3.5rem", sm: "4rem", md: "4.5rem", lg: "5rem" }}
                top="50%"
                transform="translateY(-50%)"
                pr={{ base: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1rem" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="100%"
                position="absolute"
                right={0}
                zIndex={2}
              >
                <SendButton
                  isActive={txt.trim().length > 0}
                  isLoading={busy}
                  onClick={handleSend}
                  isDisabled={busy || !txt.trim()}
                />
              </InputRightElement>
            </InputGroup>

          </Flex>
        </ScaleFade>
      </Box>
    </Box>
  );
}