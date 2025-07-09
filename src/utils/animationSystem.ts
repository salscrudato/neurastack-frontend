/**
 * Advanced Animation System for NeuraStack Frontend
 * 
 * Provides sophisticated animation utilities with performance optimization,
 * accessibility support, and modern micro-interactions using Framer Motion.
 * 
 * Features:
 * - Hardware-accelerated animations with GPU optimization
 * - Reduced motion support for accessibility
 * - Intelligent performance monitoring and throttling
 * - Modern easing curves and spring physics
 * - Micro-interaction patterns for enhanced UX
 * - Mobile-optimized animation configurations
 */

import { type MotionProps, type Transition, type Variants } from 'framer-motion';

// Animation configuration based on device capabilities and user preferences
export const animationConfig = {
  // Check for reduced motion preference
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check device performance capabilities
  isHighPerformanceDevice: (): boolean => {
    if (typeof window === 'undefined') return true;
    
    // Check for hardware acceleration support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;
    
    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const hasEnoughMemory = deviceMemory >= 2;
    
    // Check connection speed
    const connection = (navigator as any).connection;
    const hasGoodConnection = !connection || connection.effectiveType !== 'slow-2g';
    
    return hasWebGL && hasEnoughMemory && hasGoodConnection;
  },

  // Get optimal animation duration based on device and preferences
  getDuration: (baseDuration: number): number => {
    if (animationConfig.prefersReducedMotion()) return 0;
    if (!animationConfig.isHighPerformanceDevice()) return baseDuration * 0.7;
    return baseDuration;
  },

  // Get optimal spring configuration
  getSpring: (stiffness: number = 300, damping: number = 30): Transition => ({
    type: 'spring',
    stiffness: animationConfig.isHighPerformanceDevice() ? stiffness : stiffness * 0.8,
    damping: animationConfig.isHighPerformanceDevice() ? damping : damping * 1.2,
    mass: 1,
    velocity: 0
  })
};

// Modern easing curves for sophisticated animations
export const easingCurves = {
  // Apple-inspired easing curves
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  
  // Material Design easing curves
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
  decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
  accelerate: [0.4, 0, 1, 1] as [number, number, number, number],
  
  // Custom sophisticated curves
  smooth: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  elastic: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number]
};

// Sophisticated animation variants for common UI patterns
export const animationVariants = {
  // Page transitions with enhanced depth
  pageTransition: {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      filter: 'blur(4px)'
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: animationConfig.getDuration(0.4),
        ease: easingCurves.easeOut,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      filter: 'blur(2px)',
      transition: {
        duration: animationConfig.getDuration(0.3),
        ease: easingCurves.easeIn
      }
    }
  } as Variants,

  // Chat message animations with sophisticated entrance
  chatMessage: {
    initial: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      rotateX: -10
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: animationConfig.getDuration(0.5),
        ease: easingCurves.smooth,
        delay: 0.1
      }
    },
    hover: {
      y: -2,
      scale: 1.01,
      transition: {
        duration: animationConfig.getDuration(0.2),
        ease: easingCurves.easeOut
      }
    }
  } as Variants,

  // Button interactions with micro-animations
  button: {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: animationConfig.getDuration(0.2),
        ease: easingCurves.easeOut
      }
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: {
        duration: animationConfig.getDuration(0.1),
        ease: easingCurves.easeIn
      }
    },
    focus: {
      scale: 1.02,
      transition: {
        duration: animationConfig.getDuration(0.2),
        ease: easingCurves.easeOut
      }
    }
  } as Variants,

  // Input field animations with glass morphism effects
  input: {
    initial: {
      scale: 1,
      borderColor: 'rgba(226, 232, 240, 0.8)'
    },
    focus: {
      scale: 1.01,
      borderColor: 'rgba(79, 156, 249, 0.4)',
      boxShadow: '0 0 0 3px rgba(79, 156, 249, 0.15)',
      transition: {
        duration: animationConfig.getDuration(0.2),
        ease: easingCurves.easeOut
      }
    },
    blur: {
      scale: 1,
      borderColor: 'rgba(226, 232, 240, 0.8)',
      boxShadow: '0 0 0 0px rgba(79, 156, 249, 0)',
      transition: {
        duration: animationConfig.getDuration(0.2),
        ease: easingCurves.easeIn
      }
    }
  } as Variants,

  // Modal animations with backdrop blur
  modal: {
    initial: {
      opacity: 0,
      scale: 0.9,
      y: 50,
      backdropFilter: 'blur(0px)'
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      backdropFilter: 'blur(20px)',
      transition: {
        duration: animationConfig.getDuration(0.4),
        ease: easingCurves.smooth,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 30,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: animationConfig.getDuration(0.3),
        ease: easingCurves.easeIn
      }
    }
  } as Variants,

  // Loading animations with sophisticated patterns
  loading: {
    initial: { opacity: 0.6, scale: 1 },
    animate: {
      opacity: [0.6, 1, 0.6],
      scale: [1, 1.05, 1],
      transition: {
        duration: animationConfig.getDuration(1.5),
        repeat: Infinity,
        ease: easingCurves.easeInOut
      }
    }
  } as Variants,

  // Stagger animations for lists and grids
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  } as Variants,

  // Fade animations with enhanced smoothness
  fade: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: animationConfig.getDuration(0.3),
        ease: easingCurves.easeOut
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: animationConfig.getDuration(0.2),
        ease: easingCurves.easeIn
      }
    }
  } as Variants
};

// Performance-optimized motion props for common use cases
export const motionProps = {
  // High-performance page wrapper
  page: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: animationVariants.pageTransition,
    style: {
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden' as const,
      transform: 'translateZ(0)'
    }
  } as MotionProps,

  // Optimized chat message
  chatMessage: {
    initial: 'initial',
    animate: 'animate',
    whileHover: 'hover',
    variants: animationVariants.chatMessage,
    style: {
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden' as const
    }
  } as MotionProps,

  // Interactive button
  button: {
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
    whileFocus: 'focus',
    variants: animationVariants.button,
    style: {
      willChange: 'transform',
      backfaceVisibility: 'hidden' as const
    }
  } as MotionProps,

  // Input field with focus states
  input: {
    initial: 'initial',
    whileFocus: 'focus',
    variants: animationVariants.input,
    style: {
      willChange: 'transform, border-color, box-shadow'
    }
  } as MotionProps
};

// Utility functions for animation management
export const animationUtils = {
  // Create custom spring transition
  createSpring: (config?: Partial<Transition>): Transition => ({
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1,
    ...config
  }),

  // Create custom tween transition
  createTween: (duration: number, ease?: [number, number, number, number]): Transition => ({
    type: 'tween',
    duration: animationConfig.getDuration(duration),
    ease: ease || easingCurves.easeInOut
  }),

  // Check if animations should be enabled
  shouldAnimate: (): boolean => {
    return !animationConfig.prefersReducedMotion() && animationConfig.isHighPerformanceDevice();
  },

  // Get reduced motion variants
  getReducedMotionVariants: (variants: Variants): Variants => {
    if (!animationConfig.prefersReducedMotion()) return variants;
    
    const reducedVariants: Variants = {};
    Object.keys(variants).forEach(key => {
      const variant = variants[key];
      if (typeof variant === 'object' && variant !== null) {
        reducedVariants[key] = {
          ...variant,
          transition: { duration: 0 }
        };
      }
    });
    return reducedVariants;
  }
};
