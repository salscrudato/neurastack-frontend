import {
  Flex, IconButton, Box, Text, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  useToast, Tooltip,
  HStack, Icon
} from '@chakra-ui/react';
import { PiUserLight, PiSignOutBold, PiUserCircleBold, PiArrowsClockwise } from 'react-icons/pi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useReducedMotion } from '../hooks/useAccessibility';
import { BrandLogo } from './BrandLogo';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);
  const prefersReducedMotion = useReducedMotion();

  const toast = useToast();



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
    logoSize: { base: "sm", md: "md" },
    fontSize: { xs: "sm", sm: "md", md: "md", lg: "lg", xl: "lg" }
  }), []);

  // Enhanced header info with memoization
  const headerInfo = useMemo(() => {
    const path = location.pathname;

    if (path === '/chat') {
      return {
        text: 'CHAT',
        destination: '/history',
        fontSize: headerConfig.fontSize,
        ariaLabel: 'Switch to chat history'
      };
    } else if (path === '/history') {
      return {
        text: 'HISTORY',
        destination: '/chat',
        fontSize: headerConfig.fontSize,
        ariaLabel: 'Switch to chat'
      };
    } else {
      return {
        text: 'CHAT',
        destination: '/history',
        fontSize: headerConfig.fontSize,
        ariaLabel: 'Switch to chat history'
      };
    }
  }, [location.pathname, headerConfig.fontSize]);

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

  const handleNavigation = useCallback(() => {
    navigate(headerInfo.destination);
  }, [navigate, headerInfo.destination]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigation();
    }
  }, [handleNavigation]);

  const getUserDisplayName = useCallback(() => {
    if (!user) return 'Guest';
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'Guest User';
  }, [user]);

  const isGuest = useMemo(() => user?.isAnonymous, [user?.isAnonymous]);

  // Enhanced animation configuration
  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
    iconRotation: prefersReducedMotion ? 'none' : 'rotate(180deg) scale(1.1)'
  }), [prefersReducedMotion]);

  return (
    <Flex
      as="header"
      role="banner"
      px={headerConfig.padding}
      py={{ xs: 2.5, sm: 3, md: 3.5, lg: 4, xl: 4.5 }}
      gap={{ xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 }}
      align="center"
      position="relative"
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

      {/* Enhanced Dynamic Header Text with Click Indicator */}
      <Flex
        align="center"
        gap={{ xs: 1.5, sm: 2, md: 2, lg: 2.5 }}
        cursor="pointer"
        onClick={handleNavigation}
        onKeyDown={handleKeyDown}
        transition={animationConfig.transition}
        userSelect="none"
        px={{ xs: 2.5, sm: 3, md: 3, lg: 3.5 }}
        py={{ xs: 1.5, sm: 2, md: 2, lg: 2.5 }}
        borderRadius={{ xs: "lg", sm: "xl", md: "xl", lg: "2xl" }}
        role="button"
        tabIndex={0}
        aria-label={headerInfo.ariaLabel}
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
        // Enhanced touch targets for mobile
        minH={{ xs: "44px", sm: "46px", md: "48px" }}
        minW={{ xs: "44px", sm: "46px", md: "48px" }}
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
        <Text
          fontSize={headerInfo.fontSize}
          fontWeight="700"
          color="#475569"
          letterSpacing={{ xs: "0.3px", sm: "0.4px", md: "0.5px" }}
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
          lineHeight="1.2"
        >
          {headerInfo.text}
        </Text>

        {/* Enhanced Switch/Recycling Icon Indicator */}
        <Icon
          as={PiArrowsClockwise}
          w={{ xs: "12px", sm: "13px", md: "14px", lg: "15px" }}
          h={{ xs: "12px", sm: "13px", md: "14px", lg: "15px" }}
          color="#94A3B8"
          transition={animationConfig.transition}
          _groupHover={{
            color: "#4F9CF9",
            transform: animationConfig.iconRotation
          }}
          _groupFocus={{
            color: "#4F9CF9"
          }}
          aria-hidden="true"
        />
      </Flex>

      {/* Enhanced Absolutely Centered Logo */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        zIndex={1}
      >
        <Tooltip
          label="Neurastack - Go to Chat"
          hasArrow
          placement="bottom"
          openDelay={500}
        >
          <Box
            as="button"
            role="button"
            tabIndex={0}
            aria-label="Neurastack logo - navigate to chat"
            onClick={() => navigate('/chat')}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/chat');
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
              <PiUserLight size={20}/>
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
    </Flex>
  );
}