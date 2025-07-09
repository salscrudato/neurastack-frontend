/**
 * Enhanced Mobile Chat Input Hook
 *
 * Provides comprehensive mobile optimization for chat input including
 * keyboard handling, auto-resize, viewport adjustments, and performance optimizations.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { mobileKeyboardManager, mobileTouchManager, useMobileOptimization } from '../utils/mobileOptimizations';

interface MobileChatInputConfig {
  maxHeight?: number;
  minHeight?: number;
  autoFocus?: boolean;
  enableHapticFeedback?: boolean;
  keyboardAdjustment?: boolean;
}

export const useMobileChatInput = (config: MobileChatInputConfig = {}) => {
  const {
    maxHeight = 120,
    minHeight = 44,
    autoFocus = false,
    enableHapticFeedback = true,
    keyboardAdjustment = true
  } = config;

  const { isMobile } = useMobileOptimization();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(minHeight);
  const [isComposing, setIsComposing] = useState(false);
  const [keyboardVisible] = useState(false);

  // Input optimizations for mobile
  const inputOptimizations = {
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
  };

  // Enhanced auto-resize functionality
  const handleAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scroll height
    textarea.style.height = 'auto';

    // Calculate new height with constraints
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    // Apply new height with smooth transition
    textarea.style.height = `${newHeight}px`;
    setCurrentHeight(newHeight);

    // Trigger haptic feedback on height change (mobile only)
    if (isMobile && enableHapticFeedback && newHeight !== currentHeight) {
      mobileTouchManager.triggerHaptic('light');
    }
  }, [minHeight, maxHeight, isMobile, enableHapticFeedback, currentHeight]);

  // Enhanced focus handling with keyboard adjustments
  const handleFocus = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);

    if (isMobile && keyboardAdjustment) {
      // Handle keyboard appearance with smooth scrolling
      mobileKeyboardManager.handleInputFocus(event.target);

      // Add keyboard-focused class for styling
      document.body.classList.add('input-focused');

      // Trigger haptic feedback
      if (enableHapticFeedback) {
        mobileTouchManager.triggerHaptic('light');
      }
    }
  }, [isMobile, keyboardAdjustment, enableHapticFeedback]);

  // Enhanced blur handling
  const handleBlur = useCallback(() => {
    setIsFocused(false);

    if (isMobile) {
      // Remove keyboard-focused class
      document.body.classList.remove('input-focused');

      // Small delay to allow for smooth keyboard hiding
      setTimeout(() => {
        if (textareaRef.current && !textareaRef.current.matches(':focus')) {
          // Reset height if empty
          if (!textareaRef.current.value.trim()) {
            textareaRef.current.style.height = `${minHeight}px`;
            setCurrentHeight(minHeight);
          }
        }
      }, 100);
    }
  }, [isMobile, minHeight]);

  // Enhanced composition handling for international input
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
    // Trigger auto-resize after composition
    setTimeout(handleAutoResize, 0);
  }, [handleAutoResize]);

  // Enhanced key handling with mobile optimizations
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't process during composition
    if (isComposing) return;

    // Handle Enter key behavior
    if (event.key === 'Enter') {
      if (isMobile) {
        // On mobile, Enter should create new line unless Shift is held
        if (!event.shiftKey) {
          // Let parent handle send logic
          return;
        }
      } else {
        // On desktop, Enter sends unless Shift is held
        if (!event.shiftKey) {
          event.preventDefault();
          // Let parent handle send logic
          return;
        }
      }
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      textareaRef.current?.blur();
      if (enableHapticFeedback && isMobile) {
        mobileTouchManager.triggerHaptic('light');
      }
    }

    // Trigger auto-resize on input
    setTimeout(handleAutoResize, 0);
  }, [isComposing, isMobile, enableHapticFeedback, handleAutoResize]);

  // Enhanced input change handler
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Trigger auto-resize
    handleAutoResize();

    // Trigger haptic feedback for typing (light, infrequent)
    if (isMobile && enableHapticFeedback && event.target.value.length % 10 === 0) {
      mobileTouchManager.triggerHaptic('light');
    }
  }, [handleAutoResize, isMobile, enableHapticFeedback]);

  // Initialize keyboard detection
  useEffect(() => {
    if (!isMobile || !keyboardAdjustment) return;

    const cleanup = mobileKeyboardManager.detectKeyboard((visible) => {
      // Update CSS custom property for keyboard state
      document.documentElement.style.setProperty('--keyboard-visible', visible ? '1' : '0');

      // Adjust input position when keyboard appears/disappears
      if (textareaRef.current && isFocused) {
        if (visible) {
          // Keyboard appeared - scroll input into view
          setTimeout(() => {
            textareaRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 100);
        }
      }
    });

    return cleanup;
  }, [isMobile, keyboardAdjustment, isFocused]);

  // Auto-focus on mount if enabled
  useEffect(() => {
    if (autoFocus && textareaRef.current && !isMobile) {
      // Only auto-focus on desktop to avoid unwanted keyboard on mobile
      textareaRef.current.focus();
    }
  }, [autoFocus, isMobile]);

  // Enhanced mobile input configuration
  const mobileInputProps = {
    ...inputOptimizations,
    ref: textareaRef,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onChange: handleInputChange,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    style: {
      height: `${currentHeight}px`,
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
      resize: 'none' as const,
      overflow: 'hidden',
      transition: 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      // Enhanced mobile styling
      ...(isMobile && {
        fontSize: '16px', // Prevent zoom on iOS
        lineHeight: '1.4',
        padding: '12px 16px',
        borderRadius: '12px',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      })
    }
  };

  return {
    // Refs and state
    textareaRef,
    isFocused,
    currentHeight,
    isComposing,

    // Handlers
    handleAutoResize,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleInputChange,
    handleCompositionStart,
    handleCompositionEnd,

    // Props for textarea
    mobileInputProps,

    // Mobile state
    isMobile,
    keyboardVisible,

    // Utilities
    resetHeight: () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = `${minHeight}px`;
        setCurrentHeight(minHeight);
      }
    },

    focusInput: () => {
      textareaRef.current?.focus();
    },

    blurInput: () => {
      textareaRef.current?.blur();
    }
  };
};
