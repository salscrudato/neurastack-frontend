/**
 * Header Component
 *
 * The main navigation header that appears at the top of every page (except splash).
 * Provides:
 * - Navigation menu for switching between app sections
 * - Brand logo that acts as a home button
 * - User account menu with profile info and sign out
 * - Responsive design that works on mobile and desktop
 * - Accessibility features like keyboard navigation and screen reader support
 */

// Import UI components from Chakra UI for building the interface
import {
    Avatar,
    Box,
    Drawer, DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack, Icon,
    IconButton,
    Menu, MenuButton,
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

// Import Firebase authentication functions
import { signOut } from 'firebase/auth';

// Import React hooks for component functionality
import { useCallback, useMemo, useRef } from 'react';

// Import icons for navigation and user interface
import {
    PiChatCircleBold, PiClockCounterClockwiseBold,
    PiGearBold,
    PiHeartBold,
    PiListBold,
    PiSignOutBold, PiUserCircleBold,
    PiUserLight
} from 'react-icons/pi';

// Import routing functionality
import { useLocation, useNavigate } from 'react-router-dom';

// Import app-specific modules
import { ADMIN_CONFIG, hasAdminAccess } from '../config/admin';  // Admin access control
import { auth } from '../firebase';  // Firebase authentication
import { useReducedMotion } from '../hooks/useAccessibility';  // Accessibility preferences
import { useAuthStore } from '../store/useAuthStore';  // User authentication state
import { BrandLogo } from './BrandLogo';  // App logo component

/**
 * Main Header Component Function
 */
export function Header() {
  // Get navigation and routing functionality
  const navigate = useNavigate();
  const location = useLocation();

  // Get user authentication state and functions
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);

  // Get accessibility preferences (reduced motion for animations)
  const prefersReducedMotion = useReducedMotion();

  // Control the mobile navigation drawer (open/close state)
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Toast notifications for user feedback
  const toast = useToast();

  // Detect if we're on mobile or desktop for responsive behavior
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Automatically close mobile menu when user navigates to a different page
  const prevPathname = useRef(location.pathname);
  if (prevPathname.current !== location.pathname) {
    prevPathname.current = location.pathname;
    if (isOpen) onClose();
  }

  // Customize the logo and navigation based on which section of the app we're in
  const isNeuraFitPage = location.pathname === '/neurafit';
  const brandText = isNeuraFitPage ? 'neurafit' : 'neurastack';
  const brandLabel = isNeuraFitPage ? 'NeuraFit - Go to NeuraFit' : 'Neurastack - Go to Chat';
  const brandNavigateTo = isNeuraFitPage ? '/neurafit' : '/chat';



  // Modern color values - light mode only
  const gray = '#64748B';
  const grayHover = '#475569';
  const menuBg = '#FFFFFF';
  const menuBorder = '#E2E8F0';
  const hoverBg = '#F8FAFC';

  // Responsive configuration
  const headerConfig = useMemo(() => ({
    height: { xs: "56px", sm: "58px", md: "60px", lg: "64px", xl: "68px" },
    padding: { xs: 3, sm: 3.5, md: 4, lg: 5, xl: 6 },
    logoSize: { base: "md", md: "lg" },
    fontSize: { xs: "sm", sm: "md", md: "md", lg: "lg", xl: "lg" }
  }), []);

  // Navigation menu items configuration
  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        label: 'Chat',
        path: '/chat',
        icon: PiChatCircleBold,
        disabled: false
      },
      {
        label: 'History',
        path: '/history',
        icon: PiClockCounterClockwiseBold,
        disabled: false
      },
      {
        label: 'NeuraFit',
        path: '/neurafit',
        icon: PiHeartBold,
        disabled: false
      }
    ];

    // Add admin link only for authorized admin user
    if (hasAdminAccess(user)) {
      baseItems.push({
        label: ADMIN_CONFIG.navigation.label,
        path: ADMIN_CONFIG.navigation.path,
        icon: PiGearBold,
        disabled: false
      });
    }

    return baseItems;
  }, [user]);

  // Get current page info for accessibility
  const currentPageInfo = useMemo(() => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem || navigationItems[1]; // Default to Chat
  }, [location.pathname, navigationItems]);

  const handleSignOut = useCallback(async () => {
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
  }, [toast, setUser, navigate]);

  // Enhanced navigation handlers
  const handleNavigationClick = useCallback((path: string) => {
    navigate(path);
    onClose(); // Close mobile menu after navigation
  }, [navigate, onClose]);

  // Enhanced keyboard navigation for menu items
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigationClick(path);
    }
  }, [handleNavigationClick]);

  const getUserDisplayName = useCallback(() => {
    if (!user) return 'Guest';
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'Guest User';
  }, [user]);

  const isGuest = useMemo(() => user?.isAnonymous, [user?.isAnonymous]);

  // Enhanced animation configuration with performance optimizations
  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
    iconRotation: prefersReducedMotion ? 'none' : 'rotate(180deg) scale(1.1)',
    // GPU acceleration for smooth animations
    willChange: prefersReducedMotion ? 'auto' : 'transform, opacity'
  }), [prefersReducedMotion]);

  // Performance optimization: Memoize drawer content to prevent unnecessary re-renders
  const drawerContent = useMemo(() => (
    navigationItems.map((item) => {
      const isActive = location.pathname === item.path;
      const IconComponent = item.icon;
      const isDisabled = item.disabled;

      return (
        <Box
          key={item.path}
          as="button"
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          onClick={isDisabled ? undefined : () => handleNavigationClick(item.path)}
          onKeyDown={isDisabled ? undefined : (e: React.KeyboardEvent) => handleMenuKeyDown(e, item.path)}
          w="100%"
          p={4}
          borderRadius="xl"
          transition={animationConfig.transition}
          bg={isActive ? "rgba(79, 156, 249, 0.1)" : "transparent"}
          border={isActive ? "1px solid rgba(79, 156, 249, 0.2)" : "1px solid transparent"}
          opacity={isDisabled ? 0.5 : 1}
          cursor={isDisabled ? "not-allowed" : "pointer"}
          _hover={isDisabled ? {} : {
            bg: isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(248, 250, 252, 0.8)",
            transform: prefersReducedMotion ? 'none' : 'translateX(4px)',
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
          }}
          _focus={isDisabled ? {} : {
            outline: "2px solid #4F9CF9",
            outlineOffset: "2px",
            bg: isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(248, 250, 252, 0.8)"
          }}
          _active={isDisabled ? {} : {
            transform: prefersReducedMotion ? 'none' : 'scale(0.98)'
          }}
          aria-label={`Navigate to ${item.label}`}
          aria-current={isActive ? 'page' : undefined}
          aria-disabled={isDisabled}
        >
          <HStack spacing={4} align="center">
            <Icon
              as={IconComponent}
              w={5}
              h={5}
              color={isDisabled ? "#94A3B8" : (isActive ? "#4F9CF9" : "#64748B")}
              transition={animationConfig.transition}
            />
            <Text
              fontSize="md"
              fontWeight={isActive ? "semibold" : "medium"}
              color={isDisabled ? "#94A3B8" : (isActive ? "#1E293B" : "#374151")}
              textAlign="left"
              flex={1}
            >
              {item.label}
            </Text>
            {isActive && !isDisabled && (
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg="#4F9CF9"
                flexShrink={0}
              />
            )}
          </HStack>
        </Box>
      );
    })
  ), [location.pathname, navigationItems, handleNavigationClick, handleMenuKeyDown, animationConfig, prefersReducedMotion]);

  return (
    <Flex
      as="header"
      role="banner"
      px={headerConfig.padding}
      py={{ xs: 2.5, sm: 3, md: 3.5, lg: 4, xl: 4.5 }}
      gap={{ xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 }}
      align="center"
      w="100%"
      minH={headerConfig.height}
      // Enhanced touch interactions
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Mobile-specific optimizations
        '@media (max-width: 768px)': {
          minHeight: '56px',
          paddingX: 3,
          paddingY: 2.5,
        }
      }}
    >

      {/* Enhanced Navigation Menu Button */}
      <Tooltip
        label="Navigation menu"
        hasArrow
        placement="bottom-start"
        openDelay={500}
      >
        <IconButton
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          icon={<PiListBold size={20} />}
          onClick={onOpen}
          variant="ghost"
          color="#64748B"
          bg="rgba(255, 255, 255, 0.8)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius={{ xs: "lg", sm: "xl", md: "xl", lg: "2xl" }}
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          // Enhanced touch targets for mobile
          minH={{ xs: "44px", sm: "46px", md: "48px" }}
          minW={{ xs: "44px", sm: "46px", md: "48px" }}
          // Desktop-only left padding
          ml={{ base: 0, md: 4 }}
          transition={animationConfig.transition}
          _hover={{
            bg: "rgba(255, 255, 255, 0.95)",
            transform: animationConfig.transform,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            color: "#4F9CF9"
          }}
          _focus={{
            outline: "2px solid #4F9CF9",
            outlineOffset: "2px",
            bg: "rgba(255, 255, 255, 0.95)"
          }}
          _active={{
            transform: prefersReducedMotion ? 'none' : 'scale(0.98)',
            bg: "rgba(255, 255, 255, 1)"
          }}
        />
      </Tooltip>

      {/* Enhanced Absolutely Centered Logo */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        zIndex={1}
      >
        <Tooltip
          label={brandLabel}
          hasArrow
          placement="bottom"
          openDelay={500}
        >
          <Box
            as="button"
            role="button"
            tabIndex={0}
            aria-label={`${brandText} logo - navigate to ${isNeuraFitPage ? 'NeuraFit' : 'chat'}`}
            onClick={() => navigate(brandNavigateTo)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(brandNavigateTo);
              }
            }}
            transition={animationConfig.transition}
            borderRadius="lg"
            p={1}
            _hover={{
              transform: prefersReducedMotion ? 'none' : "scale(1.05)",
              opacity: 0.8
            }}
            _focus={{
              outline: "2px solid #4F9CF9",
              outlineOffset: "2px"
            }}
            _active={{
              transform: prefersReducedMotion ? 'none' : "scale(0.98)"
            }}
          >
            <BrandLogo
              size={headerConfig.logoSize}
              variant="header"
              cursor="pointer"
              text={brandText}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Spacer to balance the layout */}
      <Box flex="1" />

      {/* Enhanced User menu */}
      <Menu>
        <Tooltip
          label={`Account menu - ${getUserDisplayName()}`}
          hasArrow
          placement="bottom-end"
          openDelay={500}
        >
          <MenuButton
            as={IconButton}
            aria-label={`Account menu for ${getUserDisplayName()}`}
            aria-expanded="false"
            aria-haspopup="menu"
            variant="ghost"
            color="#64748B"
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            borderRadius={{ xs: "lg", sm: "xl", md: "xl", lg: "2xl" }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            // Enhanced touch targets
            minH={{ xs: "44px", sm: "46px", md: "48px" }}
            minW={{ xs: "44px", sm: "46px", md: "48px" }}
            // Desktop-only right padding
            mr={{ base: 0, md: 4 }}
            // Perfect centering for icon content
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition={animationConfig.transition}
            _hover={{
              bg: "rgba(255, 255, 255, 0.95)",
              transform: animationConfig.transform,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
            }}
            _focus={{
              outline: "2px solid #4F9CF9",
              outlineOffset: "2px",
              bg: "rgba(255, 255, 255, 0.95)"
            }}
            _active={{
              transform: prefersReducedMotion ? 'none' : 'scale(0.98)',
              bg: "rgba(255, 255, 255, 1)"
            }}
          >
            {user?.photoURL ? (
              <Avatar
                size="sm"
                src={user.photoURL}
                name={getUserDisplayName()}
                w="28px"
                h="28px"
                borderRadius="full"
                objectFit="cover"
                overflow="hidden"
                flexShrink={0}
              />
            ) : (
              <Icon
                as={PiUserLight}
                w="20px"
                h="20px"
                color="inherit"
              />
            )}
          </MenuButton>
        </Tooltip>

        <MenuList
          bg={menuBg}
          border="1px solid"
          borderColor={menuBorder}
          borderRadius={{ xs: "lg", sm: "xl", md: "xl", lg: "2xl" }}
          boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          backdropFilter="blur(10px)"
          p={{ xs: 1.5, sm: 2, md: 2, lg: 2.5 }}
          minW={{ xs: "200px", sm: "220px", md: "240px" }}
          // Enhanced mobile support
          sx={{
            '@media (max-width: 768px)': {
              minWidth: '180px',
              padding: '1rem',
            }
          }}
        >
          {/* Enhanced User info */}
          <MenuItem
            isDisabled
            borderRadius="lg"
            p={{ xs: 2, sm: 2.5, md: 3 }}
            _disabled={{
              opacity: 1,
              cursor: 'default'
            }}
          >
            <HStack spacing={{ xs: 2, sm: 3 }}>
              <PiUserCircleBold size={20} />
              <Box>
                <Text
                  fontSize={{ xs: "sm", md: "sm" }}
                  fontWeight="medium"
                  color="#374151"
                >
                  {getUserDisplayName()}
                </Text>
                {user?.email && !isGuest && (
                  <Text
                    fontSize={{ xs: "xs", md: "xs" }}
                    color={gray}
                    noOfLines={1}
                  >
                    {user.email}
                  </Text>
                )}
              </Box>
            </HStack>
          </MenuItem>

          <MenuDivider />

          <MenuItem
            onClick={handleSignOut}
            color={grayHover}
            borderRadius="lg"
            p={{ xs: 2, sm: 2.5, md: 3 }}
            transition={animationConfig.transition}
            _hover={{
              bg: hoverBg,
              transform: prefersReducedMotion ? 'none' : 'translateX(2px)'
            }}
            _focus={{
              bg: hoverBg,
              outline: "2px solid #4F9CF9",
              outlineOffset: "-2px"
            }}
            // Enhanced touch target
            minH={{ xs: "44px", sm: "46px", md: "48px" }}
          >
            <HStack spacing={{ xs: 2, sm: 3 }}>
              <PiSignOutBold size={18} />
              <Text fontSize={{ xs: "sm", md: "sm" }}>Sign Out</Text>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Enhanced Navigation Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size={isMobile ? "xs" : "sm"}
        blockScrollOnMount={true}
        preserveScrollBarGap={true}
        returnFocusOnClose={true}
        trapFocus={true}
      >
        <DrawerOverlay
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(4px)"
          transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
        />
        <DrawerContent
          bg="rgba(255, 255, 255, 0.95)"
          backdropFilter="blur(20px)"
          borderRight="1px solid rgba(255, 255, 255, 0.2)"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          // Enhanced mobile support
          sx={{
            '@media (max-width: 768px)': {
              maxWidth: '280px',
            }
          }}
        >
          <DrawerCloseButton
            color="#64748B"
            _hover={{ color: "#4F9CF9", bg: "rgba(79, 156, 249, 0.1)" }}
            _focus={{ outline: "2px solid #4F9CF9", outlineOffset: "2px" }}
            size="lg"
            top={4}
            right={4}
          />

          <DrawerHeader
            pb={6}
            pt={8}
            px={6}
            borderBottom="1px solid rgba(226, 232, 240, 0.8)"
          >
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="#1E293B"
              fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
            >
              Navigation
            </Text>
            <Text
              fontSize="sm"
              color="#64748B"
              mt={1}
            >
              Current: {currentPageInfo.label}
            </Text>
          </DrawerHeader>

          <DrawerBody px={6} py={6}>
            <VStack spacing={3} align="stretch">
              {drawerContent}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}