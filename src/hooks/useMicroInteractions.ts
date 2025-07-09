/**
 * Modern Micro-Interactions Hook
 * 
 * Provides advanced micro-interactions and animations for enhanced user experience
 * including hover effects, click feedback, focus states, and accessibility support.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useOptimizedDevice } from './core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface MicroInteractionConfig {
  /** Enable hover effects */
  enableHover?: boolean;
  
  /** Enable click feedback */
  enableClick?: boolean;
  
  /** Enable focus effects */
  enableFocus?: boolean;
  
  /** Enable haptic feedback */
  enableHaptics?: boolean;
  
  /** Animation duration in ms */
  duration?: number;
  
  /** Animation easing */
  easing?: string;
  
  /** Scale factor for interactions */
  scaleFactor?: number;
  
  /** Glow intensity */
  glowIntensity?: number;
}

export interface InteractionHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onClick: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useMicroInteractions = (config: MicroInteractionConfig = {}) => {
  const {
    enableHover = true,
    enableClick = true,
    enableFocus = true,
    enableHaptics = true,
    duration = 200,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    scaleFactor = 0.98,
    glowIntensity = 0.2,
  } = config;

  const { capabilities, config: deviceConfig, triggerHaptic } = useOptimizedDevice();
  const elementRef = useRef<HTMLElement>(null);
  const isInteracting = useRef(false);
  const animationFrame = useRef<number | undefined>(undefined);

  // Disable animations if user prefers reduced motion
  const shouldAnimate = !deviceConfig.shouldReduceAnimations;

  // Apply smooth transition styles
  const applyTransition = useCallback((element: HTMLElement) => {
    if (!shouldAnimate) return;
    
    element.style.transition = `all ${duration}ms ${easing}`;
    element.style.willChange = 'transform, box-shadow, opacity';
  }, [duration, easing, shouldAnimate]);

  // Remove transition styles
  const removeTransition = useCallback((element: HTMLElement) => {
    element.style.transition = '';
    element.style.willChange = 'auto';
  }, []);

  // Hover enter effect
  const handleHoverEnter = useCallback(() => {
    if (!enableHover || !shouldAnimate || !elementRef.current) return;
    
    const element = elementRef.current;
    applyTransition(element);
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = `0 8px 25px rgba(79, 156, 249, ${glowIntensity}), 0 4px 12px rgba(0, 0, 0, 0.1)`;
    });
  }, [enableHover, shouldAnimate, applyTransition, glowIntensity]);

  // Hover leave effect
  const handleHoverLeave = useCallback(() => {
    if (!enableHover || !shouldAnimate || !elementRef.current) return;
    
    const element = elementRef.current;
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      element.style.transform = '';
      element.style.boxShadow = '';
    });
    
    // Clean up after animation
    setTimeout(() => {
      if (element && !isInteracting.current) {
        removeTransition(element);
      }
    }, duration);
  }, [enableHover, shouldAnimate, removeTransition, duration]);

  // Mouse down effect
  const handleMouseDown = useCallback(() => {
    if (!enableClick || !shouldAnimate || !elementRef.current) return;
    
    const element = elementRef.current;
    isInteracting.current = true;
    applyTransition(element);
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      element.style.transform = `scale(${scaleFactor})`;
    });

    // Haptic feedback
    if (enableHaptics && capabilities.isMobile) {
      triggerHaptic('LIGHT');
    }
  }, [enableClick, shouldAnimate, applyTransition, scaleFactor, enableHaptics, capabilities.isMobile, triggerHaptic]);

  // Mouse up effect
  const handleMouseUp = useCallback(() => {
    if (!enableClick || !shouldAnimate || !elementRef.current) return;
    
    const element = elementRef.current;
    isInteracting.current = false;
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      element.style.transform = '';
    });
    
    // Clean up after animation
    setTimeout(() => {
      if (element) {
        removeTransition(element);
      }
    }, duration);
  }, [enableClick, shouldAnimate, removeTransition, duration]);

  // Focus effect
  const handleFocus = useCallback(() => {
    if (!enableFocus || !shouldAnimate || !elementRef.current) return;
    
    const element = elementRef.current;
    applyTransition(element);
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      element.style.outline = 'none';
      element.style.boxShadow = `0 0 0 3px rgba(79, 156, 249, 0.3), 0 4px 12px rgba(79, 156, 249, ${glowIntensity})`;
    });
  }, [enableFocus, shouldAnimate, applyTransition, glowIntensity]);

  // Blur effect
  const handleBlur = useCallback(() => {
    if (!enableFocus || !shouldAnimate || !elementRef.current) return;
    
    const element = elementRef.current;
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      element.style.boxShadow = '';
    });
    
    // Clean up after animation
    setTimeout(() => {
      if (element) {
        removeTransition(element);
      }
    }, duration);
  }, [enableFocus, shouldAnimate, removeTransition, duration]);

  // Click effect (for additional feedback)
  const handleClick = useCallback(() => {
    if (!enableClick || !capabilities.isMobile) return;
    
    // Additional haptic feedback for important actions
    if (enableHaptics) {
      triggerHaptic('SUCCESS');
    }
  }, [enableClick, capabilities.isMobile, enableHaptics, triggerHaptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // Return handlers and ref
  const handlers: InteractionHandlers = {
    onMouseEnter: handleHoverEnter,
    onMouseLeave: handleHoverLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onClick: handleClick,
  };

  return {
    ref: elementRef,
    handlers,
    isAnimationEnabled: shouldAnimate,
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a ripple effect at the click position
 */
export const createRippleEffect = (
  element: HTMLElement,
  event: React.MouseEvent,
  color: string = 'rgba(79, 156, 249, 0.3)'
) => {
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${color};
    transform: scale(0);
    animation: ripple 0.6s linear;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
  `;

  // Add ripple animation keyframes if not already added
  if (!document.querySelector('#ripple-keyframes')) {
    const style = document.createElement('style');
    style.id = 'ripple-keyframes';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  // Remove ripple after animation
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
};

export default useMicroInteractions;
