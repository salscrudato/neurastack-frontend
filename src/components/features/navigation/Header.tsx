/**
 * Simplified Header Component
 * 
 * Streamlined navigation header with mobile optimization,
 * consistent styling, and better performance.
 */

import {
    Avatar,
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack,
    IconButton,
    Text,
    useDisclosure,
    useToast,
    VStack
} from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { useCallback, useMemo } from 'react';
import {
    PiChatCircleBold,
    PiClockCounterClockwiseBold,
    PiListBold,
    PiSignOutBold
} from 'react-icons/pi';
import { useLocation, useNavigate } from 'react-router-dom';

import { APP_CONFIG } from '../../../config/app';
import { auth } from '../../../firebase';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';
import { useAuthStore } from '../../../store/useAuthStore';
import { BrandLogo } from '../../BrandLogo';

// ============================================================================
// Types
// ============================================================================

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Hooks
  const { capabilities, config, triggerHaptic } = useOptimizedDevice();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);

  // Navigation items
  const navigationItems = useMemo((): NavigationItem[] => [
    {
      label: 'Chat',
      path: '/chat',
      icon: PiChatCircleBold,
      disabled: false,
    },
    {
      label: 'History',
      path: '/history',
      icon: PiClockCounterClockwiseBold,
      disabled: false,
    },
  ], []);

  // Handle navigation
  const handleNavigate = useCallback((path: string) => {
    if (config.shouldEnableHaptics) {
      triggerHaptic('TAP');
    }
    navigate(path);
    onClose();
  }, [navigate, onClose, config.shouldEnableHaptics, triggerHaptic]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      if (config.shouldEnableHaptics) {
        triggerHaptic('LIGHT');
      }
      
      await signOut(auth);
      setUser(null);
      navigate('/', { replace: true });
      onClose();
      
      toast({
        title: 'Signed out successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      if (config.shouldEnableHaptics) {
        triggerHaptic('ERROR');
      }
      
      toast({
        title: 'Error signing out',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [config.shouldEnableHaptics, triggerHaptic, setUser, navigate, onClose, toast]);

  // Responsive configuration
  const headerConfig = {
    height: capabilities.isMobile ? '56px' : '64px',
    padding: capabilities.isMobile ? 4 : 6,
    logoSize: capabilities.isMobile ? 'sm' as const : 'md' as const,
  };

  return (
    <>
      {/* Header */}
      <Box
        as="header"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={APP_CONFIG.UI.Z_INDEX.FIXED}
        w="100%"
        bg="#ffffff"
        borderBottom="1px solid #e5e7eb"
        boxShadow="none"
        sx={{
          // Performance optimizations
          contain: 'layout style paint',
          willChange: 'auto',
          // Smooth transitions
          transition: 'all 0.15s ease',
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          maxW="1200px"
          mx="auto"
          px={headerConfig.padding}
          h={headerConfig.height}
        >
          {/* Menu Button (Mobile) */}
          {capabilities.isMobile && (
            <IconButton
              icon={<PiListBold />}
              aria-label="Open navigation menu"
              variant="ghost"
              size="md"
              onClick={onOpen}
              color="#3b82f6"
              borderRadius="12px"
              _hover={{
                bg: 'rgba(59, 130, 246, 0.08)',
                transform: 'scale(1.05)',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              sx={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                minW: '44px',
                minH: '44px',
              }}
            />
          )}

          {/* Logo */}
          <Flex align="center" flex={capabilities.isMobile ? 1 : 'none'} justify={capabilities.isMobile ? 'center' : 'flex-start'}>
            <BrandLogo size={headerConfig.logoSize} />
          </Flex>

          {/* Desktop Navigation */}
          {!capabilities.isMobile && (
            <HStack spacing={1}>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="md"
                    leftIcon={<Icon size={18} />}
                    onClick={() => handleNavigate(item.path)}
                    isDisabled={item.disabled}
                    color={isActive ? '#3b82f6' : '#64748b'}
                    bg={isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent'}
                    fontWeight={isActive ? '600' : '500'}
                    borderRadius="12px"
                    px={4}
                    _hover={{
                      bg: 'rgba(59, 130, 246, 0.08)',
                      color: '#3b82f6',
                      transform: 'translateY(-1px)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </HStack>
          )}

          {/* User Avatar */}
          <Avatar
            size="sm"
            src={user?.photoURL || undefined}
            name={user?.displayName || user?.email || 'User'}
            bg="#3b82f6"
            color="white"
            cursor="pointer"
            onClick={capabilities.isMobile ? onOpen : handleSignOut}
            border="2px solid rgba(59, 130, 246, 0.1)"
            _hover={{
              transform: config.shouldReduceAnimations ? 'none' : 'scale(1.1)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
            }}
            _active={{
              transform: 'scale(1.05)',
            }}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            sx={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          />
        </Flex>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(8px)" />
        <DrawerContent
          bg="rgba(255, 255, 255, 0.98)"
          sx={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(226, 232, 240, 0.6)',
          }}
        >
          <DrawerCloseButton
            size="lg"
            top={4}
            right={4}
            borderRadius="12px"
            color="#64748b"
            _hover={{
              bg: 'rgba(59, 130, 246, 0.08)',
              color: '#3b82f6',
              transform: 'scale(1.05)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          />
          
          <DrawerHeader pt={8} pb={4}>
            <Flex align="center" gap={3}>
              <Avatar
                size="md"
                src={user?.photoURL || undefined}
                name={user?.displayName || user?.email || 'User'}
                bg="var(--color-accent)"
                color="white"
              />
              <Box>
                <Text fontWeight="600" fontSize="md" color={APP_CONFIG.THEME.COLORS.TEXT_PRIMARY}>
                  {user?.displayName || 'User'}
                </Text>
                <Text fontSize="sm" color={APP_CONFIG.THEME.COLORS.TEXT_SECONDARY}>
                  {user?.email}
                </Text>
              </Box>
            </Flex>
          </DrawerHeader>

          <DrawerBody px={6}>
            <VStack spacing={2} align="stretch">
              {/* Navigation Items */}
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="lg"
                    leftIcon={<Icon size={20} />}
                    onClick={() => handleNavigate(item.path)}
                    isDisabled={item.disabled}
                    justifyContent="flex-start"
                    color={isActive ? '#3b82f6' : '#1f2937'}
                    bg={isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent'}
                    fontWeight={isActive ? '600' : '500'}
                    borderRadius="16px"
                    h="56px"
                    px={4}
                    _hover={{
                      bg: 'rgba(59, 130, 246, 0.08)',
                      color: '#3b82f6',
                      transform: 'translateX(4px)',
                    }}
                    _active={{
                      transform: 'translateX(2px)',
                    }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    {item.label}
                  </Button>
                );
              })}

              {/* Sign Out Button */}
              <Box mt={6}>
                <Button
                  variant="ghost"
                  size="lg"
                  leftIcon={<PiSignOutBold size={20} />}
                  onClick={handleSignOut}
                  justifyContent="flex-start"
                  color="#dc2626"
                  borderRadius="16px"
                  h="56px"
                  px={4}
                  fontWeight="500"
                  _hover={{
                    bg: 'rgba(220, 38, 38, 0.08)',
                    transform: 'translateX(4px)',
                  }}
                  _active={{
                    transform: 'translateX(2px)',
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  Sign Out
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;
