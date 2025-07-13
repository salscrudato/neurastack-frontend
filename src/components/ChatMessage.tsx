import {
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Text,
    Tooltip,
    useClipboard,
    VStack
} from "@chakra-ui/react";
import { memo, useMemo, useState } from "react";

import {
    PiCheckBold,
    PiCopyBold
} from "react-icons/pi";
import { useModelResponses } from "../hooks/useModelResponses";
import type { Message } from "../store/useChatStore";
import { EnsembleInfoModal } from "./EnsembleInfoModal";
import { IndividualModelModal } from "./IndividualModelModal";
import { Loader } from "./LoadingSpinner";
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
        boxShadow="none" // Remove shadow
        _hover={{
          color: "#475569",
          bg: "#F8FAFC",
          boxShadow: "none", // Ensure no shadow on hover
        }}
        _focus={{
          boxShadow: "none", // Remove focus shadow
        }}
        _active={{
          boxShadow: "none", // Remove active shadow
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


  // Ensemble info modal state
  const [isEnsembleInfoOpen, setIsEnsembleInfoOpen] = useState(false);
  const onEnsembleInfoOpen = () => setIsEnsembleInfoOpen(true);
  const onEnsembleInfoClose = () => setIsEnsembleInfoOpen(false);

  // Enhanced modern color scheme - clean, minimal design
  const bgUser = "linear-gradient(135deg, #4F9CF9 0%, #3B82F6 100%)";
  const bgAi = "#FFFFFF";
  const textAi = "#1E293B";
  const bgErr = "#FEF2F2";
  const textErr = "#DC2626";
  const timestampColor = "#94A3B8";
  const borderAi = "#E2E8F0";
  const shadowUser = "0 2px 12px rgba(79, 156, 249, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)";
  const shadowAi = "0 1px 6px rgba(0, 0, 0, 0.06)";

  const bubbleBg = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  return (
    <VStack spacing={{ base: 3, md: 4 }} w="100%" align="stretch">
      {/* Centered Timestamp with Line - for all messages */}
      <Flex align="center" w="100%" my={{ base: 1, md: 2 }}>
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

      {/* Modern Message Bubble - Clean, minimal design */}
      <Box
        bg={bubbleBg}
        color={bubbleText}
        px={{ base: isUser ? 4 : 5, md: isUser ? 4.5 : 6 }}
        py={{ base: isUser ? 2.5 : 4, md: isUser ? 3 : 4.5 }}
        borderRadius={isUser ? "2xl" : "xl"}
        maxW={{ base: isUser ? "90%" : "95%", sm: isUser ? "88%" : "92%", md: isUser ? "80%" : "88%", lg: isUser ? "75%" : "85%" }}
        minW={{ base: "20%", sm: "25%", md: "30%" }}
        position="relative"
        boxShadow={isUser ? shadowUser : shadowAi}
        border={isUser ? "none" : "1px solid"}
        borderColor={isUser ? "transparent" : borderAi}
        backdropFilter={isUser ? "none" : "blur(8px)"}
        transition="all 250ms cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: isUser ? "translateY(-2px) scale(1.01)" : "translateY(-1px)",
          boxShadow: isUser
            ? "0 8px 32px rgba(79, 156, 249, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
            : "0 6px 20px rgba(0, 0, 0, 0.08)",
        }}
        sx={{
          // Enhanced user message styling with glass effects
          ...(isUser && {
            background: 'linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
              borderRadius: '2xl',
              pointerEvents: 'none'
            }
          }),
          // Enhanced AI message glass effects
          ...(!isUser && !isError && {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }),
          '@media (max-width: 768px)': {
            minHeight: '44px',
          }
        }}
      >
        {/* Enhanced AI Ensemble Info Section - Following Integration Guide */}
        {!isUser && !isError && !isLoading && message.metadata?.metadata && (
          <Box mb={4}>
            <VStack spacing={3} align="stretch">
              {/* AI Ensemble Header */}
              <Flex
                justify="space-between"
                align="center"
                p={{ base: 2, md: 3 }}
                bg="rgba(248, 250, 252, 0.6)"
                borderRadius="xl"
                border="1px solid rgba(226, 232, 240, 0.4)"
                position="relative"
                backdropFilter="blur(8px)"
              >
                <HStack spacing={2}>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="600"
                    color="#1E293B"
                    letterSpacing="-0.025em"
                  >
                    🤖 AI Ensemble Info
                  </Text>
                </HStack>
              </Flex>

              {/* Individual Model Buttons + Ensemble Details Button */}
              <HStack spacing={2} wrap="wrap" justify="flex-start">
                {availableModels.map((model) => (
                  <Button
                    key={model.model}
                    size="sm"
                    variant="outline"
                    onClick={() => openModelModal(model)}
                    borderColor="rgba(79, 156, 249, 0.3)"
                    color="#4F9CF9"
                    bg="rgba(79, 156, 249, 0.05)"
                    fontWeight="500"
                    fontSize="xs"
                    _hover={{
                      bg: "rgba(79, 156, 249, 0.1)",
                      borderColor: "rgba(79, 156, 249, 0.5)",
                      transform: "translateY(-1px)"
                    }}
                    _active={{
                      bg: "rgba(79, 156, 249, 0.15)"
                    }}
                    px={3}
                    py={1}
                    h="auto"
                    minH="32px"
                    borderRadius="lg"
                    transition="all 0.2s ease"
                  >
                    {model.provider === 'openai' ? 'GPT-4o' :
                     model.provider === 'gemini' ? 'Gemini' :
                     model.provider === 'claude' ? 'Claude' : (model.provider || 'Unknown').toUpperCase()}
                  </Button>
                ))}

                {/* Ensemble Details Button */}
                <Button
                  size="sm"
                  variant="solid"
                  onClick={onEnsembleInfoOpen}
                  bg="#4F9CF9"
                  color="white"
                  fontWeight="500"
                  fontSize="xs"
                  _hover={{
                    bg: "#3B82F6",
                    transform: "translateY(-1px)"
                  }}
                  _active={{
                    bg: "#2563EB"
                  }}
                  px={3}
                  py={1}
                  h="auto"
                  minH="32px"
                  borderRadius="lg"
                  transition="all 0.2s ease"
                  leftIcon={<Text fontSize="xs">📊</Text>}
                >
                  Details
                </Button>
              </HStack>
            </VStack>
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
              lineHeight={{ base: "1.4", md: "1.5" }}
              fontWeight="500"
              letterSpacing="0.01em"
              color="white"
              sx={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
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

      {/* Ensemble Info Modal */}
      <EnsembleInfoModal
        isOpen={isEnsembleInfoOpen}
        onClose={onEnsembleInfoClose}
        ensembleData={message.metadata?.metadata}
      />
    </VStack>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
