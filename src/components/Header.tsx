import {
  Flex, IconButton, Box, Text, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  useColorMode, useColorModeValue, useToast, Tooltip,
  HStack, Icon
} from '@chakra-ui/react';
import { SunIcon, MoonIcon }   from '@chakra-ui/icons';
import { PiUserLight, PiHouseLight, PiSignOutBold, PiUserCircleBold, PiArrowsClockwise } from 'react-icons/pi';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import { BrandLogo } from './BrandLogo';

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);

  const toast = useToast();

  const gray = useColorModeValue('gray.600','gray.300');
  const grayHover = useColorModeValue('gray.700','white');

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
        transition="all 0.2s ease"
        userSelect="none"
        px={2}
        py={1}
        borderRadius="full"
        role="group"
        _hover={{
          bg: useColorModeValue('gray.50', 'whiteAlpha.100'),
          transform: 'translateY(-1px)'
        }}
      >
        <Text
          fontSize={headerInfo.fontSize}
          fontWeight="600"
          color={useColorModeValue('gray.500', 'gray.400')}
          letterSpacing="1px"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {headerInfo.text}
        </Text>

        {/* Switch/Recycling Icon Indicator */}
        <Icon
          as={PiArrowsClockwise}
          w="12px"
          h="12px"
          color={useColorModeValue('gray.400', 'gray.500')}
          transition="all 0.2s ease"
          _groupHover={{
            color: useColorModeValue('gray.600', 'gray.300'),
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
            color={useColorModeValue('gray.500','white')}
            _hover={{ bg: useColorModeValue('gray.100','whiteAlpha.100') }}>
            {user?.photoURL ? (
              <Avatar size="sm" src={user.photoURL} />
            ) : (
              <PiUserLight size={22}/>
            )}
          </MenuButton>
        </Tooltip>

        <MenuList>
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
            _hover={{ bg: useColorModeValue('gray.50','whiteAlpha.200') }}>
            <HStack>
              <PiHouseLight />
              <Text>Dashboard</Text>
            </HStack>
          </MenuItem>

          <MenuItem
            onClick={toggleColorMode}
            color={grayHover}
            _hover={{ bg: useColorModeValue('gray.50','whiteAlpha.200') }}>
            <HStack>
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              <Text>Switch to {colorMode === 'light' ? 'dark' : 'light'} mode</Text>
            </HStack>
          </MenuItem>

          <MenuDivider />

          <MenuItem
            onClick={handleSignOut}
            color={grayHover}
            _hover={{ bg: useColorModeValue('gray.50','whiteAlpha.200') }}>
            <HStack>
              <PiSignOutBold />
              <Text>Sign Out</Text>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}