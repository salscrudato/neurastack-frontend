import {
  Flex, Image, IconButton, Box, Text, Avatar,
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

import logo from '../assets/icons/logo.svg';

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
  const isOnAppsPage = location.pathname === '/apps' || location.pathname.startsWith('/apps/');
  const headerText = isOnAppsPage ? 'APPS' : 'CHAT';
  const headerDestination = isOnAppsPage ? '/chat' : '/apps';

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
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
    <Flex as="header" px={2} py={1} gap={4} align="center"
          bg={useColorModeValue('white','#2c2c2e')}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200','whiteAlpha.200')}
          boxShadow={useColorModeValue('sm','none')}>

      {/* Logo */}
      <Tooltip label="Neurastack" hasArrow>
        <Image
          src={logo}
          alt="neurastack"
          boxSize={{ base: "70px", md: "80px" }}
          cursor="pointer"
          onClick={() => navigate('/chat')}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        />
      </Tooltip>

      {/* Centered Dynamic Header Text with Click Indicator */}
      <Box flex="1" display="flex" justifyContent="center" alignItems="center">
        <Flex
          align="center"
          gap={2}
          cursor="pointer"
          onClick={() => navigate(headerDestination)}
          transition="all 0.2s ease"
          userSelect="none"
          px={3}
          py={2}
          borderRadius="full"
          role="group"
          _hover={{
            bg: useColorModeValue('gray.50', 'whiteAlpha.100'),
            transform: 'translateY(-1px)'
          }}
        >
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="600"
            color={useColorModeValue('gray.500', 'gray.400')}
            letterSpacing="1px"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {headerText}
          </Text>

          {/* Switch/Recycling Icon Indicator */}
          <Icon
            as={PiArrowsClockwise}
            w="14px"
            h="14px"
            color={useColorModeValue('gray.400', 'gray.500')}
            transition="all 0.2s ease"
            _groupHover={{
              color: useColorModeValue('gray.600', 'gray.300'),
              transform: 'rotate(180deg) scale(1.1)'
            }}
          />
        </Flex>
      </Box>

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