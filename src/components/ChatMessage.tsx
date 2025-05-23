import ReactMarkdown from 'react-markdown';
import { Box, useColorModeValue } from '@chakra-ui/react';
import type { Message } from '../store/useChatStore';

export default function ChatMessage({ m }: { m: Message }) {
  const isUser = m.role === 'user';
  const bg     = useColorModeValue(isUser ? 'blue.500' : 'gray.50', isUser ? 'blue.400' : 'gray.700');
  const color  = isUser ? 'white' : undefined;

  return (
    <Box w="full" display="flex" justifyContent={isUser ? 'flex-end' : 'flex-start'}>
      <Box
        maxW="75%"
        my={2}
        px={4}
        py={3}
        borderRadius="lg"
        bg={bg}
        color={color}
        fontSize="sm"
        whiteSpace="pre-wrap"
      >
        <ReactMarkdown>{m.text}</ReactMarkdown>
      </Box>
    </Box>
  );
}