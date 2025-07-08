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
import { useMobileOptimization } from '../hooks/useMobileOptimization';
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
  const { isMobile, triggerHaptic, touchTargets } = useMobileOptimization();
  const user = useAuthStore(s => s.user);

  // Theme colors
  const bg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const borderColor = useColorModeValue('rgba(79, 156, 249, 0.1)', 'rgba(79, 156, 249, 0.2)');
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
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('light');
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
      bg={bg}
      borderTop="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      sx={{
        // Safe area support for devices with home indicator
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
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
                bg: isActive ? 'transparent' : 'rgba(79, 156, 249, 0.1)',
                transform: isDisabled ? 'none' : 'translateY(-1px)',
              }}
              _active={{
                transform: isDisabled ? 'none' : 'translateY(0px)',
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
