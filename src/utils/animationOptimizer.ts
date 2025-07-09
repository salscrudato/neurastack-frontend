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
 * Advanced device performance tier detection with cutting-edge optimizations
 */
export const detectPerformanceTier = (): 'low' | 'medium' | 'high' => {
  // Check for performance API
  if (!('performance' in window)) return 'low';

  // Enhanced hardware acceleration detection
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const hasWebGL = !!gl;

  // Advanced GPU detection
  let gpuTier = 'unknown';
  if (gl) {
    try {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // Detect high-end GPUs
        if (renderer.includes('Apple') || renderer.includes('NVIDIA') || renderer.includes('AMD Radeon')) {
          gpuTier = 'high';
        } else if (renderer.includes('Intel')) {
          gpuTier = 'medium';
        } else {
          gpuTier = 'low';
        }
      }
    } catch (e) {
      // Fallback if GPU detection fails
      gpuTier = hasWebGL ? 'medium' : 'low';
    }
  }

  // Enhanced device memory detection
  const memory = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 2;

  // Advanced connection speed detection
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';
  const downlink = connection?.downlink || 10;

  // Enhanced performance scoring system
  let performanceScore = 0;

  // GPU score (40% weight)
  if (hasWebGL) performanceScore += 20;
  if (gpuTier === 'high') performanceScore += 20;
  else if (gpuTier === 'medium') performanceScore += 10;

  // Memory score (30% weight)
  if (memory >= 8) performanceScore += 30;
  else if (memory >= 4) performanceScore += 20;
  else if (memory >= 2) performanceScore += 10;

  // CPU score (20% weight)
  if (cores >= 8) performanceScore += 20;
  else if (cores >= 4) performanceScore += 15;
  else if (cores >= 2) performanceScore += 10;

  // Network score (10% weight)
  if (effectiveType === '4g' && downlink > 5) performanceScore += 10;
  else if (effectiveType === '4g' || effectiveType === '3g') performanceScore += 5;

  // Determine tier based on performance score
  if (performanceScore >= 70) return 'high';
  if (performanceScore >= 40) return 'medium';
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

  // Enhanced card hover effects with glass morphism
  card: {
    initial: {
      y: 0,
      scale: 1,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 12px rgba(79, 156, 249, 0.04)',
      backdropFilter: 'blur(16px)',
      transform: 'translateZ(0)',
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(79, 156, 249, 0.1)',
      backdropFilter: 'blur(24px)',
      transform: 'translateZ(0)',
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        type: 'spring',
        stiffness: 300,
        damping: 30
      },
    },
    tap: {
      y: -4,
      scale: 1.01,
      transition: { duration: 0.1 }
    }
  } as Variants,

  // Advanced glass morphism animation
  glassMorphism: {
    initial: {
      opacity: 0,
      scale: 0.9,
      backdropFilter: 'blur(0px)',
      background: 'rgba(255, 255, 255, 0)',
      transform: 'translateZ(0)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      backdropFilter: 'blur(20px)',
      background: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateZ(0)',
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      backdropFilter: 'blur(0px)',
      background: 'rgba(255, 255, 255, 0)',
      transform: 'translateZ(0)',
      transition: { duration: 0.3 }
    }
  } as Variants,

  // Modern button interactions
  modernButton: {
    initial: {
      scale: 1,
      boxShadow: '0 4px 16px rgba(79, 156, 249, 0.2)',
      transform: 'translateZ(0)',
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 8px 32px rgba(79, 156, 249, 0.3)',
      transform: 'translateZ(0)',
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    tap: {
      scale: 0.98,
      transform: 'translateZ(0)',
      transition: { duration: 0.1 }
    }
  } as Variants,

  // Enhanced fade with blur
  fadeBlur: {
    initial: {
      opacity: 0,
      filter: 'blur(4px)',
      transform: 'translateZ(0)'
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transform: 'translateZ(0)',
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    exit: {
      opacity: 0,
      filter: 'blur(2px)',
      transform: 'translateZ(0)',
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
    },
  } as Variants,

  // Micro-interaction for inputs
  inputFocus: {
    initial: {
      scale: 1,
      borderColor: 'rgba(226, 232, 240, 0.6)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      transform: 'translateZ(0)',
    },
    focus: {
      scale: 1.01,
      borderColor: 'rgba(79, 156, 249, 0.6)',
      boxShadow: '0 0 0 4px rgba(79, 156, 249, 0.12), 0 20px 60px rgba(79, 156, 249, 0.15)',
      transform: 'translateZ(0)',
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
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
