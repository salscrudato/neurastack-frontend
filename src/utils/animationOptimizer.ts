/**
 * Animation Optimization Utilities
 * 
 * High-performance animation system with mobile optimizations,
 * reduced motion support, and GPU acceleration.
 */

import type { MotionProps, Variants } from 'framer-motion';

// Animation configuration based on device capabilities
export interface AnimationConfig {
  /** Enable reduced motion for accessibility */
  reduceMotion?: boolean;
  /** Device performance tier */
  performanceTier?: 'low' | 'medium' | 'high';
  /** Enable GPU acceleration */
  useGPU?: boolean;
  /** Animation duration multiplier */
  durationMultiplier?: number;
}

/**
 * Detect device performance tier for animation optimization
 */
export const detectPerformanceTier = (): 'low' | 'medium' | 'high' => {
  // Check for performance API
  if (!('performance' in window)) return 'low';

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory) {
    if (memory >= 8) return 'high';
    if (memory >= 4) return 'medium';
    return 'low';
  }

  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency || 2;
  if (cores >= 8) return 'high';
  if (cores >= 4) return 'medium';
  return 'low';
};

/**
 * Get optimized animation configuration
 */
export const getAnimationConfig = (): AnimationConfig => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const performanceTier = detectPerformanceTier();
  
  return {
    reduceMotion,
    performanceTier,
    useGPU: performanceTier !== 'low',
    durationMultiplier: reduceMotion ? 0.01 : performanceTier === 'low' ? 0.5 : 1,
  };
};

/**
 * Optimized animation variants for common UI patterns
 */
export const optimizedVariants = {
  // Fade animations
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  // Slide animations with GPU optimization
  slideUp: {
    initial: { 
      opacity: 0, 
      y: 20,
      transform: 'translateZ(0)', // Force GPU layer
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transform: 'translateZ(0)',
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transform: 'translateZ(0)',
    },
  } as Variants,

  slideDown: {
    initial: { 
      opacity: 0, 
      y: -20,
      transform: 'translateZ(0)',
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transform: 'translateZ(0)',
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transform: 'translateZ(0)',
    },
  } as Variants,

  // Scale animations
  scale: {
    initial: { 
      opacity: 0, 
      scale: 0.95,
      transform: 'translateZ(0)',
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      transform: 'translateZ(0)',
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transform: 'translateZ(0)',
    },
  } as Variants,

  // Stagger container
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Button interactions
  button: {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1, ease: 'easeOut' },
    },
  } as Variants,

  // Card hover effects
  card: {
    initial: { 
      y: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    hover: { 
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  } as Variants,
};

/**
 * Create optimized motion props based on device capabilities
 */
export const createOptimizedMotionProps = (
  variant: keyof typeof optimizedVariants,
  config?: Partial<AnimationConfig>
): MotionProps => {
  const animConfig = { ...getAnimationConfig(), ...config };
  const variants = optimizedVariants[variant];

  if (animConfig.reduceMotion) {
    return {
      initial: undefined,
      animate: undefined,
      exit: undefined,
      transition: { duration: 0.01 },
    };
  }

  const baseDuration = animConfig.performanceTier === 'low' ? 0.2 : 0.3;
  const duration = baseDuration * (animConfig.durationMultiplier || 1);

  return {
    variants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    transition: {
      duration,
      ease: [0.4, 0, 0.2, 1], // Custom easing for smooth animations
    },
    style: animConfig.useGPU ? {
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
    } : undefined,
  };
};

/**
 * Optimized transition configurations
 */
export const optimizedTransitions = {
  // Fast transitions for immediate feedback
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },

  // Standard transitions for most UI elements
  standard: {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
  },

  // Slow transitions for complex animations
  slow: {
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1],
  },

  // Spring transitions for natural feel
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },

  // Bounce effect for playful interactions
  bounce: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 20,
  },
};

/**
 * Performance-optimized animation hook
 */
export const useOptimizedAnimation = (
  variant: keyof typeof optimizedVariants,
  options?: {
    config?: Partial<AnimationConfig>;
    delay?: number;
    onComplete?: () => void;
  }
) => {
  const motionProps = createOptimizedMotionProps(variant, options?.config);
  
  return {
    ...motionProps,
    transition: {
      ...motionProps.transition,
      delay: options?.delay || 0,
    },
    onAnimationComplete: options?.onComplete,
  };
};

/**
 * CSS-based animations for better performance on low-end devices
 */
export const cssAnimations = {
  fadeIn: 'fadeIn 0.3s ease-out forwards',
  slideUp: 'slideUp 0.3s ease-out forwards',
  slideDown: 'slideDown 0.3s ease-out forwards',
  scaleIn: 'scaleIn 0.3s ease-out forwards',
  pulse: 'pulse 2s ease-in-out infinite',
  spin: 'spin 1s linear infinite',
};

/**
 * Animation performance monitor
 */
export const AnimationPerformanceMonitor = {
  // Track animation frame rate
  trackFPS: (callback: (fps: number) => void) => {
    let frames = 0;
    let lastTime = performance.now();

    const tick = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        callback(fps);
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
  },

  // Measure animation performance
  measureAnimation: (name: string, animationFn: () => void) => {
    const start = performance.now();
    animationFn();
    const end = performance.now();
    
    console.log(`Animation "${name}" took ${end - start}ms`);
  },
};

export default {
  optimizedVariants,
  createOptimizedMotionProps,
  optimizedTransitions,
  useOptimizedAnimation,
  cssAnimations,
  AnimationPerformanceMonitor,
  getAnimationConfig,
  detectPerformanceTier,
};
