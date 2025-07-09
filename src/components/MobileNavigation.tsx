/**
 * Enhanced Mobile Navigation Component
 *
 * Provides optimized mobile navigation with:
 * - Bottom tab bar for better thumb reach
 * - Haptic feedback
 * - Smooth animations
 * - Accessibility features
 */

import {
    Box,
    Button,
    Flex,
    Icon,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';
import {
    PiChatCircleBold,
    PiClockCounterClockwiseBold,
    PiHeartBold
} from 'react-icons/pi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOptimizedDevice } from '../hooks/core/useOptimizedDevice';
import { useAuthStore } from '../store/useAuthStore';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface NavItem {
  path: string;
  icon: any;
  label: string;
  disabled?: boolean;
}

/**
 * Enhanced mobile navigation with bottom tab bar
 */
export const MobileNavigation = memo(function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { capabilities, triggerHaptic, responsive } = useOptimizedDevice();
  const { touchTargets } = responsive;
  const { isMobile } = capabilities;
  const user = useAuthStore(s => s.user);

  // Theme colors
  // const bg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  // const borderColor = useColorModeValue('rgba(79, 156, 249, 0.1)', 'rgba(79, 156, 249, 0.2)');
  const activeColor = useColorModeValue('#4F9CF9', '#4F9CF9');
  const inactiveColor = useColorModeValue('#64748B', '#A0AEC0');

  // Navigation items
  const navItems: NavItem[] = [
    {
      path: '/chat',
      icon: PiChatCircleBold,
      label: 'Chat'
    },
    {
      path: '/history',
      icon: PiClockCounterClockwiseBold,
      label: 'History'
    },
    {
      path: '/neurafit',
      icon: PiHeartBold,
      label: 'NeuraFit',
      disabled: user?.email !== 'sal.scrudato@gmail.com'
    }
  ];

  // Handle navigation with haptic feedback
  const handleNavigation = useCallback((path: string, disabled?: boolean) => {
    if (disabled) {
      triggerHaptic('ERROR');
      return;
    }

    triggerHaptic('LIGHT');
    navigate(path);
  }, [navigate, triggerHaptic]);

  // Don't render on desktop or splash page
  if (!isMobile || location.pathname === '/') {
    return null;
  }

  return (
    <MotionBox
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)"
      borderTop="1px solid"
      borderColor="rgba(226, 232, 240, 0.8)"
      backdropFilter="blur(30px)"
      WebkitBackdropFilter="blur(30px)"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      sx={{
        // Enhanced safe area support for devices with home indicator
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 4px)',
        paddingRight: 'calc(env(safe-area-inset-right, 0px) + 4px)',
        paddingTop: '8px',
        // Enhanced mobile performance
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
        // Enhanced touch handling
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Performance optimizations
        contain: 'layout style paint',
        isolation: 'isolate',
        // Enhanced shadow for better visual separation using CSS custom properties
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08), 0 -1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <MotionFlex
        justify="space-around"
        align="center"
        py={2}
        px={4}
        minH={touchTargets.large}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled = item.disabled;

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              minH={touchTargets.large}
              minW={touchTargets.large}
              onClick={() => handleNavigation(item.path, isDisabled)}
              disabled={isDisabled}
              opacity={isDisabled ? 0.4 : 1}
              cursor={isDisabled ? 'not-allowed' : 'pointer'}
              _hover={{
                bg: isActive
                  ? 'var(--color-primary-100)'
                  : 'var(--color-primary-50)',
                transform: isDisabled ? 'none' : 'translateY(-1px)',
                boxShadow: isDisabled ? 'none' : 'var(--shadow-modern)',
              }}
              _active={{
                transform: isDisabled ? 'none' : 'scale(0.95)',
                bg: isActive
                  ? 'linear-gradient(135deg, rgba(79, 156, 249, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(79, 156, 249, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%)',
              }}
              transition="all 0.2s ease"
              sx={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <VStack spacing={1}>
                <MotionBox
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? activeColor : inactiveColor,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon as={item.icon} boxSize={5} />
                </MotionBox>
                <Text
                  fontSize="xs"
                  fontWeight={isActive ? '600' : '500'}
                  color={isActive ? activeColor : inactiveColor}
                  transition="all 0.2s ease"
                >
                  {item.label}
                </Text>
              </VStack>
            </Button>
          );
        })}
      </MotionFlex>
    </MotionBox>
  );
});

export default MobileNavigation;
