import {
  Box, Flex, IconButton, useColorMode, useColorModeValue,
  Image, Text, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useNavigate } from 'react-router-dom';
import { PiUserLight } from 'react-icons/pi';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';

import logo from '../assets/icons/logo.svg';

export function ChatPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const msgs = useChatStore(s => s.messages);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);

  const handleSignOut = async () => {
    try { await signOut(auth); } catch { /* ignore for guest */ }
    setUser(null);
    navigate('/');
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); });

  return (
    <Flex
      direction="column"
      h="100vh"
      p="0px"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      {/* header */}
      <Flex
        px={2}
        py={1}
        align="center"
        gap={4}
        bg={useColorModeValue("white", "#2c2c2e")}
        borderBottomWidth="1px"
        borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
        boxShadow={useColorModeValue("sm", "none")}
      >
        <Image
          src={logo}
          alt="Neurastack logo"
          boxSize="60px"
        />

        <IconButton
          aria-label="Toggle theme"
          onClick={toggleColorMode}
          variant="ghost"
          icon={
            colorMode === "light" ? (
              <MoonIcon boxSize={6} />
            ) : (
              <SunIcon boxSize={6} />
            )
          }
          color={useColorModeValue("gray.500", "white")}
        />

        <Box flex={1} />

        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Account menu"
            icon={<PiUserLight size="22" />}
            variant="ghost"
            color={useColorModeValue("gray.500", "white")}
            _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
          />
          <MenuList>
            <MenuItem
              isDisabled
              color={useColorModeValue('gray.600', 'gray.300')}
              _disabled={{ opacity: 1, cursor: 'not-allowed' }}
            >
              Profile (coming soon)
            </MenuItem>
            <MenuItem
              onClick={handleSignOut}
              color={useColorModeValue('gray.700', 'gray.100')}
              _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.100') }}
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* hero prompt */}
      {msgs.length === 0 && (
        <Flex
          flex={1}
          align="center"
          justify="center"
          px={6}
          pb={{ base: 24, md: 0 }}   /* avoid overlap with input on mobile */
        >
          <Box textAlign="center">
            <Text
              fontSize="2xl"
              lineHeight="short"
              fontWeight="semibold"
              color={useColorModeValue("gray.600", "gray.300")}
            >
              What do you want to know?
            </Text>
            <Text
              mt={2}
              fontSize="2xl"
              color={useColorModeValue("gray.600", "gray.300")}
              fontWeight="normal"
            >
              Our team is happy to assist you...
            </Text>
          </Box>
        </Flex>
      )}

      {/* messages */}
      <Box
        flex="1 1 0"
        overflowY="auto"
        px={4}
        py={2}
        bg={useColorModeValue("gray.50", "gray.900")}
      >
        <Flex direction="column" align="stretch" gap={0}>
          {msgs.map(m => <ChatMessage key={m.id} m={m} />)}
          <div ref={bottomRef} />
        </Flex>
      </Box>

      {/* input */}
      <ChatInput />
    </Flex>
  );
}