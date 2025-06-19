/**
 * Optimized Header Component
 * 
 * A clean, performant header component with human-readable naming conventions,
 * proper React hooks usage, and comprehensive type safety.
 */

import {
  Avatar,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useBreakpointValue,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { useCallback, useMemo } from 'react';
import {
  PiChatCircleBold,
  PiClockCounterClockwiseBold,
  PiGearBold,
  PiHeartBold,
  PiListBold,
  PiSignOutBold,
  PiUserCircleBold,
  PiUserLight
} from 'react-icons/pi';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_CONFIG, hasAdminAccess } from '../config/admin';
import { auth } from '../firebase';
import { useReducedMotion } from '../hooks/useAccessibility';
import { useAuthStore } from '../store/useAuthStore';
import { BrandLogo } from './BrandLogo';
import { createOptimizedCallback } from '../utils/componentOptimizations';

// ============================================================================
// Type Definitions
// ============================================================================

interface INavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  isDisabled: boolean;
}

interface IHeaderConfiguration {
  height: Record<string, string>;
  padding: Record<string, number>;
  logoSize: Record<string, string>;
  fontSize: Record<string, string>;
}

// ============================================================================
// Constants
// ============================================================================

const HEADER_COLORS = {
  gray: '#64748B',
  grayHover: '#475569',
  menuBackground: '#FFFFFF',
  menuBorder: '#E2E8F0',
  hoverBackground: '#F8FAFC',
  primary: '#4F9CF9',
  textPrimary: '#1E293B',
  textSecondary: '#374151'
} as const;

// ============================================================================
// Main Component
// ============================================================================

