import { memo, forwardRef, useRef } from 'react';
import {
  Button,
  IconButton,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import type { ButtonProps, IconButtonProps } from '@chakra-ui/react';

// Enhanced button with optimal touch targets and haptic feedback
interface TouchOptimizedButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  touchTarget?: 'small' | 'medium' | 'large';
}

interface TouchOptimizedIconButtonProps extends IconButtonProps {
  hapticFeedback?: boolean;
  touchTarget?: 'small' | 'medium' | 'large';
}

const touchTargetSizes = {
  small: { minW: '44px', minH: '44px' },
  medium: { minW: '48px', minH: '48px' },
  large: { minW: '56px', minH: '56px' },
};

// Haptic feedback utility (works on supported devices)
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    // Fallback vibration for devices that support it
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[type]);
  }
  
  // iOS haptic feedback (if available)
  if ('hapticFeedback' in window) {
    try {
      (window as any).hapticFeedback.impact(type);
    } catch (e) {
      // Silently fail if not supported
    }
  }
};

export const TouchOptimizedButton = memo(
  forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(({
    hapticFeedback = true,
    touchTarget = 'medium',
    onClick,
    children,
    ...props
  }, ref) => {
    const { minW, minH } = touchTargetSizes[touchTarget];
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) {
        triggerHapticFeedback('light');
      }
      onClick?.(e);
    };

    const enhancedProps = {
      ...props,
      minW,
      minH,
      onClick: handleClick,
      // Enhanced touch styles
      _active: {
        transform: 'scale(0.95)',
        ...props._active,
      },
      _hover: {
        transform: 'translateY(-1px)',
        ...props._hover,
      },
      transition: 'all 0.15s ease',
      // Ensure proper touch target spacing
      mx: touchTarget === 'large' ? 1 : 0.5,
      ...props,
    };

    return (
      <Button ref={ref} {...enhancedProps}>
        {children}
      </Button>
    );
  })
);

TouchOptimizedButton.displayName = 'TouchOptimizedButton';

export const TouchOptimizedIconButton = memo(
  forwardRef<HTMLButtonElement, TouchOptimizedIconButtonProps>(({
    hapticFeedback = true,
    touchTarget = 'medium',
    onClick,
    ...props
  }, ref) => {
    const { minW, minH } = touchTargetSizes[touchTarget];
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) {
        triggerHapticFeedback('light');
      }
      onClick?.(e);
    };

    const enhancedProps = {
      ...props,
      minW,
      minH,
      onClick: handleClick,
      // Enhanced touch styles
      _active: {
        transform: 'scale(0.95)',
        ...props._active,
      },
      _hover: {
        transform: 'translateY(-1px)',
        ...props._hover,
      },
      transition: 'all 0.15s ease',
      // Ensure proper touch target spacing
      mx: touchTarget === 'large' ? 1 : 0.5,
      ...props,
    };

    return (
      <IconButton ref={ref} {...enhancedProps} />
    );
  })
);

TouchOptimizedIconButton.displayName = 'TouchOptimizedIconButton';

// Enhanced mobile navigation component
interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const MobileNav = memo<MobileNavProps>(({ isOpen, onToggle, children }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <>
      {/* Mobile menu button */}
      <TouchOptimizedIconButton
        aria-label="Toggle navigation menu"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            {isOpen ? (
              // Close icon
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ) : (
              // Menu icon
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
          </svg>
        }
        onClick={onToggle}
        variant="ghost"
        display={{ base: 'flex', md: 'none' }}
        touchTarget="large"
      />

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            zIndex="overlay"
            onClick={onToggle}
            display={{ base: 'block', md: 'none' }}
          />
          
          {/* Menu content */}
          <Box
            position="fixed"
            top="0"
            left="0"
            w="280px"
            h="100vh"
            bg={bgColor}
            borderRight="1px solid"
            borderColor={borderColor}
            zIndex="modal"
            display={{ base: 'block', md: 'none' }}
            overflowY="auto"
            boxShadow="xl"
            transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
            transition="transform 0.3s ease"
          >
            {children}
          </Box>
        </>
      )}
    </>
  );
});

MobileNav.displayName = 'MobileNav';

// Swipe gesture hook for mobile interactions
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) => {
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX.current || !startY.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    startX.current = 0;
    startY.current = 0;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};
