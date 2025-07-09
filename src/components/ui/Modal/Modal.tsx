/**
 * Unified Modal Component
 * 
 * Reusable modal component with consistent styling, animations,
 * and accessibility features. Replaces scattered modal implementations.
 */

import {
    Modal as ChakraModal,
    type ModalProps as ChakraModalProps,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';
import { APP_CONFIG } from '../../../config/app';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface ModalProps extends Omit<ChakraModalProps, 'children'> {
  /** Modal title */
  title?: string;
  
  /** Modal content */
  children: ReactNode;
  
  /** Custom header content (overrides title) */
  header?: ReactNode;
  
  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Enable glass morphism styling */
  glassEffect?: boolean;
  
  /** Custom z-index */
  zIndex?: number;
  
  /** Disable animations */
  disableAnimations?: boolean;
  
  /** Custom close button */
  customCloseButton?: ReactNode;
  
  /** Hide close button */
  hideCloseButton?: boolean;
}

// ============================================================================
// Animation Variants
// ============================================================================

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================================================
// Component
// ============================================================================

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  header,
  size = 'md',
  glassEffect = true,
  zIndex = APP_CONFIG.UI.Z_INDEX.MODAL,
  disableAnimations = false,
  customCloseButton,
  hideCloseButton = false,
  isOpen,
  onClose,
  ...props
}) => {
  const { config, capabilities, triggerHaptic } = useOptimizedDevice();

  // Mobile-specific sizing
  const modalSize = capabilities.isMobile ? 'full' : size;
  const modalMargin = capabilities.isMobile ? 0 : 4;
  const modalBorderRadius = capabilities.isMobile ? '0' : '1.5rem';

  // Determine if animations should be disabled
  const shouldDisableAnimations = disableAnimations || config.shouldReduceAnimations;
  
  // Animation configuration
  // const animationConfig = {
  //   duration: shouldDisableAnimations ? 0 : APP_CONFIG.UI.ANIMATION_DURATION.NORMAL,
  //   ease: APP_CONFIG.UI.ANIMATION_EASING,
  // };

  // Handle close with haptic feedback
  const handleClose = () => {
    if (config.shouldEnableHaptics) {
      triggerHaptic('LIGHT');
    }
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Modal sizes configuration
  const sizeConfig = {
    sm: { maxW: '400px' },
    md: { maxW: '500px' },
    lg: { maxW: '700px' },
    xl: { maxW: '900px' },
    full: { maxW: '95vw', maxH: '95vh' },
  };

  // Glass morphism styles
  const glassStyles = glassEffect ? {
    bg: APP_CONFIG.THEME.COLORS.BG_GLASS,
    backdropFilter: APP_CONFIG.THEME.GLASS.BACKDROP_FILTER,
    WebkitBackdropFilter: APP_CONFIG.THEME.GLASS.WEBKIT_BACKDROP_FILTER,
    border: APP_CONFIG.THEME.GLASS.BORDER,
    boxShadow: APP_CONFIG.THEME.GLASS.SHADOW,
  } : {
    bg: APP_CONFIG.THEME.COLORS.BG_PRIMARY,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <ChakraModal
          isOpen={isOpen}
          onClose={handleClose}
          size={size}
          isCentered
          preserveScrollBarGap
          {...props}
        >
          {/* Animated Overlay */}
          <ModalOverlay
            as={motion.div}
            initial={shouldDisableAnimations ? undefined : "hidden"}
            animate={shouldDisableAnimations ? undefined : "visible"}
            exit={shouldDisableAnimations ? undefined : "exit"}
            variants={shouldDisableAnimations ? undefined : overlayVariants}
            transition={shouldDisableAnimations ? undefined : "all 0.2s ease-out"}
            bg="rgba(0, 0, 0, 0.4)"
            backdropFilter="blur(4px)"
            zIndex={zIndex}
          />
          
          {/* Animated Content */}
          <ModalContent
            as={motion.div}
            initial={shouldDisableAnimations ? undefined : "hidden"}
            animate={shouldDisableAnimations ? undefined : "visible"}
            exit={shouldDisableAnimations ? undefined : "exit"}
            variants={shouldDisableAnimations ? undefined : modalVariants}
            transition={shouldDisableAnimations ? undefined : "all 0.2s ease-out"}
            borderRadius={modalBorderRadius}
            overflow="hidden"
            mx={modalMargin}
            my={capabilities.isMobile ? 0 : 8}
            {...sizeConfig[modalSize]}
            {...glassStyles}
            sx={{
              // Enhanced mobile support
              ...(capabilities.isMobile && {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                maxHeight: '100vh',
                borderRadius: 0,
                margin: 0,
                // Safe area support
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                paddingLeft: 'env(safe-area-inset-left, 0px)',
                paddingRight: 'env(safe-area-inset-right, 0px)',
              }),
              // Desktop styling
              ...(!capabilities.isMobile && {
                mx: 4,
                my: 8,
                maxH: 'calc(100vh - 4rem)',
                borderRadius: '1.5rem',
              }),
              // Performance optimizations
              contain: 'layout style paint',
              willChange: shouldDisableAnimations ? 'auto' : 'transform, opacity',
              // Touch optimization
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Enhanced Mobile Header */}
            {(title || header) && (
              <ModalHeader
                pb={capabilities.isMobile ? 3 : 4}
                pt={capabilities.isMobile ? 4 : 6}
                px={capabilities.isMobile ? 4 : 6}
                borderBottom="1px solid"
                borderColor="rgba(226, 232, 240, 0.6)"
                bg="linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)"
                position="relative"
                sx={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  // Mobile-specific styling
                  ...(capabilities.isMobile && {
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Add drag indicator for mobile
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '36px',
                      height: '4px',
                      backgroundColor: 'rgba(148, 163, 184, 0.4)',
                      borderRadius: '2px',
                    },
                  }),
                }}
              >
                {header || (
                  <Text
                    fontSize={capabilities.isMobile ? "lg" : "xl"}
                    fontWeight="700"
                    color={APP_CONFIG.THEME.COLORS.TEXT_PRIMARY}
                    textAlign="center"
                    lineHeight="1.2"
                  >
                    {title}
                  </Text>
                )}
              </ModalHeader>
            )}

            {/* Close Button */}
            {!hideCloseButton && (
              customCloseButton || (
                <ModalCloseButton
                  size="lg"
                  top={4}
                  right={4}
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.8)"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.9)",
                    transform: shouldDisableAnimations ? "none" : "scale(1.05)",
                  }}
                  _active={{
                    transform: shouldDisableAnimations ? "none" : "scale(0.95)",
                  }}
                  transition="all 0.2s ease"
                  onClick={handleClose}
                />
              )
            )}

            {/* Enhanced Mobile Body */}
            <ModalBody
              p={capabilities.isMobile ? 4 : 6}
              sx={{
                // Mobile-specific scrolling optimizations
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                scrollBehavior: 'smooth',
                // Better touch scrolling for mobile
                ...(capabilities.isMobile && {
                  touchAction: 'pan-y',
                  overscrollBehaviorY: 'contain',
                  // Improved scrollbar for mobile
                  '&::-webkit-scrollbar': {
                    width: '2px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(79, 156, 249, 0.2)',
                    borderRadius: '1px',
                  },
                }),
                // Desktop scrollbar styling
                ...(!capabilities.isMobile && {
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(79, 156, 249, 0.3)',
                    borderRadius: '3px',
                    '&:hover': {
                      background: 'rgba(79, 156, 249, 0.5)',
                    },
                  },
                }),
                // Performance optimizations
                contain: 'layout style paint',
                willChange: capabilities.isMobile ? 'scroll-position' : 'auto',
              }}
            >
              {children}
            </ModalBody>
          </ModalContent>
        </ChakraModal>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// Export
// ============================================================================

export default Modal;
