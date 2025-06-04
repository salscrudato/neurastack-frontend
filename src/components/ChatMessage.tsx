import {
  Box,
  HStack,
  Flex,
  useColorModeValue,
  Text,
  IconButton,
  Tooltip,
  useClipboard,
  Badge,
  Collapse,
  Button,
  VStack,
} from "@chakra-ui/react";
import { useState, memo, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  PiCopyBold,
  PiCaretDownBold,
  PiCaretUpBold,
  PiCheckBold,
  PiEyeBold,
} from "react-icons/pi";
import type { Message } from "../store/useChatStore";
import { formatTokenCount } from "../utils/tokenCounter";
import { Loader } from "./LoadingSpinner";
import { useModelResponses } from "../hooks/useModelResponses";
import { ModelResponseGrid } from "./ModelResponseGrid";
import { IndividualModelModal } from "./IndividualModelModal";

interface ChatMessageProps {
  message: Message;
  isFirstAssistantMessage?: boolean;
  isHighlighted?: boolean;
}

// Simple content processing - basic cleanup only
const processContent = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/\n{4,}/g, '\n\n\n') // Limit consecutive newlines
    .replace(/[ \t]{3,}/g, '  ') // Limit consecutive spaces
    .trim();
};

// Format timestamp
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Memoized copy button
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
        minW="32px"
        h="32px"
      />
    </Tooltip>
  );
});

CopyButton.displayName = 'CopyButton';

export const ChatMessage = memo<ChatMessageProps>(({
  message,
  isFirstAssistantMessage: _isFirstAssistantMessage = false,
  isHighlighted = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [showIndividualResponses, setShowIndividualResponses] = useState(false);

  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isLoading = !message.text;

  // Process message content
  const processedContent = useMemo(() => {
    if (!message.text) return '';
    return processContent(message.text);
  }, [message.text]);

  const shouldTruncate = processedContent.length > 600;

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const displayText = shouldTruncate && !isExpanded
    ? processedContent.slice(0, 600) + '...'
    : processedContent;

  // Model responses hook
  const {
    selectedModel,
    isModalOpen,
    openModelModal,
    closeModal,
    getAvailableModels
  } = useModelResponses(
    message.metadata?.individualResponses,
    message.metadata?.ensembleMetadata,
    message.metadata?.modelsUsed,
    message.metadata?.fallbackReasons
  );

  const availableModels = getAvailableModels();
  const hasIndividualResponses = availableModels.length > 0;

  // Color scheme
  const bgUser = useColorModeValue("blue.500", "blue.400");
  const bgAi = useColorModeValue("gray.50", "gray.700");
  const textAi = useColorModeValue("gray.800", "gray.100");
  const bgErr = useColorModeValue("red.50", "red.900");
  const textErr = useColorModeValue("red.800", "red.100");
  const timestampColor = useColorModeValue("gray.400", "gray.500");
  const tokenCountColor = useColorModeValue("blue.500", "blue.300");

  const bubbleBg = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  // Get token count from message metadata
  const tokenCount = message.metadata?.tokenCount || 0;

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
      {/* AI Model Badge - show on all assistant messages */}
      {!isUser && !isError && (
        <HStack spacing={2} mb={1}>
          <Badge
            colorScheme="blue"
            variant="subtle"
            fontSize="xs"
            px={2}
            py={1}
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
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
              color={tokenCountColor}
              borderColor={tokenCountColor}
            >
              {formatTokenCount(tokenCount)} tokens
            </Badge>
          )}
        </HStack>
      )}

      {/* Message Bubble - Made wider for better mobile experience */}
      <Box
        bg={bubbleBg}
        color={bubbleText}
        px={4}
        py={3}
        borderRadius="2xl"
        maxW={{ base: "92%", sm: "88%", md: "85%" }} // Wider on mobile, slightly narrower on larger screens
        minW={{ base: "60%", sm: "50%" }} // Ensure minimum width
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
          {isLoading ? (
            <Loader variant="skeleton" lines={2} />
          ) : isError ? (
            <Text fontSize="sm" color={textErr}>
              {processedContent || 'An error occurred'}
            </Text>
          ) : isUser ? (
            <Text fontSize="md" lineHeight="1.6" fontWeight="400">
              {displayText}
            </Text>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <Text mb={1.5} fontSize="md" lineHeight="1.6">{children}</Text>,
                ul: ({ children }) => <Box as="ul" pl={4} mb={1.5}>{children}</Box>,
                ol: ({ children }) => <Box as="ol" pl={4} mb={1.5}>{children}</Box>,
                li: ({ children }) => <Box as="li" mb={0.5} fontSize="md">{children}</Box>,
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
                      mb={1.5}
                    >
                      <Text as="code">{children}</Text>
                    </Box>
                  );
                },
              }}
            >
              {displayText}
            </ReactMarkdown>
          )}
        </Box>

        {/* Expand/Collapse for long messages */}
        {shouldTruncate && (
          <Collapse in={isExpanded} animateOpacity>
            <Box mt={1.5}>
              {isUser ? (
                <Text fontSize="md" lineHeight="1.6">
                  {processedContent.slice(600)}
                </Text>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <Text mb={1.5} fontSize="md" lineHeight="1.6">{children}</Text>,
                  }}
                >
                  {processedContent.slice(600)}
                </ReactMarkdown>
              )}
            </Box>
          </Collapse>
        )}

        {/* Individual Model Responses Section */}
        {!isUser && !isError && !isLoading && hasIndividualResponses && (
          <VStack spacing={3} mt={4} align="stretch">
            {/* Show Individual Responses Button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PiEyeBold />}
              onClick={() => setShowIndividualResponses(!showIndividualResponses)}
              color={useColorModeValue('blue.600', 'blue.300')}
              _hover={{
                bg: useColorModeValue('blue.50', 'blue.900'),
              }}
              justifyContent="flex-start"
              fontWeight="medium"
            >
              {showIndividualResponses ? 'Hide' : 'Show'} Individual AI Responses ({availableModels.length})
            </Button>

            {/* Individual Responses Grid */}
            <Collapse in={showIndividualResponses} animateOpacity>
              <Box>
                <ModelResponseGrid
                  models={availableModels}
                  onModelClick={openModelModal}
                  compact={true}
                />
              </Box>
            </Collapse>
          </VStack>
        )}

        {/* Message Actions */}
        <HStack justify="space-between" align="center" mt={2} spacing={2}>
          <Text
            fontSize="xs"
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
                minW="32px"
                h="32px"
              />
            )}

            <CopyButton text={processedContent} />
          </HStack>
        </HStack>
      </Box>

      {/* Individual Model Response Modal */}
      <IndividualModelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        modelData={selectedModel}
      />
    </Flex>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
