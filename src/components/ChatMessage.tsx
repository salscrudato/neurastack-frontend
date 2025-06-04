import {
  Box,
  HStack,
  Flex,
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
import { EnhancedAIResponse } from "./EnhancedAIResponse";
import { AIResponseFormatter } from "./AIResponseFormatter";

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
    <Tooltip label={hasCopied ? "Copied!" : "Copy message"} hasArrow fontSize="xs">
      <IconButton
        aria-label="Copy message"
        icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />}
        size="sm"
        variant="ghost"
        onClick={onCopy}
        color="#94A3B8"
        _hover={{
          color: "#475569",
          bg: "#F8FAFC",
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

  // Consistent font sizing system
  const fontSizes = {
    // Micro elements: very small text like timestamps
    micro: { base: "2xs", md: "xs" },
    // Small elements: badges, secondary info, buttons
    small: { base: "xs", md: "sm" },
    // Main content: message text, paragraphs
    content: { base: "sm", md: "md" },
    // Code elements: inline code, code blocks
    code: { base: "xs", md: "sm" }
  };

  // Process message content
  const processedContent = useMemo(() => {
    if (!message.text) return '';
    return processContent(message.text);
  }, [message.text]);

  // Try to parse AI response as structured data
  const parseAIResponse = (content: string) => {
    try {
      // Check if content looks like JSON
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        return JSON.parse(content);
      }
      return null;
    } catch {
      return null;
    }
  };

  const structuredResponse = !isUser && !isError ? parseAIResponse(processedContent) : null;

  const shouldTruncate = processedContent.length > 600;

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Smart truncation that respects word boundaries
  const getTruncatedText = useCallback((text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;

    // Find the last space before the max length
    const truncated = text.slice(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    // If we found a space and it's not too far back (at least 80% of maxLength)
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.slice(0, lastSpaceIndex);
    }

    // Otherwise, just truncate at maxLength
    return truncated;
  }, []);

  // Fix duplication bug: when expanded, only show first part in main section
  const displayText = shouldTruncate && !isExpanded
    ? getTruncatedText(processedContent, 600) + '...'
    : shouldTruncate && isExpanded
    ? getTruncatedText(processedContent, 600) // Only show first 600 chars in main section when expanded
    : processedContent; // Show full content for short messages

  // Get the remaining text for the expanded section
  const remainingText = shouldTruncate
    ? processedContent.slice(getTruncatedText(processedContent, 600).length)
    : '';

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

  // Modern color scheme - light mode only
  const bgUser = "linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)";
  const bgAi = "#F8FAFC";
  const textAi = "#1E293B";
  const bgErr = "#FEF2F2";
  const textErr = "#DC2626";
  const timestampColor = "#94A3B8";
  const tokenCountColor = "#4F9CF9";
  const borderAi = "#E2E8F0";
  const shadowUser = "0 4px 12px rgba(79, 156, 249, 0.25)";
  const shadowAi = "0 2px 8px rgba(0, 0, 0, 0.04)";

  const bubbleBg = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  // Get token count from message metadata
  const tokenCount = message.metadata?.tokenCount || 0;

  return (
    <VStack spacing={3} w="100%" align="stretch">
      {/* Centered Timestamp with Line - Only for user messages */}
      {isUser && (
        <Flex align="center" w="100%" my={2}>
          <Box flex="1" h="1px" bg="#E2E8F0" />
          <Text
            px={3}
            fontSize={fontSizes.micro}
            color={timestampColor}
            fontWeight="500"
          >
            {formatTimestamp(message.timestamp)}
          </Text>
          <Box flex="1" h="1px" bg="#E2E8F0" />
        </Flex>
      )}

      {/* Message Container */}
      <Flex
        direction="column"
        align={isUser ? "flex-end" : "flex-start"}
        w="100%"
        bg={isHighlighted ? 'rgba(79, 156, 249, 0.05)' : 'transparent'}
        borderRadius="xl"
        p={isHighlighted ? 3 : 0}
        transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
      >
      {/* AI Model Badge and timestamp - show on all assistant messages */}
      {!isUser && !isError && (
        <HStack spacing={2} mb={1} justify="space-between" w="100%">
          <HStack spacing={2}>
            <Badge
              colorScheme="blue"
              variant="subtle"
              fontSize={fontSizes.micro}
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
                fontSize={fontSizes.micro}
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
          {/* Simple timestamp for AI responses */}
          <Text
            fontSize={fontSizes.micro}
            color={timestampColor}
            opacity={0.7}
            fontWeight="400"
          >
            {formatTimestamp(message.timestamp)}
          </Text>
        </HStack>
      )}

      {/* Message Bubble - Enhanced with modern styling */}
      <Box
        bg={bubbleBg}
        color={bubbleText}
        px={5}
        py={4}
        borderRadius="2xl"
        maxW={{ base: "92%", sm: "88%", md: "85%" }}
        minW={{ base: "60%", sm: "50%" }}
        position="relative"
        boxShadow={isUser ? shadowUser : shadowAi}
        border={isUser ? "none" : "1px solid"}
        borderColor={isUser ? "transparent" : borderAi}
        transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: isUser
            ? "0 8px 20px rgba(79, 156, 249, 0.35)"
            : "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Message Content */}
        <Box>
          {isLoading ? (
            <Loader variant="skeleton" lines={2} />
          ) : isError ? (
            <Text fontSize={fontSizes.content} color={textErr}>
              {processedContent || 'An error occurred'}
            </Text>
          ) : isUser ? (
            <Text fontSize={fontSizes.content} lineHeight="1.5" fontWeight="400">
              {displayText}
            </Text>
          ) : structuredResponse ? (
            <EnhancedAIResponse
              data={structuredResponse}
              fontSize={{
                content: fontSizes.content as any,
                heading: { base: "md", md: "lg" } as any,
                code: fontSizes.code as any,
                small: fontSizes.small as any,
              }}
            />
          ) : (
            <AIResponseFormatter
              content={displayText}
              fontSize={{
                content: fontSizes.content as any,
                heading: { base: "md", md: "lg" } as any,
                code: fontSizes.code as any,
                small: fontSizes.small as any,
              }}
            />
          )}
        </Box>

        {/* Expand/Collapse for long messages */}
        {shouldTruncate && (
          <Collapse in={isExpanded} animateOpacity>
            <Box mt={1.5}>
              {isUser ? (
                <Text fontSize={fontSizes.content} lineHeight="1.5">
                  {remainingText}
                </Text>
              ) : (
                <AIResponseFormatter
                  content={remainingText}
                  fontSize={{
                    content: fontSizes.content as any,
                    heading: { base: "md", md: "lg" } as any,
                    code: fontSizes.code as any,
                    small: fontSizes.small as any,
                  }}
                />
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
              color="#4F9CF9"
              _hover={{
                bg: "rgba(79, 156, 249, 0.05)",
              }}
              justifyContent="flex-start"
              fontWeight="medium"
              fontSize={fontSizes.small}
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

        {/* Message Actions - Only show for AI messages or expandable user messages */}
        {(!isUser || shouldTruncate) && (
          <HStack justify="flex-end" align="center" mt={2} spacing={1}>
            {shouldTruncate && (
              <IconButton
                aria-label={isExpanded ? "Show less" : "Show more"}
                icon={isExpanded ? <PiCaretUpBold /> : <PiCaretDownBold />}
                size="sm"
                variant="ghost"
                onClick={toggleExpanded}
                color={isUser ? "rgba(255, 255, 255, 0.6)" : "#94A3B8"}
                _hover={{
                  color: isUser ? "rgba(255, 255, 255, 0.8)" : "#475569",
                  bg: isUser ? "rgba(255, 255, 255, 0.2)" : "#F8FAFC",
                }}
                minW="32px"
                h="32px"
              />
            )}

            {/* Only show copy button for AI messages */}
            {!isUser && <CopyButton text={processedContent} />}
          </HStack>
        )}
      </Box>
      </Flex>

      {/* Individual Model Response Modal */}
      <IndividualModelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        modelData={selectedModel}
      />
    </VStack>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
