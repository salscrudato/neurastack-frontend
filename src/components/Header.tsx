import {
  Flex, IconButton, Box, Text, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  useToast, Tooltip,
  HStack, Icon, Badge, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton
} from '@chakra-ui/react';
import { PiUserLight, PiHouseLight, PiSignOutBold, PiUserCircleBold, PiArrowsClockwise, PiDownloadBold, PiDatabase, PiGear } from 'react-icons/pi';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { BrandLogo } from './BrandLogo';
import { useManualUpdateCheck } from './UpdateNotification';
import { forceRefresh } from '../utils/updateManager';
import { MemoryVerification } from './MemoryVerification';
import { CacheManager } from './CacheManager';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);

  // Chat store for memory/cache management
  const sessionId = useChatStore(s => s.sessionId);

  const toast = useToast();
  const { checkForUpdates, isChecking } = useManualUpdateCheck();

  // Modal controls for cache management
  const {
    isOpen: isMemoryOpen,
    onOpen: onMemoryOpen,
    onClose: onMemoryClose
  } = useDisclosure();

  const {
    isOpen: isCacheOpen,
    onOpen: onCacheOpen,
    onClose: onCacheClose
  } = useDisclosure();

  // Modern color values - light mode only
  const gray = '#64748B';
  const grayHover = '#475569';
  const menuBg = '#FFFFFF';
  const menuBorder = '#E2E8F0';
  const hoverBg = '#F8FAFC';

  // Determine header text and navigation based on current route
  const getHeaderInfo = () => {
    const path = location.pathname;

    if (path === '/chat') {
      return { text: 'CHAT', destination: '/apps', fontSize: { base: "md", md: "lg" } };
    } else if (path === '/apps') {
      return { text: 'APPS', destination: '/chat', fontSize: { base: "md", md: "lg" } };
    } else if (path.startsWith('/apps/neuratask')) {
      return { text: 'neuratask', destination: '/apps', fontSize: { base: "sm", md: "md" } };
    } else if (path.startsWith('/apps/neurafit')) {
      return { text: 'neurafit', destination: '/apps', fontSize: { base: "sm", md: "md" } };
    } else if (path.startsWith('/apps/')) {
      // For other apps, extract app name from path
      const appName = path.split('/')[2];
      return { text: appName, destination: '/apps', fontSize: { base: "sm", md: "md" } };
    } else {
      return { text: 'CHAT', destination: '/apps', fontSize: { base: "md", md: "lg" } };
    }
  };

  const headerInfo = getHeaderInfo();

  const handleSignOut = async () => {
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
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'Guest User';
  };

  const isGuest = user?.isAnonymous;

  const handleUpdateCheck = async () => {
    try {
      await checkForUpdates();
      toast({
        title: "Update Check Complete",
        description: "Checked for latest version",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Update Check Failed",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleForceRefresh = () => {
    toast({
      title: "Refreshing App",
      description: "Clearing cache and reloading...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => forceRefresh(), 1000);
  };

  return (
    <Flex
      as="header"
      px={{ base: 4, md: 6, lg: 8 }}
      py={{ base: 3, md: 4 }}
      gap={3}
      align="center"
      position="relative"
      w="100%"
      minH={{ base: "60px", md: "64px" }}
    >

      {/* Dynamic Header Text with Click Indicator - positioned on left */}
      <Flex
        align="center"
        gap={2}
        cursor="pointer"
        onClick={() => navigate(headerInfo.destination)}
        transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
        userSelect="none"
        px={3}
        py={2}
        borderRadius="xl"
        role="group"
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
        _hover={{
          bg: "rgba(255, 255, 255, 0.95)",
          transform: 'translateY(-1px)',
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }}
      >
        <Text
          fontSize={headerInfo.fontSize}
          fontWeight="700"
          color="#475569"
          letterSpacing="0.5px"
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
        >
          {headerInfo.text}
        </Text>

        {/* Switch/Recycling Icon Indicator */}
        <Icon
          as={PiArrowsClockwise}
          w="14px"
          h="14px"
          color="#94A3B8"
          transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
          _groupHover={{
            color: "#4F9CF9",
            transform: 'rotate(180deg) scale(1.1)'
          }}
        />
      </Flex>

      {/* Absolutely Centered Logo - independent of left/right content */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        zIndex={1}
      >
        <Tooltip label="Neurastack" hasArrow>
          <BrandLogo
            size={{ base: "md", md: "lg" }}
            variant="header"
            cursor="pointer"
            onClick={() => navigate('/chat')}
            _hover={{
              transform: "scale(1.05)",
              opacity: 0.8
            }}
          />
        </Tooltip>
      </Box>

      {/* Spacer to balance the layout */}
      <Box flex="1" />

      {/* User menu */}
      <Menu>
        <Tooltip label="Account menu" hasArrow>
          <MenuButton as={IconButton}
            aria-label="Account menu"
            variant="ghost"
            color="#64748B"
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            borderRadius="xl"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            _hover={{
              bg: "rgba(255, 255, 255, 0.95)",
              transform: 'translateY(-1px)',
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
            }}>
            {user?.photoURL ? (
              <Avatar size="sm" src={user.photoURL} />
            ) : (
              <PiUserLight size={22}/>
            )}
          </MenuButton>
        </Tooltip>

        <MenuList
          bg={menuBg}
          border="1px solid"
          borderColor={menuBorder}
          borderRadius="xl"
          boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          backdropFilter="blur(10px)"
          p={2}
        >
          {/* User info */}
          <MenuItem isDisabled>
            <HStack>
              <PiUserCircleBold />
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  {getUserDisplayName()}
                </Text>
                {user?.email && !isGuest && (
                  <Text fontSize="xs" color={gray}>
                    {user.email}
                  </Text>
                )}
              </Box>
            </HStack>
          </MenuItem>

          <MenuDivider />

          <MenuItem
            onClick={() => navigate('/apps')}
            color={grayHover}
            borderRadius="lg"
            _hover={{ bg: hoverBg }}>
            <HStack>
              <PiHouseLight />
              <Text>Dashboard</Text>
            </HStack>
          </MenuItem>

          <MenuItem
            onClick={handleUpdateCheck}
            color={grayHover}
            isDisabled={isChecking}
            borderRadius="lg"
            _hover={{ bg: hoverBg }}>
            <HStack>
              <PiDownloadBold />
              <Text>{isChecking ? 'Checking...' : 'Check for Updates'}</Text>
            </HStack>
          </MenuItem>

          <MenuItem
            onClick={handleForceRefresh}
            color={grayHover}
            borderRadius="lg"
            _hover={{ bg: hoverBg }}>
            <HStack>
              <PiArrowsClockwise />
              <Text>Force Refresh</Text>
            </HStack>
          </MenuItem>

          <MenuDivider />

          {/* Cache Management Section */}
          <MenuItem
            onClick={onMemoryOpen}
            color={grayHover}
            borderRadius="lg"
            _hover={{ bg: hoverBg }}>
            <HStack>
              <PiDatabase />
              <Box>
                <Text>Memory Verification</Text>
                <HStack spacing={1} mt={1}>
                  <Badge
                    size="xs"
                    colorScheme="green"
                    variant="subtle"
                    borderRadius="full"
                  >
                    Memory API
                  </Badge>
                  {user && (
                    <Badge
                      size="xs"
                      colorScheme="blue"
                      variant="outline"
                      borderRadius="full"
                    >
                      Session: {sessionId.slice(0, 6)}...
                    </Badge>
                  )}
                </HStack>
              </Box>
            </HStack>
          </MenuItem>

          <MenuItem
            onClick={onCacheOpen}
            color={grayHover}
            borderRadius="lg"
            _hover={{ bg: hoverBg }}>
            <HStack>
              <PiGear />
              <Text>Cache Management</Text>
            </HStack>
          </MenuItem>

          <MenuDivider />

          <MenuItem
            onClick={handleSignOut}
            color={grayHover}
            borderRadius="lg"
            _hover={{ bg: hoverBg }}>
            <HStack>
              <PiSignOutBold />
              <Text>Sign Out</Text>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Memory Verification Modal */}
      <Modal isOpen={isMemoryOpen} onClose={onMemoryClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Memory System Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <MemoryVerification />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Cache Management Modal */}
      <Modal isOpen={isCacheOpen} onClose={onCacheClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Cache Management</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <CacheManager />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}