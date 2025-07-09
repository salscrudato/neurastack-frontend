import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    CloseButton,
    Flex
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface ToastProps {
  /** Toast ID for management */
  id: string;
  
  /** Toast status */
  status: 'success' | 'error' | 'warning' | 'info';
  
  /** Toast title */
  title?: string;
  
  /** Toast description */
  description?: string;
  
  /** Duration in milliseconds (0 = persistent) */
  duration?: number;
  
  /** Whether toast is closable */
  isClosable?: boolean;
  
  /** Position on screen */
  position?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  
  /** Custom action button */
  action?: React.ReactNode;
  
  /** Close handler */
  onClose?: () => void;
  
  /** Whether toast is visible */
  isVisible?: boolean;
}

// ============================================================================
// Animations
// ============================================================================

const toastVariants = {
  initial: (position: string) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    
    return {
      opacity: 0,
      scale: 0.8,
      y: isTop ? -50 : 50,
      x: isLeft ? -50 : isRight ? 50 : 0,
    };
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (position: string) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    
    return {
      opacity: 0,
      scale: 0.8,
      y: isTop ? -30 : 30,
      x: isLeft ? -30 : isRight ? 30 : 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    };
  },
};

// ============================================================================
// Styles
// ============================================================================

const getStatusStyles = (status: ToastProps['status']) => {
  switch (status) {
    case 'success':
      return {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        iconColor: '#10B981',
      };
    case 'error':
      return {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        iconColor: '#EF4444',
      };
    case 'warning':
      return {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        iconColor: '#F59E0B',
      };
    case 'info':
      return {
        bg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
        borderColor: 'rgba(37, 99, 235, 0.3)',
        iconColor: '#2563EB',
      };
    default:
      return {
        bg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
        borderColor: 'rgba(37, 99, 235, 0.3)',
        iconColor: '#2563EB',
      };
  }
};

// ============================================================================
// Component
// ============================================================================

export const Toast: React.FC<ToastProps> = ({
  // id,
  status,
  title,
  description,
  isClosable = true,
  position = 'top-right',
  action,
  onClose,
  isVisible = true,
}) => {
  const { config } = useOptimizedDevice();
  const statusStyles = getStatusStyles(status);
  
  // Disable animations if user prefers reduced motion
  const shouldAnimate = !config.shouldReduceAnimations;

  const toastContent = (
    <Box
      as={shouldAnimate ? motion.div : 'div'}
      {...(shouldAnimate && {
        custom: position,
        variants: toastVariants,
        initial: 'initial',
        animate: 'animate',
        exit: 'exit',
      })}
      maxW="400px"
      minW="300px"
      bg={statusStyles.bg}
      border="1px solid"
      borderColor={statusStyles.borderColor}
      borderRadius="xl"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)"
      overflow="hidden"
      sx={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Alert
        status={status}
        variant="subtle"
        bg="transparent"
        borderRadius="xl"
        p={4}
        alignItems="flex-start"
      >
        <AlertIcon color={statusStyles.iconColor} mt={0.5} />
        
        <Box flex="1" mr={isClosable ? 8 : 0}>
          {title && (
            <AlertTitle
              fontSize="sm"
              fontWeight="600"
              color="gray.800"
              mb={description ? 1 : 0}
            >
              {title}
            </AlertTitle>
          )}
          
          {description && (
            <AlertDescription
              fontSize="sm"
              color="gray.600"
              lineHeight="1.4"
            >
              {description}
            </AlertDescription>
          )}
          
          {action && (
            <Box mt={3}>
              {action}
            </Box>
          )}
        </Box>
        
        {isClosable && (
          <CloseButton
            position="absolute"
            right={2}
            top={2}
            size="sm"
            onClick={onClose}
            color="gray.500"
            _hover={{
              color: 'gray.700',
              bg: 'rgba(0, 0, 0, 0.05)',
            }}
            borderRadius="md"
          />
        )}
      </Alert>
    </Box>
  );

  if (!shouldAnimate) {
    return isVisible ? toastContent : null;
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && toastContent}
    </AnimatePresence>
  );
};

// ============================================================================
// Toast Container
// ============================================================================

export interface ToastContainerProps {
  /** Toast position */
  position?: ToastProps['position'];
  
  /** Maximum number of toasts */
  limit?: number;
  
  /** Toasts array */
  toasts: ToastProps[];
  
  /** Close handler */
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  limit = 5,
  toasts,
  onClose,
}) => {
  const { capabilities } = useOptimizedDevice();
  
  const getPositionStyles = () => {
    const isMobile = capabilities.isMobile;
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      pointerEvents: 'none' as const,
    };
    
    if (isMobile) {
      // Mobile: Always center horizontally, adjust vertical position
      return {
        ...baseStyles,
        left: '50%',
        transform: 'translateX(-50%)',
        ...(position.includes('top') ? { top: '20px' } : { bottom: '20px' }),
      };
    }
    
    // Desktop positioning
    switch (position) {
      case 'top':
        return { ...baseStyles, top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'bottom':
        return { ...baseStyles, bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      default:
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  const visibleToasts = toasts.slice(0, limit);

  return (
    <Box sx={getPositionStyles()}>
      <Flex
        direction="column"
        gap={3}
        align={capabilities.isMobile ? 'center' : 'flex-end'}
        sx={{ pointerEvents: 'auto' }}
      >
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            position={position}
            onClose={() => onClose(toast.id)}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default Toast;
