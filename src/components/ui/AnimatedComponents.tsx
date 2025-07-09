/**
 * Modern Animated Components
 * 
 * Collection of innovative, smooth animated components for enhanced UX
 */

import { Box, Flex, Text } from '@chakra-ui/react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

// ============================================================================
// Motion Components
// ============================================================================

export const MotionBox = motion(Box);
export const MotionFlex = motion(Flex);
export const MotionText = motion(Text);

// ============================================================================
// Animation Variants
// ============================================================================

export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const slideInFromRight = {
  hidden: { 
    x: 100, 
    opacity: 0,
    scale: 0.9
  },
  visible: { 
    x: 0, 
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

export const scaleIn = {
  hidden: { 
    scale: 0.8, 
    opacity: 0,
    filter: 'blur(8px)'
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  }
};

export const liquidMorph = {
  hidden: { 
    borderRadius: '50%',
    scale: 0.5,
    opacity: 0
  },
  visible: { 
    borderRadius: '16px',
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// ============================================================================
// Animated Components
// ============================================================================

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export const FadeInView = ({ children, delay = 0, duration = 0.6 }: FadeInViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as any, { once: true, margin: '-100px' });

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      } : {}}
    >
      {children}
    </MotionBox>
  );
};

interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
}

export const StaggeredList = ({ children, staggerDelay = 0.1 }: StaggeredListProps) => {
  return (
    <MotionBox
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <MotionBox
          key={index}
          variants={fadeInUp}
          custom={index}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </MotionBox>
      ))}
    </MotionBox>
  );
};

interface FloatingElementProps {
  children: ReactNode;
  intensity?: number;
  duration?: number;
}

export const FloatingElement = ({ 
  children, 
  intensity = 10, 
  duration = 3 
}: FloatingElementProps) => {
  return (
    <MotionBox
      animate={{
        y: [-intensity, intensity, -intensity],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </MotionBox>
  );
};

interface PulseGlowProps {
  children: ReactNode;
  color?: string;
  intensity?: number;
}

export const PulseGlow = ({
  children,
  color = '#2563EB',
  intensity = 0.3
}: PulseGlowProps) => {
  return (
    <MotionBox
      animate={{
        boxShadow: [
          `0 0 20px ${color}${Math.round(intensity * 255).toString(16)}`,
          `0 0 40px ${color}${Math.round(intensity * 0.5 * 255).toString(16)}`,
          `0 0 20px ${color}${Math.round(intensity * 255).toString(16)}`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </MotionBox>
  );
};

interface MorphingCardProps {
  children: ReactNode;
  isActive?: boolean;
}

export const MorphingCard = ({ children, isActive = false }: MorphingCardProps) => {
  return (
    <MotionBox
      animate={{
        scale: isActive ? 1.05 : 1,
        borderRadius: isActive ? '24px' : '16px',
        boxShadow: isActive 
          ? '0 20px 40px rgba(79, 156, 249, 0.3)' 
          : '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.98
      }}
    >
      {children}
    </MotionBox>
  );
};

// ============================================================================
// Page Transition Wrapper
// ============================================================================

interface PageTransitionProps {
  children: ReactNode;
  key?: string;
}

export const PageTransition = ({ children, key }: PageTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <MotionBox
        key={key}
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {children}
      </MotionBox>
    </AnimatePresence>
  );
};

// ============================================================================
// Loading Animations
// ============================================================================

export const LiquidLoader = () => {
  return (
    <MotionBox
      w="60px"
      h="60px"
      borderRadius="50%"
      bg="linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
      animate={{
        scale: [1, 1.2, 1],
        borderRadius: ['50%', '30%', '50%'],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

export const WaveLoader = () => {
  return (
    <Flex gap={2} align="center">
      {[0, 1, 2].map((i) => (
        <MotionBox
          key={i}
          w="8px"
          h="8px"
          borderRadius="50%"
          bg="#4F9CF9"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </Flex>
  );
};
