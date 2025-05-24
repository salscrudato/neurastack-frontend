import {
  Box, Flex, IconButton, useColorMode, useColorModeValue, Image,
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

import logo from '../assets/icons/logo-full.svg';

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
    <Flex direction="column" h="100vh" p="0px">
      {/* header */}
      <Flex
        px={4}
        py={3}
        align="center"
        gap={4}
        bg={useColorModeValue("white", "#2c2c2e")}
        borderBottomWidth="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        boxShadow={useColorModeValue("sm", "md")}
      >
        <Image src={logo} alt="Neurastack logo" boxSize="40px" />

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
          color={useColorModeValue("gray.500", "yellow.300")}
        />

        <Box flex={1} />

        <IconButton
          aria-label="User menu (sign‑out)"
          icon={<PiUserLight size="22" />}
          onClick={handleSignOut}
          variant="ghost"
          color={useColorModeValue("gray.500", "gray.300")}
          _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
        />
      </Flex>

      {/* messages */}
      <Box flex={1} overflowY="auto" px={4} py={2} bg={useColorModeValue('gray.50', 'gray.900')}>
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