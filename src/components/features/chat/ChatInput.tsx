/**
 * Simplified Chat Input Component
 * 
 * Streamlined chat input with mobile optimization, auto-resize,
 * and performance enhancements. Consolidates multiple input implementations.
 */

import {
    Box,
    Flex,
    IconButton,
    Text,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PiArrowUpBold, PiStopBold } from 'react-icons/pi';
import { APP_CONFIG } from '../../../config/app';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';
import { useChatLoading, useChatSendMessage } from '../../../stores/useChatStore';

// ============================================================================
// Motion Components
// ============================================================================

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

// ============================================================================
// Types
// ============================================================================

interface ChatInputProps {
  /** Placeholder text */
  placeholder?: string;
  
  /** Maximum character limit */
  maxChars?: number;
  
  /** Disable input */
  disabled?: boolean;
  
  /** Custom submit handler */
  onSubmit?: (text: string) => void;
  
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = "Type your message here...",
  maxChars = APP_CONFIG.PERFORMANCE.MAX_MESSAGE_LENGTH,
  disabled = false,
  onSubmit,
  autoFocus = false,
}) => {
  // Hooks
  const { capabilities, config, triggerHaptic } = useOptimizedDevice();
  const sendMessage = useChatSendMessage();
  const isLoading = useChatLoading();
  const toast = useToast();
  
  // State
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Derived state
  const charCount = text.length;
  const isOverLimit = charCount > maxChars;
  const canSubmit = text.trim().length > 0 && !isOverLimit && !isLoading && !disabled;
  const isDisabled = isLoading || disabled;

  // Mobile keyboard detection
  useEffect(() => {
    if (!capabilities.isMobile) return;

    let initialViewportHeight = window.innerHeight;

    const handleViewportChange = () => {
      const currentVisualViewportHeight = window.visualViewport?.height || window.innerHeight;

      // Detect keyboard by comparing viewport heights
      const heightDifference = initialViewportHeight - currentVisualViewportHeight;
      const isKeyboardOpen = heightDifference > 150; // 150px threshold

      setKeyboardVisible(isKeyboardOpen);
      setKeyboardHeight(isKeyboardOpen ? heightDifference : 0);

      // Update CSS custom property for keyboard state
      document.documentElement.style.setProperty('--keyboard-height', `${isKeyboardOpen ? heightDifference : 0}px`);
      document.documentElement.style.setProperty('--keyboard-visible', isKeyboardOpen ? '1' : '0');

      // Toggle body class for keyboard state
      document.body.classList.toggle('keyboard-visible', isKeyboardOpen);
    };

    // Listen to visual viewport changes (better for keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }

      // Clean up CSS properties
      document.documentElement.style.removeProperty('--keyboard-height');
      document.documentElement.style.removeProperty('--keyboard-visible');
      document.body.classList.remove('keyboard-visible');
    };
  }, [capabilities.isMobile]);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = parseInt(APP_CONFIG.CHAT.INPUT.MAX_HEIGHT);

    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, []);

  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    adjustHeight();
  }, [adjustHeight]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    const trimmedText = text.trim();
    if (!trimmedText) return;

    try {
      // Haptic feedback
      if (config.shouldEnableHaptics) {
        triggerHaptic('SUCCESS');
      }

      // Use custom handler or default store action
      if (onSubmit) {
        onSubmit(trimmedText);
      } else {
        await sendMessage(trimmedText);
      }

      // Clear input
      setText('');
      setIsFocused(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

    } catch (error) {
      // Error haptic feedback
      if (config.shouldEnableHaptics) {
        triggerHaptic('ERROR');
      }

      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [canSubmit, text, config.shouldEnableHaptics, triggerHaptic, onSubmit, sendMessage, toast]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;

    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      }
      
      e.preventDefault();
      handleSubmit();
    }
  }, [isComposing, handleSubmit]);

  // Focus management
  const handleFocus = useCallback(() => {
    setIsFocused(true);

    if (capabilities.isMobile) {
      // Add input-focused class for mobile styling
      document.body.classList.add('input-focused');

      // Scroll input into view after a short delay to allow keyboard to appear
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300);
    }

    if (config.shouldEnableHaptics) {
      triggerHaptic('LIGHT');
    }
  }, [capabilities.isMobile, config.shouldEnableHaptics, triggerHaptic]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    if (capabilities.isMobile) {
      // Remove input-focused class
      document.body.classList.remove('input-focused');
    }
  }, [capabilities.isMobile]);

  // Composition events for IME support
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Adjust height on text change with performance optimization
  useEffect(() => {
    // Use requestAnimationFrame for better performance
    const rafId = requestAnimationFrame(() => {
      adjustHeight();
    });

    return () => cancelAnimationFrame(rafId);
  }, [text, adjustHeight]);

  // Responsive configuration
  const inputConfig = {
    minHeight: capabilities.isMobile ? '52px' : '48px',
    maxHeight: APP_CONFIG.CHAT.INPUT.MAX_HEIGHT,
    borderRadius: capabilities.isMobile ? '1.5rem' : '1.25rem',
    fontSize: capabilities.isMobile ? 'md' : 'sm',
    padding: capabilities.isMobile ? '1rem 1.25rem' : '0.875rem 1rem',
  };



  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="#f9f9f9"
      borderTop="1px solid #e5e7eb"
      p={4}
      zIndex={APP_CONFIG.UI.Z_INDEX.STICKY}
      sx={{
        // Enhanced safe area support for mobile
        paddingBottom: capabilities.isMobile
          ? `max(1rem, env(safe-area-inset-bottom))`
          : '1rem',
        paddingLeft: `max(1rem, env(safe-area-inset-left))`,
        paddingRight: `max(1rem, env(safe-area-inset-right))`,
        // Mobile keyboard handling
        ...(capabilities.isMobile && {
          transform: keyboardVisible
            ? `translateY(-${keyboardHeight}px)`
            : 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }),
        // Performance optimizations
        contain: 'layout style paint',
        willChange: capabilities.isMobile ? 'transform' : 'auto',
      }}
    >
      <Flex
        align="flex-end"
        gap={3}
        maxW={APP_CONFIG.CHAT.CONTAINER.MAX_WIDTH.XL}
        mx="auto"
      >
        {/* Input Container */}
        <Box flex="1" position="relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            isDisabled={isDisabled}
            resize="none"
            rows={1}
            minH={inputConfig.minHeight}
            maxH={inputConfig.maxHeight}
            fontSize={inputConfig.fontSize}
            borderRadius="24px"
            bg="#ffffff"
            border="1px solid #d1d5db"
            boxShadow="none"
            transition="all 0.15s ease"
            _placeholder={{
              color: APP_CONFIG.THEME.COLORS.TEXT_MUTED,
              fontWeight: '400',
            }}
            _focus={{
              outline: 'none',
              borderColor: '#9ca3af',
            }}
            _hover={{
              borderColor: '#9ca3af',
            }}
            // Mobile optimizations
            sx={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              // Clean text styling
              fontWeight: '400',
              letterSpacing: 'normal',
              lineHeight: '1.5',
              // Performance optimizations
              contain: 'layout style',
              willChange: config.shouldReduceAnimations ? 'auto' : 'height',
            }}
            // Accessibility
            aria-label="Type your message"
            aria-describedby="char-count"
            aria-invalid={isOverLimit}
          />

          {/* Character Count */}
          {(isFocused || charCount > maxChars * 0.8) && (
            <Text
              id="char-count"
              position="absolute"
              bottom={2}
              right={3}
              fontSize="xs"
              color={isOverLimit ? APP_CONFIG.THEME.COLORS.ERROR : APP_CONFIG.THEME.COLORS.TEXT_MUTED}
              pointerEvents="none"
              opacity={0.8}
            >
              {charCount}/{maxChars}
            </Text>
          )}
        </Box>

        {/* Enhanced Send Button with Modern Animations */}
        <MotionBox position="relative">
          <MotionIconButton
            icon={isLoading ? <PiStopBold /> : <PiArrowUpBold />}
            aria-label={isLoading ? "Stop generation" : "Send message"}
            size="lg"
            isDisabled={!canSubmit && !isLoading}
            onClick={handleSubmit}
            bg={canSubmit || isLoading
              ? '#3b82f6'
              : '#e5e7eb'
            }
            color={canSubmit || isLoading ? "white" : "#9ca3af"}
            borderRadius="full"
            minW={capabilities.isMobile ? '44px' : '40px'}
            h={capabilities.isMobile ? '44px' : '40px'}
            boxShadow={canSubmit || isLoading
              ? '0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 6px rgba(0, 0, 0, 0.08)'
              : '0 2px 6px rgba(0, 0, 0, 0.1)'
            }
            _hover={{
              bg: canSubmit || isLoading
                ? '#2563eb'
                : '#d1d5db',
              transform: 'scale(1.05)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            sx={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
            // Framer Motion props
            whileHover={canSubmit || isLoading ? {
              scale: 1.05,
              boxShadow: '0 8px 25px rgba(79, 156, 249, 0.4), 0 4px 12px rgba(79, 156, 249, 0.2)'
            } : {}}
            whileTap={canSubmit || isLoading ? { scale: 0.95 } : {}}
            animate={isLoading ? {
              rotate: [0, 180, 360],
              transition: { duration: 2, repeat: Infinity, ease: 'linear' }
            } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          />

          {/* Pulse effect when ready to send */}
          <AnimatePresence>
            {canSubmit && !isLoading && (
              <MotionBox
                position="absolute"
                top="50%"
                left="50%"
                w="100%"
                h="100%"
                borderRadius="full"
                bg="rgba(79, 156, 249, 0.3)"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </AnimatePresence>
        </MotionBox>
      </Flex>
    </Box>
  );
};

export default ChatInput;
