import {
  Box,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { Header } from '../components/Header';

export function ChatPage() {
  const msgs = useChatStore(s => s.messages);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  return (
    <Flex
      direction="column"
      h="100vh"
      p="0px"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <Header />

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
              color={useColorModeValue("gray.600", "gray.200")}
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
