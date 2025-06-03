import { memo, useState, useCallback, useMemo } from 'react';
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
import type { Message } from '../store/useChatStore';
import { formatTokenCount } from '../utils/tokenCounter';

interface OptimizedChatMessageProps {
  message: Message;
  isFirstAssistantMessage?: boolean;
  isHighlighted?: boolean;
}

// Simple message processing utilities - only basic formatting, no content manipulation
const processMessageContent = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  // Only apply basic formatting cleanup without removing any content
  return text
    // Clean up excessive whitespace while preserving intentional formatting
    .replace(/\n{4,}/g, '\n\n\n') // Limit to max 3 consecutive newlines
    .replace(/[ \t]{3,}/g, '  ') // Limit to max 2 consecutive spaces
    .trim(); // Remove leading/trailing whitespace
};

const validateMessageContent = (text: string): boolean => {
  // Allow empty text for loading states
  if (!text) return true;
  if (typeof text !== 'string') return false;
  if (text.length > 50000) return false; // Prevent extremely long messages
  return true;
};

// Memoized markdown component to prevent unnecessary re-renders
const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => <Text mb={1.5} fontSize={{ base: "sm", md: "md" }} lineHeight="1.6">{children}</Text>,
      ul: ({ children }) => <Box as="ul" pl={4} mb={1.5}>{children}</Box>,
      ol: ({ children }) => <Box as="ol" pl={4} mb={1.5}>{children}</Box>,
      li: ({ children }) => <Box as="li" mb={0.5} fontSize={{ base: "sm", md: "md" }}>{children}</Box>,
      code: ({ children, className }) => {
        const isInline = !className;
        return isInline ? (
          <Text
            as="code"
            bg={useColorModeValue('gray.100', 'gray.700')}
            px={1}
            py={0.5}
            borderRadius="sm"
            fontSize={{ base: "xs", md: "sm" }}
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
            fontSize={{ base: "xs", md: "sm" }}
            fontFamily="mono"
            mb={1.5}
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
    <Tooltip label={hasCopied ? "Copied!" : "Copy message"} hasArrow fontSize="sm">
      <IconButton
        aria-label="Copy message"
        icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />}
        size="sm"
        variant="ghost"
        onClick={onCopy}
        color={useColorModeValue('gray.400', 'gray.500')}
        _hover={{
          color: useColorModeValue('gray.600', 'gray.300'),
          bg: useColorModeValue('gray.100', 'gray.600'),
        }}
        minW={{ base: "24px", md: "32px" }}
        h={{ base: "24px", md: "32px" }}
        transition="all 0.2s ease"
      />
    </Tooltip>
  );
});

CopyButton.displayName = 'CopyButton';

export const OptimizedChatMessage = memo<OptimizedChatMessageProps>(({
  message,
  isFirstAssistantMessage: _isFirstAssistantMessage = false,
  isHighlighted = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  // Process and validate message content
  const processedContent = useMemo(() => {
    // Handle empty or loading states
    if (!message.text || message.text.trim() === '') {
      return '';
    }

    if (!validateMessageContent(message.text)) {
      return isError ? message.text : 'Invalid message content';
    }

    return processMessageContent(message.text);
  }, [message.text, isError]);

  const shouldTruncate = processedContent.length > 600; // Increased threshold for mobile

  // Enhanced color tokens for modern appearance
  const bgUser = useColorModeValue("blue.500", "blue.400");
  const bgAi = useColorModeValue("gray.50", "gray.700");
  const textAi = useColorModeValue("gray.800", "gray.100");
  const bgErr = useColorModeValue("red.50", "red.900");
  const textErr = useColorModeValue("red.800", "red.100");
  const timestampColor = useColorModeValue("gray.400", "gray.500");
  const tokenCountColor = useColorModeValue("blue.500", "blue.300");

  const bubbleBg = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const displayText = shouldTruncate && !isExpanded
    ? processedContent.slice(0, 600) + '...'
    : processedContent;

  const formatTimestamp = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Get token count from message metadata
  const tokenCount = message.metadata?.tokenCount || 0;

  return (
    <Flex
      direction="column"
      align={isUser ? "flex-end" : "flex-start"}
      gap={{ base: 1, md: 2 }}
      w="100%"
      bg={isHighlighted ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
      borderRadius="md"
      p={isHighlighted ? 2 : 0}
      transition="background-color 0.3s ease"
    >
      {/* AI Model Badge - show on all assistant messages */}
      {!isUser && !isError && (
        <HStack spacing={2} mb={{ base: 0.5, md: 1 }}>
          <Badge
            colorScheme="blue"
            variant="subtle"
            fontSize={{ base: "2xs", md: "xs" }}
            px={{ base: 1.5, md: 2 }}
            py={{ base: 0.5, md: 1 }}
            borderRadius="full"
            fontWeight="medium"
          >
            Powered by OpenAI, Gemini & Grok
          </Badge>
          {/* Token count badge for AI responses */}
          {tokenCount > 0 && (
            <Badge
              colorScheme="gray"
              variant="outline"
              fontSize={{ base: "2xs", md: "xs" }}
              px={{ base: 1.5, md: 2 }}
              py={{ base: 0.5, md: 1 }}
              borderRadius="full"
              color={tokenCountColor}
              borderColor={tokenCountColor}
            >
              {formatTokenCount(tokenCount)} tokens
            </Badge>
          )}
        </HStack>
      )}

      {/* Message Bubble */}
      <Box
        bg={bubbleBg}
        color={bubbleText}
        px={{ base: 3, md: 4 }}
        py={{ base: 2.5, md: 3 }}
        borderRadius="2xl"
        maxW={{ base: "90%", md: "80%" }}
        position="relative"
        boxShadow={useColorModeValue("sm", "md")}
        border={isUser ? "none" : "1px solid"}
        borderColor={isUser ? "transparent" : useColorModeValue("gray.200", "gray.600")}
        transition="all 0.2s ease"
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: useColorModeValue("md", "lg"),
        }}
      >
        {/* Message Content */}
        <Box>
          {isUser ? (
            <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.6" fontWeight="400">
              {displayText}
            </Text>
          ) : (
            <MemoizedMarkdown content={displayText} />
          )}
        </Box>

        {/* Expand/Collapse for long messages */}
        {shouldTruncate && (
          <Collapse in={isExpanded} animateOpacity>
            <Box mt={1.5}>
              {isUser ? (
                <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.6">
                  {processedContent.slice(600)}
                </Text>
              ) : (
                <MemoizedMarkdown content={processedContent.slice(600)} />
              )}
            </Box>
          </Collapse>
        )}

        {/* Message Actions */}
        <HStack justify="space-between" align="center" mt={{ base: 1.5, md: 2 }} spacing={2}>
          <Text
            fontSize={{ base: "2xs", md: "xs" }}
            color={isUser ? "whiteAlpha.600" : timestampColor}
            opacity={0.7}
            fontWeight="400"
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
                color={isUser ? "whiteAlpha.600" : useColorModeValue('gray.400', 'gray.500')}
                _hover={{
                  color: isUser ? "whiteAlpha.800" : useColorModeValue('gray.600', 'gray.300'),
                  bg: isUser ? "whiteAlpha.200" : useColorModeValue('gray.100', 'gray.600'),
                }}
                minW={{ base: "24px", md: "32px" }}
                h={{ base: "24px", md: "32px" }}
              />
            )}

            <CopyButton text={processedContent} />
          </HStack>
        </HStack>
      </Box>
    </Flex>
  );
});

OptimizedChatMessage.displayName = 'OptimizedChatMessage';