export function OptimizedHeader(): JSX.Element {
  // ============================================================================
  // Hooks and State
  // ============================================================================

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();
  
  // Store selectors
  const currentUser = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  
  // Responsive and accessibility hooks
  const isMobileDevice = useBreakpointValue({ base: true, md: false });
  const prefersReducedMotion = useReducedMotion();

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isNeuraFitPage = useMemo(() => location.pathname === '/neurafit', [location.pathname]);
  
  const brandConfiguration = useMemo(() => ({
    text: isNeuraFitPage ? 'neurafit' : 'neurastack',
    label: isNeuraFitPage ? 'NeuraFit - Go to NeuraFit' : 'Neurastack - Go to Chat',
    navigateTo: isNeuraFitPage ? '/neurafit' : '/chat'
  }), [isNeuraFitPage]);

  const headerConfiguration: IHeaderConfiguration = useMemo(() => ({
    height: { xs: "56px", sm: "58px", md: "60px", lg: "64px", xl: "68px" },
    padding: { xs: 3, sm: 3.5, md: 4, lg: 5, xl: 6 },
    logoSize: { base: "md", md: "lg" },
    fontSize: { xs: "sm", sm: "md", md: "md", lg: "lg", xl: "lg" }
  }), []);

  const navigationItems: INavigationItem[] = useMemo(() => {
    const baseNavigationItems: INavigationItem[] = [
      {
        label: 'Chat',
        path: '/chat',
        icon: PiChatCircleBold,
        isDisabled: false
      },
      {
        label: 'History',
        path: '/history',
        icon: PiClockCounterClockwiseBold,
        isDisabled: false
      },
      {
        label: 'NeuraFit',
        path: '/neurafit',
        icon: PiHeartBold,
        isDisabled: false
      }
    ];

    // Add admin navigation for authorized users
    if (hasAdminAccess(currentUser)) {
      baseNavigationItems.push({
        label: ADMIN_CONFIG.navigation.label,
        path: ADMIN_CONFIG.navigation.path,
        icon: PiGearBold,
        isDisabled: false
      });
    }

    return baseNavigationItems;
  }, [currentUser]);

  const animationConfiguration = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
    willChange: prefersReducedMotion ? 'auto' : 'transform, opacity'
  }), [prefersReducedMotion]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleUserSignOut = createOptimizedCallback(async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Sign out failed",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUser(null);
      navigate('/');
    }
  }, [toast, setUser, navigate], 'handleUserSignOut');

  const handleNavigationClick = createOptimizedCallback((targetPath: string) => {
    navigate(targetPath);
    closeDrawer(); // Close mobile menu after navigation
  }, [navigate, closeDrawer], 'handleNavigationClick');

  const handleBrandLogoClick = createOptimizedCallback(() => {
    navigate(brandConfiguration.navigateTo);
  }, [navigate, brandConfiguration.navigateTo], 'handleBrandLogoClick');

  const getUserDisplayName = useCallback((): string => {
    if (!currentUser) return 'Guest';
    if (currentUser.displayName) return currentUser.displayName;
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'Guest User';
  }, [currentUser]);

  // ============================================================================
  // Render Navigation Items
  // ============================================================================

  const renderNavigationItems = useMemo(() => (
    navigationItems.map((navigationItem) => {
      const isCurrentPage = location.pathname === navigationItem.path;
      const IconComponent = navigationItem.icon;

      return (
        <Box
          key={navigationItem.path}
          as="button"
          role="button"
          tabIndex={navigationItem.isDisabled ? -1 : 0}
          onClick={navigationItem.isDisabled ? undefined : () => handleNavigationClick(navigationItem.path)}
          w="100%"
          p={4}
          borderRadius="xl"
          transition={animationConfiguration.transition}
          bg={isCurrentPage ? "rgba(79, 156, 249, 0.1)" : "transparent"}
          border={isCurrentPage ? "1px solid rgba(79, 156, 249, 0.2)" : "1px solid transparent"}
          opacity={navigationItem.isDisabled ? 0.5 : 1}
          cursor={navigationItem.isDisabled ? "not-allowed" : "pointer"}
          _hover={navigationItem.isDisabled ? {} : {
            bg: isCurrentPage ? "rgba(79, 156, 249, 0.15)" : "rgba(248, 250, 252, 0.8)",
            transform: prefersReducedMotion ? 'none' : 'translateX(4px)',
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
          }}
          _focus={navigationItem.isDisabled ? {} : {
            outline: "2px solid #4F9CF9",
            outlineOffset: "2px",
            bg: isCurrentPage ? "rgba(79, 156, 249, 0.15)" : "rgba(248, 250, 252, 0.8)"
          }}
          aria-label={`Navigate to ${navigationItem.label}`}
          aria-current={isCurrentPage ? 'page' : undefined}
          aria-disabled={navigationItem.isDisabled}
        >
          <HStack spacing={4} align="center">
            <Icon
              as={IconComponent}
              w={5}
              h={5}
              color={navigationItem.isDisabled ? "#94A3B8" : (isCurrentPage ? HEADER_COLORS.primary : HEADER_COLORS.gray)}
              transition={animationConfiguration.transition}
            />
            <Text
              fontSize="md"
              fontWeight={isCurrentPage ? "semibold" : "medium"}
              color={navigationItem.isDisabled ? "#94A3B8" : (isCurrentPage ? HEADER_COLORS.textPrimary : HEADER_COLORS.textSecondary)}
              textAlign="left"
              flex={1}
            >
              {navigationItem.label}
            </Text>
            {isCurrentPage && !navigationItem.isDisabled && (
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={HEADER_COLORS.primary}
                flexShrink={0}
              />
            )}
          </HStack>
        </Box>
      );
    })
  ), [location.pathname, navigationItems, handleNavigationClick, animationConfiguration, prefersReducedMotion]);

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <>
      <Flex
        as="header"
        role="banner"
        px={headerConfiguration.padding}
        py={{ xs: 2.5, sm: 3, md: 3.5, lg: 4, xl: 4.5 }}
        gap={{ xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 }}
        align="center"
        position="sticky"
        top={0}
        w="100%"
        minH={headerConfiguration.height}
        zIndex={1000}
        bg="white"
        borderBottom="1px solid rgba(226, 232, 240, 0.8)"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
        sx={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Navigation Menu Button */}
        <Tooltip label="Navigation menu" hasArrow placement="bottom-start" openDelay={500}>
          <IconButton
            aria-label="Open navigation menu"
            aria-expanded={isDrawerOpen}
            aria-haspopup="menu"
            icon={<PiListBold size={20} />}
            onClick={openDrawer}
            variant="ghost"
            color={HEADER_COLORS.gray}
            bg="rgba(255, 255, 255, 0.8)"
            borderRadius="xl"
            minH="44px"
            minW="44px"
            transition={animationConfiguration.transition}
            _hover={{
              bg: "rgba(255, 255, 255, 0.95)",
              transform: animationConfiguration.transform,
              color: HEADER_COLORS.primary
            }}
            _focus={{
              outline: "2px solid #4F9CF9",
              outlineOffset: "2px"
            }}
          />
        </Tooltip>

        {/* Centered Brand Logo */}
        <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" zIndex={1}>
          <Tooltip label={brandConfiguration.label} hasArrow placement="bottom" openDelay={500}>
            <Box
              as="button"
              role="button"
              tabIndex={0}
              aria-label={`${brandConfiguration.text} logo - navigate to ${isNeuraFitPage ? 'NeuraFit' : 'chat'}`}
              onClick={handleBrandLogoClick}
              transition={animationConfiguration.transition}
              borderRadius="lg"
              p={1}
              _hover={{ transform: prefersReducedMotion ? 'none' : "scale(1.05)", opacity: 0.8 }}
              _focus={{ outline: "2px solid #4F9CF9", outlineOffset: "2px" }}
            >
              <BrandLogo
                size={headerConfiguration.logoSize}
                variant="header"
                cursor="pointer"
                text={brandConfiguration.text}
              />
            </Box>
          </Tooltip>
        </Box>

        {/* Spacer */}
        <Box flex="1" />

        {/* User Menu */}
        <Menu>
          <Tooltip label={`Account menu - ${getUserDisplayName()}`} hasArrow placement="bottom-end" openDelay={500}>
            <MenuButton
              as={IconButton}
              aria-label={`Account menu for ${getUserDisplayName()}`}
              variant="ghost"
              color={HEADER_COLORS.gray}
              bg="rgba(255, 255, 255, 0.8)"
              borderRadius="xl"
              minH="44px"
              minW="44px"
              transition={animationConfiguration.transition}
              _hover={{
                bg: "rgba(255, 255, 255, 0.95)",
                transform: animationConfiguration.transform
              }}
              _focus={{
                outline: "2px solid #4F9CF9",
                outlineOffset: "2px"
              }}
            >
              {currentUser?.photoURL ? (
                <Avatar
                  size="sm"
                  src={currentUser.photoURL}
                  name={getUserDisplayName()}
                  w="28px"
                  h="28px"
                />
              ) : (
                <Icon as={PiUserLight} w="20px" h="20px" />
              )}
            </MenuButton>
          </Tooltip>

          <MenuList
            bg={HEADER_COLORS.menuBackground}
            border="1px solid"
            borderColor={HEADER_COLORS.menuBorder}
            borderRadius="xl"
            boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            p={2}
            minW="200px"
          >
            <MenuItem isDisabled borderRadius="lg" p={3} _disabled={{ opacity: 1, cursor: 'default' }}>
              <HStack spacing={3}>
                <PiUserCircleBold size={20} />
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={HEADER_COLORS.textSecondary}>
                    {getUserDisplayName()}
                  </Text>
                  {currentUser?.email && !currentUser.isAnonymous && (
                    <Text fontSize="xs" color={HEADER_COLORS.gray} noOfLines={1}>
                      {currentUser.email}
                    </Text>
                  )}
                </Box>
              </HStack>
            </MenuItem>

            <MenuDivider />

            <MenuItem
              onClick={handleUserSignOut}
              color={HEADER_COLORS.grayHover}
              borderRadius="lg"
              p={3}
              transition={animationConfiguration.transition}
              _hover={{ bg: HEADER_COLORS.hoverBackground }}
              _focus={{ bg: HEADER_COLORS.hoverBackground, outline: "2px solid #4F9CF9" }}
              minH="44px"
            >
              <HStack spacing={3}>
                <PiSignOutBold size={18} />
                <Text fontSize="sm">Sign Out</Text>
              </HStack>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Navigation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="left"
        onClose={closeDrawer}
        size={isMobileDevice ? "xs" : "sm"}
        blockScrollOnMount={true}
        preserveScrollBarGap={true}
        returnFocusOnClose={true}
        trapFocus={true}
      >
        <DrawerOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
        <DrawerContent bg="rgba(255, 255, 255, 0.95)" backdropFilter="blur(20px)">
          <DrawerCloseButton
            color={HEADER_COLORS.gray}
            _hover={{ color: HEADER_COLORS.primary, bg: "rgba(79, 156, 249, 0.1)" }}
            _focus={{ outline: "2px solid #4F9CF9", outlineOffset: "2px" }}
            size="lg"
            top={4}
            right={4}
          />
          
          <DrawerHeader borderBottomWidth="1px" borderColor={HEADER_COLORS.menuBorder}>
            <Text fontSize="lg" fontWeight="semibold" color={HEADER_COLORS.textPrimary}>
              Navigation
            </Text>
          </DrawerHeader>

          <DrawerBody p={4}>
            <VStack spacing={2} align="stretch">
              {renderNavigationItems}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
