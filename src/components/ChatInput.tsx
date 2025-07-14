import {
  Box,
  IconButton,
  InputGroup,
  InputRightElement,
  ScaleFade,
  Textarea
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiArrowUpBold } from "react-icons/pi";
import { useReducedMotion } from "../hooks/useAccessibility";
import { useMobileOptimization } from "../hooks/useMobileOptimization";
import { useChatStore } from "../store/useChatStore";
import { debounce } from "../utils/performanceOptimizer";
import { logSecurityEvent, validateInput } from "../utils/securityUtils";

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
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useMobileOptimization();

  const inputConfig = useMemo(() => ({
    minHeight: { base: "44px", sm: "46px", md: "48px", lg: "50px", xl: "52px" },
    maxHeight: { base: "100px", sm: "106px", md: "112px", lg: "118px", xl: "124px" },
    fontSize: { base: "max(16px, 0.875rem)", sm: "max(16px, 0.9375rem)", md: "0.9375rem", lg: "1rem", xl: "1.0625rem" },
    lineHeight: "1.4",
    padding: { base: "clamp(0.75rem, 3vw, 1rem)", sm: "clamp(0.875rem, 2.5vw, 1.125rem)", md: "clamp(1rem, 2vw, 1.25rem)", lg: "clamp(1.125rem, 1.5vw, 1.375rem)", xl: "clamp(1.25rem, 1vw, 1.5rem)" },
    borderRadius: "clamp(22px, 6vw, 28px)",
    sendButton: { base: "40px", sm: "42px", md: "44px", lg: "46px", xl: "48px" }
  }), []);

  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
    scale: prefersReducedMotion ? 'none' : 'scale(1.02)',
    focusTransform: prefersReducedMotion ? 'none' : 'translateY(-1px) scale(1.01)',
    shadowTransition: prefersReducedMotion ? 'none' : 'box-shadow 0.2s ease'
  }), [prefersReducedMotion]);

  const placeholderSuggestions = useMemo(() => [
    "Explain AI ensemble voting", "Create a React app guide", "Why is Hackensack elite?", "Design a leg workout",
    "Remote work analysis", "Solutions for world hunger", "Budget weekend trip ideas", "Tell me about Hackensack",
    "2024 app ideas", "Write persuasive email"
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
    if (isMobile) {
      document.body.classList.add('keyboard-visible');
      const handleKeyboardPosition = () => {
        if (!textareaRef.current || !containerRef.current) return;
        if (window.visualViewport) {
          const viewport = window.visualViewport;
          const keyboardHeight = window.innerHeight - viewport.height;
          if (keyboardHeight > 150) {
            // Keep the input fixed at bottom, don't move it up
            containerRef.current.style.bottom = `${keyboardHeight}px`;
            containerRef.current.style.transition = 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          }
        }
        // Remove scrollIntoView to prevent jumping to top
      };
      handleKeyboardPosition();
      if (window.visualViewport) window.visualViewport.addEventListener('resize', handleKeyboardPosition);
      (textareaRef.current as any)._keyboardCleanup = () => window.visualViewport?.removeEventListener('resize', handleKeyboardPosition);
      setTimeout(handleKeyboardPosition, 300);
    }
  }, [handleAutoResize, isMobile]);

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
      setTimeout(() => { if (containerRef.current) containerRef.current.style.transition = ''; }, 300);
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
    if (isMobile && 'vibrate' in navigator) navigator.vibrate(50);
    try {
      await onSend(trimmedText);
      setTxt("");
      setCharCount(0);
      setIsFocused(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      if (isMobile && 'vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    } catch (error) {
      if (isMobile && 'vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      console.error('Failed to send message:', error);
    }
  }, [busy, txt, onSend, isMobile]);

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
    text: { primary: "#1E293B", placeholder: "#94A3B8", hint: "#64748B", hover: "#64748B" }
  }), [isFocused, txt]);

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
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 8px)',
        paddingRight: 'calc(env(safe-area-inset-right, 0px) + 8px)',
        '@media (max-width: 768px)': {
          paddingX: 2,
          paddingY: 1,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 8px)',
          paddingRight: 'calc(env(safe-area-inset-right, 0px) + 8px)',
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
          paddingY: 0,
          paddingX: 2,
          background: 'transparent'
        }
      }}
    >
      <Box w="100%" maxW={{ base: "100%", md: "850px", lg: "950px", xl: "1050px" }} px={{ base: "clamp(0.5rem, 1.5vw, 0.75rem)", sm: "clamp(0.75rem, 2vw, 1rem)", md: "clamp(1rem, 3vw, 1.5rem)", lg: "clamp(1.5rem, 4vw, 2rem)", xl: "clamp(2rem, 5vw, 2.5rem)" }} position="relative" overflow="visible">
        <ScaleFade in={true} initialScale={0.95}>
          <InputGroup w="full" bg="transparent" border="none" borderRadius={inputConfig.borderRadius} px={{ base: 2, sm: 2, md: 0 }} py={{ base: 0, sm: 0, md: 1, lg: 1, xl: 1 }} alignItems="center" transition={animationConfig.transition} position="relative" overflow="visible" role="group" aria-label="Message input area" aria-expanded={isFocused} aria-busy={busy}>
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
              bg="rgba(255, 255, 255, 0.95)"
              backdropFilter="blur(40px)"
              lineHeight={inputConfig.lineHeight}
              boxShadow={isFocused ? "0 0 0 2px #4F9CF9, 0 8px 32px rgba(79, 156, 249, 0.15), 0 4px 16px rgba(79, 156, 249, 0.08)" : "0 8px 32px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)"}
              _placeholder={{
                color: colorSystem.text.placeholder,
                transition: animationConfig.transition,
                fontSize: inputConfig.fontSize,
                fontWeight: "400",
                fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
                letterSpacing: "-0.008em",
                opacity: isFocused ? 0.5 : 0.7,
                transform: isFocused ? 'translateY(-1px)' : 'none'
              }}
              _focus={{
                outline: "none",
                border: "none"
              }}
              _hover={{
                transform: prefersReducedMotion ? 'none' : 'translateY(-1px)'
              }}
              _disabled={{
                opacity: 0.6,
                cursor: "not-allowed",
                bg: "#F8FAFC"
              }}
              sx={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                WebkitBackdropFilter: 'blur(40px)',
                fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11', 'ss01', 'ss02'",
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
            <InputRightElement width={{ base: "3.5rem", sm: "4rem", md: "4.5rem", lg: "5rem" }} top="50%" transform="translateY(-50%)" pr={{ base: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1rem" }} display="flex" alignItems="center" justifyContent="center" h="100%" position="absolute" right={0} zIndex={2}>
              <IconButton aria-label={txt.trim() ? "Send message" : "Enter a message to send"} aria-disabled={busy || !txt.trim()} icon={<Box position="relative"><PiArrowUpBold size={txt.trim() ? (isMobile ? 18 : 20) : (isMobile ? 16 : 18)} style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: txt.trim() ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(-10deg)', filter: txt.trim() ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))' : 'none' }} />{txt.trim() && <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="24px" h="24px" borderRadius="full" border="2px solid rgba(255, 255, 255, 0.3)" animation="neuralPulse 2s ease-in-out infinite" sx={{ '@keyframes neuralPulse': { '0%, 100%': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0.3 }, '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.1 } } }} />}</Box>} onClick={handleSend} isLoading={busy} size="sm" w={inputConfig.sendButton} h={inputConfig.sendButton} minW={inputConfig.sendButton} minH={inputConfig.sendButton} maxW={inputConfig.sendButton} maxH={inputConfig.sendButton} bg={txt.trim() ? "rgba(255, 255, 255, 0.98)" : "rgba(248, 250, 252, 0.85)"} color={txt.trim() ? "#4F9CF9" : "rgba(148, 163, 184, 0.6)"} border={txt.trim() ? "1px solid rgba(79, 156, 249, 0.3)" : "1px solid rgba(148, 163, 184, 0.25)"} borderRadius="full" transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" cursor={txt.trim() ? "pointer" : "not-allowed"} flexShrink={0} flexGrow={0} position="relative" overflow="hidden" backdropFilter="blur(20px)" boxShadow={txt.trim() ? "0 4px 16px rgba(79, 156, 249, 0.25), 0 2px 8px rgba(79, 156, 249, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)" : "0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)"} _before={txt.trim() ? { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'conic-gradient(from 0deg, transparent, rgba(79, 156, 249, 0.1), transparent)', borderRadius: 'full', animation: 'rotate 3s linear infinite', opacity: 0.8 } : {}} _hover={{ bg: txt.trim() ? "rgba(255, 255, 255, 1)" : "rgba(248, 250, 252, 0.9)", borderColor: txt.trim() ? "rgba(79, 156, 249, 0.4)" : "rgba(148, 163, 184, 0.35)", color: txt.trim() ? "#3B82F6" : "rgba(148, 163, 184, 0.8)", transform: txt.trim() ? "scale(1.05) translateY(-2px)" : "none", boxShadow: txt.trim() ? "0 8px 24px rgba(79, 156, 249, 0.3), 0 4px 12px rgba(79, 156, 249, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)" : "0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)" }} _focus={{ boxShadow: txt.trim() ? "0 0 0 3px rgba(79, 156, 249, 0.3)" : "0 0 0 2px rgba(148, 163, 184, 0.3)", outline: "none" }} _active={{ transform: "scale(0.95)", bg: txt.trim() ? "rgba(79, 156, 249, 0.1)" : "rgba(148, 163, 184, 0.1)", boxShadow: txt.trim() ? "0 1px 4px rgba(79, 156, 249, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.1)" }} _disabled={{ bg: colorSystem.button.disabled.bg, color: colorSystem.button.disabled.color, borderColor: colorSystem.button.disabled.border, cursor: "not-allowed", opacity: 0.5, transform: "none", boxShadow: "none" }} isDisabled={busy || !txt.trim()} sx={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', '@media (max-width: 768px)': { minWidth: inputConfig.sendButton.base, minHeight: inputConfig.sendButton.base }, '@keyframes rotate': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }, '@keyframes sendPulse': { '0%': { boxShadow: '0 0 0 0 rgba(79, 156, 249, 0.7)', transform: 'scale(1)' }, '70%': { boxShadow: '0 0 0 10px rgba(79, 156, 249, 0)', transform: 'scale(1.05)' }, '100%': { boxShadow: '0 0 0 0 rgba(79, 156, 249, 0)', transform: 'scale(1)' } }, willChange: 'transform, box-shadow', backfaceVisibility: 'hidden', '&:active': { animation: txt.trim() ? 'sendPulse 0.6s ease-out' : 'none' } }} />
            </InputRightElement>
          </InputGroup>
        </ScaleFade>
      </Box>
    </Box>
  );
}