import {
  Avatar,
  Box,
  Button,
  Drawer, DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack, Icon,
  IconButton,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { useCallback, useMemo, useRef } from 'react';
import {
  PiChatCircleBold, PiClockCounterClockwiseBold,
  PiListBold,
  PiSignOutBold,
  PiUserLight
} from 'react-icons/pi';
import { useLocation, useNavigate } from 'react-router-dom';

import { auth } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import { BrandLogo } from './BrandLogo';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const prevPathname = useRef(location.pathname);
  if (prevPathname.current !== location.pathname) {
    prevPathname.current = location.pathname;
    if (isOpen) onClose();
  }

  const brandText = 'neurastack';

  const navigationItems = useMemo(() => {
    const items = [
      { label: 'Chat', path: '/chat', icon: PiChatCircleBold, disabled: false }
    ];

    // Only show History tab for authenticated non-guest users
    if (user && !user.isAnonymous) {
      items.push({ label: 'History', path: '/history', icon: PiClockCounterClockwiseBold, disabled: false });
    }

    return items;
  }, [user]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setUser(null);
      navigate('/');
    }
  }, [setUser, navigate]);

  const handleNavigationClick = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

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
    return 'Guest';
  }, [user]);

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
          p={3}
          borderRadius="16px"
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          bg={isActive ? "rgba(79, 156, 249, 0.08)" : "rgba(255, 255, 255, 0.6)"}
          border={isActive ? "1px solid rgba(79, 156, 249, 0.2)" : "1px solid rgba(79, 156, 249, 0.05)"}
          opacity={isDisabled ? 0.5 : 1}
          cursor={isDisabled ? "not-allowed" : "pointer"}
          sx={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          boxShadow={isActive ? "0 2px 12px rgba(79, 156, 249, 0.15), 0 4px 24px rgba(79, 156, 249, 0.06)" : "0 1px 4px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.01)"}
          _hover={isDisabled ? {} : {
            bg: isActive ? "rgba(79, 156, 249, 0.12)" : "rgba(79, 156, 249, 0.06)",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 16px rgba(79, 156, 249, 0.2), 0 8px 32px rgba(79, 156, 249, 0.08)",
            borderColor: "rgba(79, 156, 249, 0.25)"
          }}
          _focus={isDisabled ? {} : {
            outline: "none",
            boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)"
          }}
          _active={isDisabled ? {} : {
            transform: "translateY(0) scale(0.98)"
          }}
          aria-label={`Navigate to ${item.label}`}
          aria-current={isActive ? 'page' : undefined}
          aria-disabled={isDisabled}
        >
          <HStack spacing={3} align="center">
            <Box
              w="36px"
              h="36px"
              borderRadius="10px"
              bg={isActive ? "rgba(79, 156, 249, 0.12)" : "rgba(100, 116, 139, 0.06)"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="all 0.2s ease"
            >
              <Icon
                as={IconComponent}
                w={4}
                h={4}
                color={isDisabled ? "#94A3B8" : (isActive ? "#4F9CF9" : "#64748B")}
                transition="all 0.2s ease"
              />
            </Box>
            <VStack spacing={0} align="start" flex={1}>
              <Text
                fontSize="sm"
                fontWeight={isActive ? "600" : "500"}
                color={isDisabled ? "#94A3B8" : (isActive ? "#1E293B" : "#374151")}
                textAlign="left"
                lineHeight="1.3"
              >
                {item.label}
              </Text>
            </VStack>
          </HStack>
        </Box>
      );
    })
  ), [location.pathname, navigationItems, handleNavigationClick, handleMenuKeyDown]);

  return (
    <Box
      as="header"
      role="banner"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="var(--z-header)"
      w="100vw"
      h={{ base: "var(--header-height-mobile)", md: "var(--header-height-desktop)" }}
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(40px)"
      borderBottom="1px solid rgba(79, 156, 249, 0.08)"
      boxShadow="0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
      sx={{
        WebkitBackdropFilter: 'blur(40px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'auto'
      }}
    >
      <Flex
        align="center"
        justify="center"
        position="relative"
        w="100%"
        maxW={{ base: "100%", md: "1200px" }}
        mx="auto"
        px={{ base: 3, md: 4, lg: 6 }}
        py={0}
        h={{ base: "48px", md: "52px" }}
        minH={{ base: "48px", md: "52px" }}
      >
        <IconButton aria-label="Open navigation menu" aria-expanded={isOpen} aria-haspopup="menu" icon={<PiListBold size={20} />} onClick={onOpen} variant="ghost" size={{ base: "lg", md: "md" }} color="#4F9CF9" bg="rgba(255, 255, 255, 0.9)" borderRadius="16px" minH={{ base: "48px", md: "44px" }} minW={{ base: "48px", md: "44px" }} position="absolute" left={3} sx={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} border="1px solid rgba(79, 156, 249, 0.15)" boxShadow="0 4px 12px rgba(79, 156, 249, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)" transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" _hover={{ bg: "rgba(255, 255, 255, 1)", color: "#3B82F6", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(79, 156, 249, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)", borderColor: "rgba(79, 156, 249, 0.25)" }} _active={{ transform: "translateY(-1px)", bg: "rgba(255, 255, 255, 0.95)", boxShadow: "0 4px 12px rgba(79, 156, 249, 0.2), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)" }} _focus={{ outline: "none", boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.3), 0 4px 12px rgba(79, 156, 249, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)" }} />
        <Box flex="1" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
          <BrandLogo size="sm" variant="header" text={brandText} />
        </Box>
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs" closeOnOverlayClick={true} closeOnEsc={true}>
          <DrawerOverlay
            bg="rgba(0, 0, 0, 0.25)"
            backdropFilter="blur(16px)"
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            onClick={onClose}
            sx={{
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 'var(--z-drawer-overlay)'
            }}
          />
          <DrawerContent
            bg="rgba(255, 255, 255, 0.98)"
            backdropFilter="blur(32px)"
            borderRight="none"
            boxShadow="0 20px 40px -8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
            maxW="300px"
            borderRadius="0 24px 24px 0"
            sx={{
              WebkitBackdropFilter: 'blur(32px)',
              zIndex: 'var(--z-drawer-content)'
            }}
          >
            <DrawerCloseButton
              color="#64748B"
              size={{ base: "md", md: "md" }}
              minW={{ base: "40px", md: "36px" }}
              minH={{ base: "40px", md: "36px" }}
              _hover={{
                color: "#374151",
                bg: "rgba(100, 116, 139, 0.08)",
                transform: "scale(1.05)"
              }}
              _active={{
                transform: "scale(0.95)"
              }}
              _focus={{
                boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)",
                outline: "none"
              }}
              borderRadius="12px"
              top={4}
              right={4}
              transition="all 0.2s ease"
              bg="rgba(255, 255, 255, 0.8)"
              backdropFilter="blur(12px)"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
              sx={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            />
            <DrawerHeader
              borderBottomWidth="1px"
              borderColor="rgba(79, 156, 249, 0.1)"
              pb={4}
              pt={4}
              px={6}
              bg="rgba(255, 255, 255, 0.8)"
              sx={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <VStack spacing={3} align="start">
                <BrandLogo size="lg" variant="header" text={brandText} />
                {user && (
                  <HStack spacing={3} w="full">
                    {user?.photoURL ? (
                      <Avatar
                        size="sm"
                        src={user.photoURL}
                        name={getUserDisplayName()}
                        w="28px"
                        h="28px"
                        borderRadius="10px"
                        border="2px solid rgba(255, 255, 255, 0.8)"
                        boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                      />
                    ) : (
                      <Box
                        w="28px"
                        h="28px"
                        borderRadius="10px"
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                      >
                        <Icon as={PiUserLight} w="16px" h="16px" color="white" />
                      </Box>
                    )}
                    <VStack spacing={0} align="start" flex={1}>
                      <Text fontSize="sm" fontWeight="600" color="#1E293B" lineHeight="1.2">
                        {getUserDisplayName()}
                      </Text>
                      {user?.email && (
                        <Text fontSize="xs" color="#64748B" lineHeight="1.2" noOfLines={1}>
                          {user.email}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </DrawerHeader>
            <DrawerBody p={6} pt={4}>
              <VStack spacing={2} align="stretch">
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="#64748B"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  mb={1}
                >
                  Navigation
                </Text>
                {drawerContent}
              </VStack>
            </DrawerBody>
            <DrawerFooter
              borderTopWidth="1px"
              borderColor="rgba(0, 0, 0, 0.06)"
              pt={4}
              pb={6}
              px={6}
              bg="rgba(255, 255, 255, 0.5)"
              backdropFilter="blur(16px)"
            >
              <VStack spacing={3} w="full">
                <Button
                  leftIcon={<PiSignOutBold size={16} />}
                  onClick={handleSignOut}
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  fontWeight="600"
                  borderRadius="14px"
                  h="44px"
                  color="#EF4444"
                  bg="rgba(239, 68, 68, 0.05)"
                  border="1px solid rgba(239, 68, 68, 0.1)"
                  transition="all 0.2s ease"
                  sx={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  _hover={{
                    bg: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)"
                  }}
                  _active={{
                    transform: "translateY(0) scale(0.98)"
                  }}
                >
                  Sign Out
                </Button>
                <Text
                  fontSize="xs"
                  color="#94A3B8"
                  textAlign="center"
                  lineHeight="1.4"
                >
                  v5.16 • pam.hackensack.ai
                </Text>
              </VStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
}