import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface MessageProps {
  from: 'user' | 'ai' | 'assistant';
  children: ReactNode;
}

export function Message({ from, children }: MessageProps) {
  const userBg = useColorModeValue('blue.500', 'blue.400');
  const aiBg = useColorModeValue('whiteAlpha.200', 'gray.700');
  const userColor = 'white';
  const aiColor = useColorModeValue('gray.800', 'gray.100');

  const bg = from === 'user' ? userBg : aiBg;
  const color = from === 'user' ? userColor : aiColor;
  const align = from === 'user' ? 'flex-end' : 'flex-start';
  const borderRadius = from === 'user'
    ? { borderTopLeftRadius: 'lg', borderTopRightRadius: 'lg', borderBottomLeftRadius: 'lg', borderBottomRightRadius: 'sm' }
    : { borderTopLeftRadius: 'lg', borderTopRightRadius: 'lg', borderBottomLeftRadius: 'sm', borderBottomRightRadius: 'lg' };

  return (
    <Flex w="100%" justify={align} my={1} px={4}>
      <Box
        maxW="80%"
        px={3}
        py={2}
        bg={bg}
        color={color}
        boxShadow="sm"
        {...borderRadius}
      >
        {children}
      </Box>
    </Flex>
  );
}
