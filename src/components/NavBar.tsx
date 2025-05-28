import React from 'react';
import {
  Flex,
  HStack,
  IconButton,
  Link,
  Text,
  useColorMode,
  useColorModeValue,
  Box,
  VStack,
  Collapse,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import {
  HamburgerIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
  ChatIcon,
  InfoIcon,
  CheckCircleIcon,
  AtSignIcon,
} from '@chakra-ui/icons';
import InstallPromptButton from './InstallPromptButton';

const links = [
  { name: 'Chat', to: '/chat', icon: ChatIcon },
  { name: 'News', to: '/news', icon: InfoIcon },
  { name: 'Tasks', to: '/tasks', icon: CheckCircleIcon },
  { name: 'Apps', to: '/store', icon: AtSignIcon },
];

const NavLinkItem = ({ to, icon: Icon, children, onClick }: { to: string; icon: React.ElementType; children: React.ReactNode; onClick?: () => void }) => {
  return (
    <Link
      as={NavLink}
      to={to}
      px={3}
      py={2}
      rounded={'md'}
      display="flex"
      alignItems="center"
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      _activeLink={{
        fontWeight: 'bold',
        color: useColorModeValue('blue.600', 'blue.300'),
      }}
      onClick={onClick}
    >
      <Icon mr={2} />
      {children}
    </Link>
  );
};

const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} boxShadow="md" position="sticky" top="0" zIndex="1000">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box display="flex" alignItems="center">
            {/* Logo placeholder */}
            <Image src="/logo192.png" alt="Logo" boxSize="32px" mr={2} />
            <Text fontWeight="bold" fontSize="lg" userSelect="none">
              NeuraStack
            </Text>
          </Box>
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {links.map(({ name, to, icon }) => (
              <NavLinkItem key={to} to={to} icon={icon}>
                {name}
              </NavLinkItem>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          <IconButton
            size="md"
            fontSize="lg"
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            variant="ghost"
            color="current"
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          />
          <InstallPromptButton />
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }}>
          <VStack as={'nav'} spacing={4}>
            {links.map(({ name, to, icon }) => (
              <NavLinkItem key={to} to={to} icon={icon} onClick={onClose}>
                {name}
              </NavLinkItem>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default NavBar;
