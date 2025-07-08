import {
  Box,
  IconButton,
  InputGroup,
  InputRightElement,
  Textarea,
  useToast,
  Progress,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiArrowUpBold } from "react-icons/pi";
import useAdvancedMobileOptimization from "../hooks/useAdvancedMobileOptimization";
import { useChatStore } from "../store/useChatStore";
import { createErrorToast } from "../utils/errorHandler";
import { performanceMonitor } from "../utils/performanceMonitor";

const MAX_CHARS = 4000;
const MOBILE_KEYBOARD_THRESHOLD = 300;

/**
 * Enhanced ChatInput with Leading Mobile-First Optimization
 * 
 * Features:
 * - Advanced mobile touch interactions with haptic feedback
 * - Intelligent auto-resize with performance optimization
 * - Smart keyboard handling and viewport adjustments
 * - Progressive enhancement for modern browsers
 * - Accessibility-first design with WCAG compliance
 * - Real-time performance monitoring
 */
export default function EnhancedChatInput() {
  const send = useChatStore((s) => s.sendMessage);
  const isLoading = useChatStore((s) => s.isLoading);
  const toast = useToast();

  // Enhanced mobile optimization
  const {
    isMobile,
    keyboardVisible,
    triggerHaptic,
    inputOptimizations,
    performanceConfig,
    touchTargets,
  } = useAdvancedMobileOptimization();

  // State management
  const [txt, setTxt] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Refs for performance optimization
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const performanceStartRef = useRef<number>(0);

  // Enhanced input configuration with mobile-first approach
  const inputConfig = useMemo(() => ({
    minHeight: {
      base: touchTargets.medium,
      sm: "58px",
      md: "60px",
      lg: "62px",
      xl: "64px"
    },
    maxHeight: {
      base: keyboardVisible ? "100px" : "120px", // Adaptive based on keyboard
      sm: "126px",
      md: "132px",
      lg: "138px",
      xl: "144px"
    },
    fontSize: inputOptimizations.fontSize,
    lineHeight: "1.5",
    padding: {
      base: "clamp(0.875rem, 3.5vw, 1.125rem)",
      sm: "clamp(1rem, 3vw, 1.25rem)",
      md: "clamp(1.125rem, 2.5vw, 1.375rem)",
      lg: "clamp(1.25rem, 2vw, 1.5rem)",
      xl: "clamp(1.375rem, 1.5vw, 1.625rem)"
    },
    borderRadius: "clamp(24px, 6vw, 32px)",
    sendButton: {
      base: touchTargets.medium,
      sm: "50px",
      md: "52px",
      lg: "54px",
      xl: "56px"
    }
  }), [touchTargets, keyboardVisible, inputOptimizations]);

  // Performance-optimized auto-resize with mobile considerations
  const handleAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    performanceStartRef.current = performance.now();

    // Reset height to calculate scrollHeight
    textarea.style.height = 'auto';
    
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = isMobile ? 100 : 120; // Mobile-optimized max height
    const newHeight = Math.min(scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
    
    // Enable scrolling if content exceeds max height
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    
    // Performance monitoring
    const renderTime = performance.now() - performanceStartRef.current;
    if (renderTime > 16) { // 60fps threshold
      console.warn(`⚠️ Slow input resize: ${renderTime.toFixed(2)}ms`);
    }
  }, [isMobile]);

  // Enhanced focus management with mobile optimization
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    performanceMonitor.startRender('ChatInput-Focus');
    
    // Mobile-specific optimizations
    if (isMobile) {
      // Prevent body scroll when input is focused
      document.body.style.overflow = 'hidden';
      
      // Smooth scroll to input with delay for keyboard animation
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }, MOBILE_KEYBOARD_THRESHOLD);
      
      // Haptic feedback for focus
      triggerHaptic('light');
    }
    
    handleAutoResize();
    performanceMonitor.endRender('ChatInput-Focus');
  }, [handleAutoResize, isMobile, triggerHaptic]);

  // Enhanced blur handling
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    // Restore body scroll on mobile
    if (isMobile) {
      document.body.style.overflow = '';
    }
  }, [isMobile]);

  // Optimized text change handler with debouncing
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Character limit enforcement
    if (value.length > MAX_CHARS) {
      triggerHaptic('warning');
      return;
    }
    
    setTxt(value);
    setCharCount(value.length);
    
    // Debounced auto-resize for performance
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(handleAutoResize, 16); // 60fps
  }, [handleAutoResize, triggerHaptic]);

  // Enhanced key handling with mobile considerations
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Composition handling for international keyboards
    if (isComposing) return;
    
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      }
      
      e.preventDefault();
      
      if (txt.trim() && !isLoading) {
        handleSend();
      } else {
        triggerHaptic('light');
      }
    }
    
    // Escape key to blur input
    if (e.key === 'Escape') {
      textareaRef.current?.blur();
    }
  }, [isComposing, txt, isLoading, triggerHaptic]);

  // Enhanced send handler with performance monitoring
  const handleSend = useCallback(async () => {
    const trimmedText = txt.trim();
    if (!trimmedText || isLoading) return;

    performanceMonitor.startRender('ChatInput-Send');
    setShowProgress(true);
    
    try {
      await send(trimmedText);
      
      // Success feedback
      triggerHaptic('success');
      
      // Reset state
      setTxt("");
      setCharCount(0);
      setIsFocused(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      
    } catch (error) {
      triggerHaptic('error');
      
      const errorToast = createErrorToast(error, {
        component: 'EnhancedChatInput',
        action: 'sendMessage'
      });
      
      toast(errorToast);
    } finally {
      setShowProgress(false);
      performanceMonitor.endRender('ChatInput-Send');
    }
  }, [txt, isLoading, send, triggerHaptic, toast]);

  // Composition event handlers for international input
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // Character count color based on usage
  const getCharCountColor = useMemo(() => {
    const percentage = (charCount / MAX_CHARS) * 100;
    if (percentage >= 90) return 'red.500';
    if (percentage >= 75) return 'orange.500';
    if (percentage >= 50) return 'yellow.500';
    return 'gray.500';
  }, [charCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      w="full"
      position="sticky"
      bottom={0}
      zIndex={100}
      bg="transparent"
      sx={{
        ...performanceConfig,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 8px)`,
        '@media (max-width: 768px)': {
          position: 'fixed',
          left: 0,
          right: 0,
          paddingX: 2,
          paddingY: 0,
          maxHeight: keyboardVisible ? '100px' : '120px',
          zIndex: 1000,
        },
      }}
    >
      {/* Progress indicator for sending */}
      {showProgress && (
        <Progress
          size="xs"
          isIndeterminate
          colorScheme="blue"
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={1}
        />
      )}

      {/* Main input container */}
      <Box
        w="100%"
        maxW={{
          base: "100%",
          md: "850px",
          lg: "950px",
          xl: "1050px"
        }}
        mx="auto"
        px={{
          base: "clamp(0.75rem, 2vw, 1rem)",
          sm: "clamp(1rem, 2.5vw, 1.25rem)",
          md: "clamp(1.5rem, 4vw, 2rem)",
          lg: "clamp(2rem, 5vw, 3rem)",
          xl: "clamp(2.5rem, 6vw, 4rem)"
        }}
      >
        <InputGroup size="lg" position="relative">
          <Textarea
            ref={textareaRef}
            value={txt}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Type your message..."
            isDisabled={isLoading}
            rows={1}
            minH={inputConfig.minHeight}
            maxH={inputConfig.maxHeight}
            resize="none"
            lineHeight={inputConfig.lineHeight}
            p={inputConfig.padding}
            pr={{ base: "4rem", sm: "4.5rem", md: "5rem" }}
            borderRadius={inputConfig.borderRadius}
            borderWidth="1.5px"
            borderColor={isFocused ? "#4F9CF9" : "rgba(226, 232, 240, 0.8)"}
            bg="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(8px)"
            transition="all 0.2s ease"
            _hover={{
              borderColor: isFocused ? "#4F9CF9" : "rgba(79, 156, 249, 0.3)",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
            _focus={{
              borderColor: "#4F9CF9",
              boxShadow: "0 0 0 1px #4F9CF9, 0 8px 24px rgba(79, 156, 249, 0.15)",
              transform: "translateY(-2px)",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            {...inputOptimizations}
          />

          <InputRightElement
            width={{ base: "4rem", sm: "4.5rem", md: "5rem" }}
            top="50%"
            transform="translateY(-50%)"
            pr={{ base: "0.5rem", sm: "0.75rem", md: "1rem" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100%"
            position="absolute"
            right={0}
            zIndex={2}
          >
            <Tooltip
              label={txt.trim() ? "Send message" : "Enter a message to send"}
              placement="top"
              hasArrow
            >
              <IconButton
                aria-label={txt.trim() ? "Send message" : "Enter a message to send"}
                icon={<PiArrowUpBold size={isMobile ? 18 : 20} />}
                onClick={handleSend}
                isLoading={isLoading}
                isDisabled={!txt.trim() || isLoading}
                size="sm"
                w={inputConfig.sendButton}
                h={inputConfig.sendButton}
                minW={inputConfig.sendButton}
                minH={inputConfig.sendButton}
                borderRadius="50%"
                bg={txt.trim() ? "#374151" : "gray.300"}
                color="white"
                _hover={{
                  bg: txt.trim() ? "#1f2937" : "gray.400",
                  transform: "translateY(-1px) scale(1.02)",
                }}
                _active={{
                  transform: "translateY(0) scale(0.98)",
                }}
                _disabled={{
                  bg: "gray.300",
                  cursor: 'not-allowed',
                  transform: 'none',
                }}
                transition="all 0.2s ease"
                sx={{
                  ...performanceConfig,
                  touchAction: 'manipulation',
                }}
              />
            </Tooltip>
          </InputRightElement>
        </InputGroup>

        {/* Character count indicator */}
        {charCount > MAX_CHARS * 0.8 && (
          <Text
            fontSize="xs"
            color={getCharCountColor}
            textAlign="right"
            mt={1}
            opacity={0.8}
          >
            {charCount}/{MAX_CHARS}
          </Text>
        )}
      </Box>
    </Box>
  );
}
