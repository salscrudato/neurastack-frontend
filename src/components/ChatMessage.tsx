import {
    Box,
    Flex,
    HStack,
    IconButton,
    Text,
    Tooltip,
    useClipboard,
    VStack,
} from "@chakra-ui/react";
import { memo, useMemo } from "react";

import {
    PiCheckBold,
    PiCopyBold,
} from "react-icons/pi";
import { useModelResponses } from "../hooks/useModelResponses";
import type { Message } from "../store/useChatStore";
import { IndividualModelModal } from "./IndividualModelModal";
import { Loader } from "./LoadingSpinner";
import { ModelResponseGrid } from "./ModelResponseGrid";
import { UnifiedAIResponse } from "./UnifiedAIResponse";

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

  // Always show full content - no truncation
  const displayText = processedContent;

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
    message.metadata?.fallbackReasons,
    message.metadata?.metadata // Pass full ensemble metadata
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
    <VStack spacing={{ base: 6, md: 8 }} w="100%" align="stretch">
      {/* Centered Timestamp with Line - for all messages */}
      <Flex align="center" w="100%" my={{ base: 2, md: 3 }}>
        <Box flex="1" h="1px" bg="#E2E8F0" opacity={0.4} />
        <Text
          px={{ base: 3, md: 4 }}
          fontSize={fontSizes.micro}
          color={timestampColor}
          fontWeight="500"
          bg="#FAFBFC"
          borderRadius="full"
          py={0.5}
        >
          {formatTimestamp(message.timestamp)}
        </Text>
        <Box flex="1" h="1px" bg="#E2E8F0" opacity={0.4} />
      </Flex>

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
      {/* Remove the "Powered by..." badge - no longer needed */}

      {/* Message Bubble - iMessage-style with reduced padding */}
      <Box
        bg={bubbleBg}
        color={bubbleText}
        px={{ base: 3, md: 5, lg: 6 }} // Increased desktop padding
        py={{ base: 2, md: 3, lg: 3.5 }} // Increased desktop padding
        borderRadius="2xl"
        maxW={{ base: "98%", sm: "95%", md: "80%", lg: "75%" }} // Wider on mobile for better content display
        minW={{ base: "40%", sm: "45%", md: "50%" }} // Increased minimum width for desktop
        position="relative"
        boxShadow={isUser ? shadowUser : shadowAi}
        border={isUser ? "none" : "1px solid"}
        borderColor={isUser ? "transparent" : borderAi}
        transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: isUser
            ? "0 8px 24px rgba(79, 156, 249, 0.25)" // Enhanced user message shadow
            : "0 6px 20px rgba(0, 0, 0, 0.08)", // Enhanced AI message shadow
        }}
        // Enhanced touch targets for mobile
        sx={{
          '@media (max-width: 768px)': {
            minHeight: '44px', // Minimum touch target size
          }
        }}
      >
        {/* Enhanced AI Response Header with Confidence Metrics */}
        {!isUser && !isError && !isLoading && message.metadata?.metadata && (
          <Box mb={3}>
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "start", sm: "center" }}
              gap={2}
              p={3}
              bg="linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)"
              borderRadius="lg"
              border="1px solid #E2E8F0"
            >
              {/* Provider Information */}
              <HStack spacing={2}>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="600"
                  color="#1E293B"
                  letterSpacing="-0.025em"
                >
                  {message.metadata.metadata.synthesis?.provider?.toUpperCase() || 'AI ENSEMBLE'}
                </Text>
                {message.metadata.metadata.synthesis?.model && (
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color="#64748B"
                    fontWeight="500"
                  >
                    {message.metadata.metadata.synthesis.model.toUpperCase()}
                  </Text>
                )}
              </HStack>

              {/* Confidence Metrics */}
              <HStack spacing={4} fontSize={{ base: "xs", md: "sm" }}>
                {message.metadata.metadata.confidenceAnalysis?.overallConfidence && (
                  <HStack spacing={1}>
                    <Text color="#64748B" fontWeight="500">Confidence:</Text>
                    <Text
                      color={
                        message.metadata.metadata.confidenceAnalysis.overallConfidence > 0.8
                          ? "#059669"
                          : message.metadata.metadata.confidenceAnalysis.overallConfidence > 0.6
                          ? "#D97706"
                          : "#DC2626"
                      }
                      fontWeight="600"
                    >
                      {Math.round(message.metadata.metadata.confidenceAnalysis.overallConfidence * 100)}%
                    </Text>
                  </HStack>
                )}
                {message.metadata.metadata.confidenceAnalysis?.responseConsistency && (
                  <HStack spacing={1}>
                    <Text color="#64748B" fontWeight="500">Consistency:</Text>
                    <Text
                      color={
                        message.metadata.metadata.confidenceAnalysis.responseConsistency > 0.8
                          ? "#059669"
                          : message.metadata.metadata.confidenceAnalysis.responseConsistency > 0.6
                          ? "#D97706"
                          : "#DC2626"
                      }
                      fontWeight="600"
                    >
                      {Math.round(message.metadata.metadata.confidenceAnalysis.responseConsistency * 100)}%
                    </Text>
                  </HStack>
                )}
              </HStack>
            </Flex>
          </Box>
        )}

        {/* Message Content */}
        <Box>
          {isLoading ? (
            <Loader variant="team" size="sm" />
          ) : isError ? (
            <Text fontSize={fontSizes.content} color={textErr}>
              {processedContent || 'An error occurred'}
            </Text>
          ) : isUser ? (
            <Text
              fontSize={fontSizes.content}
              lineHeight={{ base: "1.5", md: "1.6" }} // Better desktop line height
              fontWeight="400"
              letterSpacing={{ base: "normal", md: "0.01em" }} // Subtle desktop letter spacing
            >
              {displayText}
            </Text>
          ) : (
            <UnifiedAIResponse
              content={structuredResponse ? undefined : displayText}
              data={structuredResponse || undefined}
              fontSize={{
                content: fontSizes.content as any,
                heading: { base: "md", md: "lg" } as any,
                code: fontSizes.code as any,
                small: fontSizes.small as any,
              }}
            />
          )}
        </Box>



        {/* Enhanced Individual Model Responses Section */}
        {!isUser && !isError && !isLoading && hasIndividualResponses && (
          <Box mt={4}>
            <ModelResponseGrid
              models={availableModels}
              onModelClick={openModelModal}
              compact={true}
            />
          </Box>
        )}

        {/* Message Actions - Only show copy button for AI messages */}
        {!isUser && (
          <HStack justify="flex-end" align="center" mt={2} spacing={1}>
            <CopyButton text={processedContent} />
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
