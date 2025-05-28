import {
  Flex, Image, IconButton, Box,
  Menu, MenuButton, MenuList, MenuItem,
  useColorMode, useColorModeValue
} from '@chakra-ui/react';
import { SunIcon, MoonIcon }   from '@chakra-ui/icons';
import { PiUserLight, PiHouseLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import logo from '../assets/icons/logo.svg';

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate   = useNavigate();
  const setUser    = useAuthStore(s => s.setUser);

  const gray      = useColorModeValue('gray.600','gray.300');
  const grayHover = useColorModeValue('gray.700','white');

  const handleSignOut = async () => {
    try { await signOut(auth); } finally {
      setUser(null);
      navigate('/');
    }
  };

  return (
    <Flex as="header" px={2} py={1} gap={4} align="center"
          bg={useColorModeValue('white','#2c2c2e')}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200','whiteAlpha.200')}
          boxShadow={useColorModeValue('sm','none')}>
      <Image src={logo} alt="neurastack" boxSize="60px"/>

      <IconButton
        aria-label="Toggle theme"
        onClick={toggleColorMode}
        variant="ghost"
        icon={colorMode==='light' ? <MoonIcon boxSize={6}/> : <SunIcon boxSize={6}/>}
        color={useColorModeValue('gray.500','white')}
      />

      <IconButton
        aria-label="Dashboard"
        onClick={() => navigate('/apps')}
        variant="ghost"
        icon={<PiHouseLight size={22}/>}
        color={useColorModeValue('gray.500','white')}
        _hover={{ bg: useColorModeValue('gray.100','whiteAlpha.100') }}
      />

      <Box flex="1"/>

      <Menu>
        <MenuButton as={IconButton}
          aria-label="Account menu"
          icon={<PiUserLight size={22}/>}
          variant="ghost"
          color={useColorModeValue('gray.500','white')}
          _hover={{ bg: useColorModeValue('gray.100','whiteAlpha.100') }}/>
        <MenuList>
          <MenuItem isDisabled
            color={gray}
            _disabled={{ opacity:1, color:gray }}>
            Profile (coming soon)
          </MenuItem>
          <MenuItem onClick={() => navigate('/apps')}
            color={grayHover}
            _hover={{ bg: useColorModeValue('gray.50','whiteAlpha.200') }}>
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleSignOut}
            color={grayHover}
            _hover={{ bg: useColorModeValue('gray.50','whiteAlpha.200') }}>
            Sign Out
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}