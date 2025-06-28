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
    useColorModeValue,
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


  // Performance optimization: Close drawer on route change
  const prevPathname = useRef(location.pathname);
  if (prevPathname.current !== location.pathname) {
    prevPathname.current = location.pathname;
    if (isOpen) onClose();
  }

  // Determine brand text and navigation based on current page
  // const isNeuraFitPage = location.pathname === '/neurafit';
  const brandText = 'neurastack'; // Always show neurastack since NeuraFit is commented out

  // Semantic color tokens with dark-mode support
  const primaryColor = useColorModeValue('blue.500', 'blue.300');

  const headerBg = useColorModeValue(
    'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(37,99,235,0.08) 100%)',
    'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.16) 100%)'
  );
  const headerBorder = useColorModeValue(
    '1px solid rgba(59,130,246,0.1)',
    '1px solid rgba(59,130,246,0.2)'
  );


  // Navigation menu items configuration
  const navigationItems = useMemo(() => {
    // Check if current user is authorized for NeuraFit
    // const isNeuraFitAuthorized = user?.email === 'sal.scrudato@gmail.com';

    return [
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
      // {
      //   label: 'NeuraFit',
      //   path: '/neurafit',
      //   icon: PiHeartBold,
      //   disabled: !isNeuraFitAuthorized
      // }
    ];
  }, [user?.email]);



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
          borderRadius="16px"
          transition="all 0.2s ease"
          bg={isActive ? "rgba(79, 156, 249, 0.1)" : "rgba(255, 255, 255, 0.6)"}
          border={isActive ? "1px solid rgba(79, 156, 249, 0.2)" : "1px solid rgba(0, 0, 0, 0.05)"}
          opacity={isDisabled ? 0.5 : 1}
          cursor={isDisabled ? "not-allowed" : "pointer"}
          backdropFilter="blur(12px)"
          boxShadow={isActive ? "0 4px 12px rgba(79, 156, 249, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.04)"}
          _hover={isDisabled ? {} : {
            bg: isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(255, 255, 255, 0.8)",
            transform: "translateY(-2px)",
            boxShadow: isActive ? "0 8px 24px rgba(79, 156, 249, 0.2)" : "0 8px 24px rgba(0, 0, 0, 0.1)",
            borderColor: isActive ? "rgba(79, 156, 249, 0.3)" : "rgba(0, 0, 0, 0.1)"
          }}
          _focus={isDisabled ? {} : {
            outline: "none",
            boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.2)"
          }}
          _active={isDisabled ? {} : {
            transform: "translateY(-1px)"
          }}
          aria-label={`Navigate to ${item.label}`}
          aria-current={isActive ? 'page' : undefined}
          aria-disabled={isDisabled}
        >
          <HStack spacing={4} align="center">
            <Box
              w="40px"
              h="40px"
              borderRadius="12px"
              bg={isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(100, 116, 139, 0.08)"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="all 0.2s ease"
            >
              <Icon
                as={IconComponent}
                w={5}
                h={5}
                color={isDisabled ? "#94A3B8" : (isActive ? "#4F9CF9" : "#64748B")}
                transition="all 0.2s ease"
              />
            </Box>
            <VStack spacing={0} align="start" flex={1}>
              <Text
                fontSize="md"
                fontWeight={isActive ? "600" : "500"}
                color={isDisabled ? "#94A3B8" : (isActive ? "#1E293B" : "#374151")}
                textAlign="left"
                lineHeight="1.2"
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
      position="sticky"
      top={0}
      zIndex={1100}
      w="100%"
      // Blue gradient theme design
      bg={headerBg}
      backdropFilter="blur(24px)"
      borderBottom={headerBorder}
      // Modern minimal styling
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Clean shadow
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        // Mobile optimizations
        '@media (max-width: 768px)': {
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      <Flex
        align="center"
        justify="center"
        position="relative"
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
        py={0}
        h={{ base: "56px", md: "60px" }}
        minH={{ base: "56px", md: "60px" }}
      >

        {/* Blue-themed Menu Button */}
        <IconButton
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          icon={<PiListBold size={20} />}
          onClick={onOpen}
          variant="ghost"
          size="md"
          color={primaryColor}
          bg="rgba(59, 130, 246, 0.08)"
          borderRadius="10px"
          minH="36px"
          minW="36px"
          position="absolute"
          left="2.5"
          transition="all 0.2s ease"
          _hover={{
            bg: "rgba(59, 130, 246, 0.12)",
            color: "#1D4ED8",
            transform: "translateY(-1px)"
          }}
          _active={{
            transform: "translateY(0)",
            bg: "rgba(59, 130, 246, 0.16)"
          }}
          _focus={{
            outline: "none",
            boxShadow: "0 0 0 1px rgba(31, 117, 255, 0.3)"
          }}
        />

        {/* Centered Logo */}
        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <BrandLogo
            size="sm"
            variant="header"
            text={brandText}
          />
        </Box>



        {/* Clean Navigation Drawer */}
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          size="sm"
        >
          <DrawerOverlay
            bg="rgba(0, 0, 0, 0.4)"
            backdropFilter="blur(8px)"
            transition="all 0.3s ease"
          />
          <DrawerContent
            bg="linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 251, 252, 0.95) 100%)"
            backdropFilter="blur(24px)"
            borderRight="none"
            boxShadow="0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            borderRadius="0 24px 24px 0"
            maxW="320px"
          >
            <DrawerCloseButton
              color="#64748B"
              _hover={{
                color: "#374151",
                bg: "rgba(100, 116, 139, 0.08)",
                transform: "scale(1.1)"
              }}
              borderRadius="16px"
              size="lg"
              top={6}
              right={6}
              transition="all 0.2s ease"
              bg="rgba(255, 255, 255, 0.8)"
              backdropFilter="blur(12px)"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
            />

            <DrawerHeader
              borderBottomWidth="1px"
              borderColor="rgba(0, 0, 0, 0.06)"
              pb={8}
              pt={8}
              px={8}
              bg="rgba(255, 255, 255, 0.5)"
              backdropFilter="blur(16px)"
            >
              <VStack spacing={4} align="start">
                <BrandLogo
                  size="xl"
                  variant="header"
                  text={brandText}
                />
                {user && (
                  <HStack spacing={3} w="full">
                    {user?.photoURL ? (
                      <Avatar
                        size="sm"
                        src={user.photoURL}
                        name={getUserDisplayName()}
                        w="32px"
                        h="32px"
                        borderRadius="12px"
                        border="2px solid rgba(255, 255, 255, 0.8)"
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                      />
                    ) : (
                      <Box
                        w="32px"
                        h="32px"
                        borderRadius="12px"
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                      >
                        <Icon
                          as={PiUserLight}
                          w="18px"
                          h="18px"
                          color="white"
                        />
                      </Box>
                    )}
                    <VStack spacing={0} align="start" flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color="#1E293B"
                        lineHeight="1.2"
                      >
                        {getUserDisplayName()}
                      </Text>
                      {user?.email && (
                        <Text
                          fontSize="xs"
                          color="#64748B"
                          lineHeight="1.2"
                          noOfLines={1}
                        >
                          {user.email}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </DrawerHeader>

            <DrawerBody p={8} pt={6}>
              <VStack spacing={3} align="stretch">
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="#64748B"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  mb={2}
                >
                  Navigation
                </Text>
                {drawerContent}
              </VStack>
            </DrawerBody>

            <DrawerFooter
              borderTopWidth="1px"
              borderColor="rgba(0, 0, 0, 0.06)"
              pt={6}
              pb={8}
              px={8}
              bg="rgba(255, 255, 255, 0.5)"
              backdropFilter="blur(16px)"
            >
              <VStack spacing={4} w="full">
                <Button
                  leftIcon={<PiSignOutBold size={18} />}
                  onClick={handleSignOut}
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  fontWeight="600"
                  borderRadius="16px"
                  h="48px"
                  color="#EF4444"
                  bg="rgba(239, 68, 68, 0.05)"
                  border="1px solid rgba(239, 68, 68, 0.1)"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                >
                  Sign Out
                </Button>

                <Text
                  fontSize="2xs"
                  color="#94A3B8"
                  textAlign="center"
                  lineHeight="1.4"
                >
                  neurastack v5.16 • hackensack.ai
                </Text>
              </VStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
}