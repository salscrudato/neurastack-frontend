import {
  Box,
  HStack,
  Flex,
  Text,
  IconButton,
  Tooltip,
  useClipboard,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { useState, memo, useCallback, useMemo } from "react";

import {
  PiCopyBold,
  PiCaretDownBold,
  PiCaretUpBold,
  PiCheckBold,
} from "react-icons/pi";
import type { Message } from "../store/useChatStore";
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

// Minimal content processing - avoid breaking markdown
const processContent = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove emojis
    .replace(/\n{5,}/g, '\n\n\n\n') // Only limit excessive newlines
    .replace(/[ \t]{4,}/g, '   ') // Only limit excessive spaces
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
  // Always show individual responses - removed toggle state

  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isLoading = !message.text;

  // Refined font sizing system - slightly smaller for better content density
  const fontSizes = {
    // Micro elements: very small text like timestamps
    micro: { base: "xs", md: "sm" },
    // Small elements: badges, secondary info, buttons
    small: { base: "sm", md: "md" },
    // Main content: message text, paragraphs - slightly smaller for better readability
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

  // Fixed: Show full content when expanded to prevent markdown breaking
  const displayText = shouldTruncate && !isExpanded
    ? getTruncatedText(processedContent, 600) + '...'
    : processedContent; // Always show full content when expanded or for short messages

  // Model responses hook
  const {
    selectedModel,
    isModalOpen,
    openModelModal,
    closeModal,
    getAvailableModels
  } = useModelResponses(
    message.metadata?.individualResponses,
    message.metadata?.modelsUsed,
    message.metadata?.fallbackReasons
  );

  const availableModels = getAvailableModels();
  const hasIndividualResponses = availableModels.length > 0;

  // Enhanced modern color scheme - optimized for readability and mobile
  const bgUser = "linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)";
  const bgAi = "#FFFFFF";
  const textAi = "#1E293B";
  const bgErr = "#FEF2F2";
  const textErr = "#DC2626";
  const timestampColor = "#94A3B8";
  const borderAi = "#E2E8F0";
  const shadowUser = "0 3px 10px rgba(79, 156, 249, 0.2)";
  const shadowAi = "0 1px 6px rgba(0, 0, 0, 0.06)";

  const bubbleBg = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  return (
    <VStack spacing={{ base: 4, md: 5 }} w="100%" align="stretch">
      {/* Enhanced Centered Timestamp with Line - Only for user messages */}
      {isUser && (
        <Flex align="center" w="100%" my={{ base: 3, md: 4 }}>
          <Box flex="1" h="1px" bg="#E2E8F0" opacity={0.6} />
          <Text
            px={{ base: 4, md: 5 }}
            fontSize={fontSizes.micro}
            color={timestampColor}
            fontWeight="600"
            bg="#FAFBFC"
            borderRadius="full"
            py={1}
          >
            {formatTimestamp(message.timestamp)}
          </Text>
          <Box flex="1" h="1px" bg="#E2E8F0" opacity={0.6} />
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
      {/* Simplified AI Model Badge and timestamp - show on all assistant messages */}
      {!isUser && !isError && (
        <HStack spacing={3} mb={2} justify="space-between" w="100%" align="center">
          <Badge
            colorScheme="blue"
            variant="subtle"
            fontSize={fontSizes.micro}
            px={3}
            py={1.5}
            borderRadius="full"
            fontWeight="600"
            bg="rgba(79, 156, 249, 0.1)"
            color="#4F9CF9"
            border="1px solid"
            borderColor="rgba(79, 156, 249, 0.2)"
          >
            Powered by OpenAI, Gemini & Grok
          </Badge>
          {/* Enhanced timestamp for AI responses */}
          <Text
            fontSize={fontSizes.micro}
            color={timestampColor}
            opacity={0.8}
            fontWeight="500"
            minW="fit-content"
          >
            {formatTimestamp(message.timestamp)}
          </Text>
        </HStack>
      )}

      {/* Message Bubble - Enhanced with modern styling and better mobile optimization */}
      <Box
        bg={bubbleBg}
        color={bubbleText}
        px={{ base: 4, md: 5 }}
        py={{ base: 3, md: 4 }}
        borderRadius="2xl"
        maxW={{ base: "95%", sm: "90%", md: "85%" }}
        minW={{ base: "40%", sm: "45%" }}
        position="relative"
        boxShadow={isUser ? shadowUser : shadowAi}
        border={isUser ? "none" : "1px solid"}
        borderColor={isUser ? "transparent" : borderAi}
        transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: isUser
            ? "0 6px 16px rgba(79, 156, 249, 0.3)"
            : "0 3px 10px rgba(0, 0, 0, 0.06)",
        }}
        // Enhanced touch targets for mobile
        sx={{
          '@media (max-width: 768px)': {
            minHeight: '44px', // Minimum touch target size
          }
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

        {/* Removed expand/collapse section since we show full content when expanded */}

        {/* Enhanced Individual Model Responses Section */}
        {!isUser && !isError && !isLoading && hasIndividualResponses && (
          <Box mt={6}>
            <ModelResponseGrid
              models={availableModels}
              onModelClick={openModelModal}
              compact={true}
            />
          </Box>
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
