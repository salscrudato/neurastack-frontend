import { memo, useState, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  useColorModeValue,
  Collapse,
  HStack,
  Badge,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import {
  PiCopyBold,
  PiCaretDownBold,
  PiCaretUpBold,
  PiCheckBold,
} from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../lib/types';

interface OptimizedChatMessageProps {
  message: Message;
  isFirstAssistantMessage?: boolean;
  isHighlighted?: boolean;
}

// Memoized markdown component to prevent unnecessary re-renders
const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => <Text mb={2}>{children}</Text>,
      ul: ({ children }) => <Box as="ul" pl={4} mb={2}>{children}</Box>,
      ol: ({ children }) => <Box as="ol" pl={4} mb={2}>{children}</Box>,
      li: ({ children }) => <Box as="li" mb={1}>{children}</Box>,
      code: ({ children, className }) => {
        const isInline = !className;
        return isInline ? (
          <Text
            as="code"
            bg={useColorModeValue('gray.100', 'gray.700')}
            px={1}
            py={0.5}
            borderRadius="sm"
            fontSize="sm"
            fontFamily="mono"
          >
            {children}
          </Text>
        ) : (
          <Box
            as="pre"
            bg={useColorModeValue('gray.50', 'gray.800')}
            p={3}
            borderRadius="md"
            overflow="auto"
            fontSize="sm"
            fontFamily="mono"
            mb={2}
          >
            <Text as="code">{children}</Text>
          </Box>
        );
      },
    }}
  >
    {content}
  </ReactMarkdown>
));

MemoizedMarkdown.displayName = 'MemoizedMarkdown';

// Memoized copy button to prevent unnecessary re-renders
const CopyButton = memo(({ text }: { text: string }) => {
  const { onCopy, hasCopied } = useClipboard(text);
  
  return (
    <Tooltip label={hasCopied ? "Copied!" : "Copy message"} hasArrow>
      <IconButton
        aria-label="Copy message"
        icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />}
        size="sm"
        variant="ghost"
        onClick={onCopy}
        color={useColorModeValue('gray.500', 'gray.400')}
        _hover={{
          color: useColorModeValue('gray.700', 'gray.200'),
          bg: useColorModeValue('gray.100', 'gray.700'),
        }}
      />
    </Tooltip>
  );
});

CopyButton.displayName = 'CopyButton';

export const OptimizedChatMessage = memo<OptimizedChatMessageProps>(({
  message,
  isFirstAssistantMessage = false,
  isHighlighted = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const shouldTruncate = message.text.length > 500;

  // Color tokens
  const bgUser = useColorModeValue("blue.500", "blue.400");
  const bgAi = useColorModeValue("#f3f4f6", "gray.700");
  const textAi = useColorModeValue("gray.800", "gray.100");
  const bgErr = useColorModeValue("yellow.100", "yellow.600");
  const textErr = useColorModeValue("yellow.800", "yellow.100");
  const timestampColor = useColorModeValue("gray.500", "gray.400");

  const bubbleBg = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const displayText = shouldTruncate && !isExpanded 
    ? message.text.slice(0, 500) + '...'
    : message.text;

  const formatTimestamp = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  return (
    <Flex
      direction="column"
      align={isUser ? "flex-end" : "flex-start"}
      gap={2}
      w="100%"
      bg={isHighlighted ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
      borderRadius="md"
      p={isHighlighted ? 2 : 0}
      transition="background-color 0.3s ease"
    >
      {/* AI Model Badge - only show on first assistant message */}
      {isFirstAssistantMessage && !isUser && !isError && (
        <HStack spacing={2} mb={1}>
          <Badge
            colorScheme="blue"
            variant="subtle"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            AI Ensemble
          </Badge>
        </HStack>
      )}

      {/* Message Bubble */}
      <Box
        bg={bubbleBg}
        color={bubbleText}
        px={4}
        py={3}
        borderRadius="2xl"
        maxW={{ base: "85%", md: "75%" }}
        position="relative"
        boxShadow="sm"
      >
        {/* Message Content */}
        <Box>
          {isUser ? (
            <Text fontSize="md" lineHeight="1.5">
              {displayText}
            </Text>
          ) : (
            <MemoizedMarkdown content={displayText} />
          )}
        </Box>

        {/* Expand/Collapse for long messages */}
        {shouldTruncate && (
          <Collapse in={isExpanded} animateOpacity>
            <Box mt={2}>
              {isUser ? (
                <Text fontSize="md" lineHeight="1.5">
                  {message.text.slice(500)}
                </Text>
              ) : (
                <MemoizedMarkdown content={message.text.slice(500)} />
              )}
            </Box>
          </Collapse>
        )}

        {/* Message Actions */}
        <HStack justify="space-between" align="center" mt={2} spacing={2}>
          <Text
            fontSize="xs"
            color={isUser ? "whiteAlpha.700" : timestampColor}
            opacity={0.8}
          >
            {formatTimestamp(message.timestamp)}
          </Text>

          <HStack spacing={1}>
            {shouldTruncate && (
              <IconButton
                aria-label={isExpanded ? "Show less" : "Show more"}
                icon={isExpanded ? <PiCaretUpBold /> : <PiCaretDownBold />}
                size="sm"
                variant="ghost"
                onClick={toggleExpanded}
                color={isUser ? "whiteAlpha.700" : useColorModeValue('gray.500', 'gray.400')}
                _hover={{
                  color: isUser ? "white" : useColorModeValue('gray.700', 'gray.200'),
                }}
              />
            )}
            
            <CopyButton text={message.text} />
          </HStack>
        </HStack>
      </Box>
    </Flex>
  );
});

OptimizedChatMessage.displayName = 'OptimizedChatMessage';
