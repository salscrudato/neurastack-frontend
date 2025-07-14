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
  useToast,
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

  const toast = useToast();

  const prevPathname = useRef(location.pathname);
  if (prevPathname.current !== location.pathname) {
    prevPathname.current = location.pathname;
    if (isOpen) onClose();
  }

  const brandText = 'neurastack';

  const navigationItems = useMemo(() => [
    { label: 'Chat', path: '/chat', icon: PiChatCircleBold, disabled: false },
    { label: 'History', path: '/history', icon: PiClockCounterClockwiseBold, disabled: false }
  ], []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out successfully", status: "success", duration: 2000, isClosable: true });
    } catch {
      toast({ title: "Sign out failed", description: "Please try again", status: "error", duration: 3000, isClosable: true });
    } finally {
      setUser(null);
      navigate('/');
    }
  }, [toast, setUser, navigate]);

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
    return 'Guest User';
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
          p={4}
          borderRadius="18px"
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          bg={isActive ? "rgba(79, 156, 249, 0.12)" : "rgba(255, 255, 255, 0.8)"}
          border={isActive ? "1px solid rgba(79, 156, 249, 0.25)" : "1px solid rgba(79, 156, 249, 0.08)"}
          opacity={isDisabled ? 0.5 : 1}
          cursor={isDisabled ? "not-allowed" : "pointer"}
          sx={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          boxShadow={isActive ? "0 4px 16px rgba(79, 156, 249, 0.2), 0 8px 32px rgba(79, 156, 249, 0.08)" : "0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.02)"}
          _hover={isDisabled ? {} : { bg: isActive ? "rgba(79, 156, 249, 0.18)" : "rgba(79, 156, 249, 0.12)", transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(79, 156, 249, 0.25), 0 12px 40px rgba(79, 156, 249, 0.1)", borderColor: "rgba(79, 156, 249, 0.35)" }}
          _focus={isDisabled ? {} : { outline: "none", boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.2)" }}
          _active={isDisabled ? {} : { transform: "translateY(-1px)" }}
          aria-label={`Navigate to ${item.label}`}
          aria-current={isActive ? 'page' : undefined}
          aria-disabled={isDisabled}
        >
          <HStack spacing={4} align="center">
            <Box w="40px" h="40px" borderRadius="12px" bg={isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(100, 116, 139, 0.08)"} display="flex" alignItems="center" justifyContent="center" transition="all 0.2s ease">
              <Icon as={IconComponent} w={5} h={5} color={isDisabled ? "#94A3B8" : (isActive ? "#4F9CF9" : "#64748B")} transition="all 0.2s ease" />
            </Box>
            <VStack spacing={0} align="start" flex={1}>
              <Text fontSize="md" fontWeight={isActive ? "600" : "500"} color={isDisabled ? "#94A3B8" : (isActive ? "#1E293B" : "#374151")} textAlign="left" lineHeight="1.2">{item.label}</Text>
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
      zIndex={1001}
      w="100%"
      h={{ base: "calc(56px + env(safe-area-inset-top, 0px))", md: "60px" }}
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(40px)"
      borderBottom="1px solid rgba(79, 156, 249, 0.08)"
      boxShadow="0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
      sx={{
        WebkitBackdropFilter: 'blur(40px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        '@media (max-width: 768px)': {
          position: 'fixed !important',
          top: '0 !important',
          zIndex: 1001,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'auto'
        }
      }}
    >
      <Flex
        align="center"
        justify="center"
        position="relative"
        w="100%"
        maxW={{ base: "100%", md: "1200px" }}
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
        py={0}
        h={{ base: "56px", md: "60px" }}
        minH={{ base: "56px", md: "60px" }}
      >
        <IconButton aria-label="Open navigation menu" aria-expanded={isOpen} aria-haspopup="menu" icon={<PiListBold size={20} />} onClick={onOpen} variant="ghost" size={{ base: "lg", md: "md" }} color="#4F9CF9" bg="rgba(255, 255, 255, 0.9)" borderRadius="16px" minH={{ base: "48px", md: "44px" }} minW={{ base: "48px", md: "44px" }} position="absolute" left={3} sx={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} border="1px solid rgba(79, 156, 249, 0.15)" boxShadow="0 4px 12px rgba(79, 156, 249, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)" transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" _hover={{ bg: "rgba(255, 255, 255, 1)", color: "#3B82F6", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(79, 156, 249, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)", borderColor: "rgba(79, 156, 249, 0.25)" }} _active={{ transform: "translateY(-1px)", bg: "rgba(255, 255, 255, 0.95)", boxShadow: "0 4px 12px rgba(79, 156, 249, 0.2), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)" }} _focus={{ outline: "none", boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.3), 0 4px 12px rgba(79, 156, 249, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)" }} />
        <Box flex="1" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
          <BrandLogo size="sm" variant="header" text={brandText} />
        </Box>
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs" closeOnOverlayClick={true} closeOnEsc={true}>
          <DrawerOverlay bg="rgba(0, 0, 0, 0.25)" backdropFilter="blur(16px)" transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" onClick={onClose} sx={{ WebkitBackdropFilter: 'blur(16px)' }} />
          <DrawerContent bg="rgba(255, 255, 255, 0.98)" backdropFilter="blur(32px)" borderRight="none" boxShadow="0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)" maxW="320px" mt={{ base: "56px", md: "60px" }} borderRadius="0 28px 28px 0" sx={{ WebkitBackdropFilter: 'blur(32px)' }}>
            <DrawerCloseButton color="#64748B" size={{ base: "lg", md: "lg" }} minW={{ base: "44px", md: "40px" }} minH={{ base: "44px", md: "40px" }} _hover={{ color: "#374151", bg: "rgba(100, 116, 139, 0.08)", transform: "scale(1.05)" }} _active={{ transform: "scale(0.95)" }} _focus={{ boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)", outline: "none" }} borderRadius="16px" top={6} right={6} transition="all 0.2s ease" bg="rgba(255, 255, 255, 0.8)" backdropFilter="blur(12px)" boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)" sx={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} />
            <DrawerHeader borderBottomWidth="1px" borderColor="rgba(79, 156, 249, 0.1)" pb={8} pt={8} px={8} bg="rgba(255, 255, 255, 0.8)" sx={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <VStack spacing={4} align="start">
                <BrandLogo size="xl" variant="header" text={brandText} />
                {user && (
                  <HStack spacing={3} w="full">
                    {user?.photoURL ? <Avatar size="sm" src={user.photoURL} name={getUserDisplayName()} w="32px" h="32px" borderRadius="12px" border="2px solid rgba(255, 255, 255, 0.8)" boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)" /> : <Box w="32px" h="32px" borderRadius="12px" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center" boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"><Icon as={PiUserLight} w="18px" h="18px" color="white" /></Box>}
                    <VStack spacing={0} align="start" flex={1}>
                      <Text fontSize="sm" fontWeight="600" color="#1E293B" lineHeight="1.2">{getUserDisplayName()}</Text>
                      {user?.email && <Text fontSize="xs" color="#64748B" lineHeight="1.2" noOfLines={1}>{user.email}</Text>}
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </DrawerHeader>
            <DrawerBody p={8} pt={6}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="xs" fontWeight="600" color="#64748B" textTransform="uppercase" letterSpacing="0.05em" mb={2}>Navigation</Text>
                {drawerContent}
              </VStack>
            </DrawerBody>
            <DrawerFooter borderTopWidth="1px" borderColor="rgba(0, 0, 0, 0.06)" pt={6} pb={8} px={8} bg="rgba(255, 255, 255, 0.5)" backdropFilter="blur(16px)">
              <VStack spacing={4} w="full">
                <Button leftIcon={<PiSignOutBold size={18} />} onClick={handleSignOut} variant="ghost" w="full" justifyContent="flex-start" fontWeight="600" borderRadius="16px" h="48px" color="#EF4444" bg="rgba(239, 68, 68, 0.05)" border="1px solid rgba(239, 68, 68, 0.1)" transition="all 0.2s ease" _hover={{ bg: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)" }} _active={{ transform: "translateY(0)" }}>Sign Out</Button>
                <Text fontSize="2xs" color="#94A3B8" textAlign="center" lineHeight="1.4">neurastack v5.16 • hackensack.ai</Text>
              </VStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
}