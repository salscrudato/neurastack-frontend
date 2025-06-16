import {
  Flex, IconButton, Box, Text, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  useToast, Tooltip, Drawer, DrawerBody, DrawerHeader,
  DrawerOverlay, DrawerContent, DrawerCloseButton,
  useDisclosure, VStack, useBreakpointValue,
  HStack, Icon
} from '@chakra-ui/react';
import {
  PiUserLight, PiSignOutBold, PiUserCircleBold,
  PiListBold, PiChatCircleBold, PiClockCounterClockwiseBold,
  PiHeartBold, PiHouseBold, PiGearBold
} from 'react-icons/pi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useMemo, useRef } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useReducedMotion } from '../hooks/useAccessibility';
import { BrandLogo } from './BrandLogo';
import { hasAdminAccess, ADMIN_CONFIG } from '../config/admin';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);
  const prefersReducedMotion = useReducedMotion();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  // Responsive navigation menu configuration
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Performance optimization: Close drawer on route change
  const prevPathname = useRef(location.pathname);
  if (prevPathname.current !== location.pathname) {
    prevPathname.current = location.pathname;
    if (isOpen) onClose();
  }

  // Determine brand text and navigation based on current page
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
        label: 'Home',
        path: '/',
        icon: PiHouseBold,
        description: 'Go to home page'
      },
      {
        label: 'Chat',
        path: '/chat',
        icon: PiChatCircleBold,
        description: 'Start a new conversation'
      },
      {
        label: 'History',
        path: '/history',
        icon: PiClockCounterClockwiseBold,
        description: 'View chat history'
      },
      {
        label: 'NeuraFit',
        path: '/neurafit',
        icon: PiHeartBold,
        description: 'AI-powered fitness training'
      }
    ];

    // Add admin link only for authorized admin user
    if (hasAdminAccess(user)) {
      baseItems.push({
        label: ADMIN_CONFIG.navigation.label,
        path: ADMIN_CONFIG.navigation.path,
        icon: PiGearBold,
        description: ADMIN_CONFIG.navigation.description
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

      return (
        <Box
          key={item.path}
          as="button"
          role="button"
          tabIndex={0}
          onClick={() => handleNavigationClick(item.path)}
          onKeyDown={(e: React.KeyboardEvent) => handleMenuKeyDown(e, item.path)}
          w="100%"
          p={4}
          borderRadius="xl"
          transition={animationConfig.transition}
          bg={isActive ? "rgba(79, 156, 249, 0.1)" : "transparent"}
          border={isActive ? "1px solid rgba(79, 156, 249, 0.2)" : "1px solid transparent"}
          _hover={{
            bg: isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(248, 250, 252, 0.8)",
            transform: prefersReducedMotion ? 'none' : 'translateX(4px)',
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
          }}
          _focus={{
            outline: "2px solid #4F9CF9",
            outlineOffset: "2px",
            bg: isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(248, 250, 252, 0.8)"
          }}
          _active={{
            transform: prefersReducedMotion ? 'none' : 'scale(0.98)'
          }}
          aria-label={`Navigate to ${item.label} - ${item.description}`}
          aria-current={isActive ? 'page' : undefined}
        >
          <HStack spacing={4} align="center">
            <Icon
              as={IconComponent}
              w={5}
              h={5}
              color={isActive ? "#4F9CF9" : "#64748B"}
              transition={animationConfig.transition}
            />
            <VStack align="start" spacing={0} flex={1}>
              <Text
                fontSize="md"
                fontWeight={isActive ? "semibold" : "medium"}
                color={isActive ? "#1E293B" : "#374151"}
                textAlign="left"
              >
                {item.label}
              </Text>
              <Text
                fontSize="xs"
                color="#64748B"
                textAlign="left"
                lineHeight="1.2"
              >
                {item.description}
              </Text>
            </VStack>
            {isActive && (
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
      position="sticky"
      top={0}
      w="100%"
      minH={headerConfig.height}
      zIndex={1000}
      // White background with subtle border
      bg="white"
      borderBottom="1px solid rgba(226, 232, 240, 0.8)"
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
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