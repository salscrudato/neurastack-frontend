import {
  Box,
  Button,
  HStack,
  SkeletonText,
  useColorModeValue,
  VStack,
  Text,
  OrderedList,
  UnorderedList,
  ListItem,
  IconButton,
  Tooltip,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, memo, useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { PiBookmarkBold } from "react-icons/pi";
import type { Message } from "../store/useChatStore";
import SavePromptModal from "./NeuraPrompts/SavePromptModal";
import ResponseErrorBoundary from "./ResponseErrorBoundary";
import ErrorMessage from "./ErrorMessage";

// provider logos (SVGS now next to this file) - commented out for now
// import gptLogo   from "./openai.svg";
// import gptText   from "./openai-text.svg";
// import gemLogo   from "./google.svg";
// import gemText   from "./gemini-text.svg";
// import grokLogo  from "./xai.svg";
// import grokText  from "./grok-text.svg";

const MotionBox = motion(Box);

// utility: collapse height (approx. for ~2 lines of text in sm font)
const COLLAPSED_HEIGHT = "3.5rem";

// model → { logo, label } (kept for future use)
// const logoMap: Record<
//   string,
//   { icon: string; label: string }
// > = {
//   openai: { icon: gptLogo,  label: gptText },
//   google: { icon: gemLogo,  label: gemText },
//   xai:    { icon: grokLogo, label: grokText },
// };

// Format timestamp to MMM DD HH:MM AM/PM format
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  // Add day if not today
  if (!isToday) {
    options.day = 'numeric';
  }

  return date.toLocaleString('en-US', options);
};

// Sanitize and validate message content
function sanitizeMessageContent(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove potentially harmful content while preserving markdown
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// Log message rendering for debugging (disabled to improve performance)
function logMessageRender(message: Message): void {
  // Disabled console logging to prevent performance issues
  // Only log errors or critical issues
  if (process.env.NODE_ENV === 'development' && message.role === 'error') {
    console.warn(`❌ Error Message: ${message.id}`, {
      content: message.text?.substring(0, 100) + '...',
      metadata: message.metadata
    });
  }
}

const ChatMessage = memo(function ChatMessage({ m, isFirstAssistantMessage = false }: { m: Message; isFirstAssistantMessage?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded((prev) => !prev);
  const toast = useToast();
  const { isOpen: isSavePromptOpen, onOpen: onSavePromptOpen, onClose: onSavePromptClose } = useDisclosure();

  const isUser  = m.role === "user";
  const isError = m.role === "error";
  const isLoad  = !m.text;

  // Sanitize message content
  const sanitizedContent = useMemo(() => {
    if (!m.text) return '';
    const sanitized = sanitizeMessageContent(m.text);

    // Log message rendering in development
    if (process.env.NODE_ENV === 'development' && !isLoad) {
      logMessageRender(m);
    }

    return sanitized;
  }, [m.text, m.id, isLoad]);



  const handleSavePrompt = () => {
    onSavePromptOpen();
  };

  const handlePromptSaved = () => {
    toast({
      title: "Prompt saved!",
      description: "Your prompt has been added to your library",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  /* color tokens */
  const bgUser = useColorModeValue("blue.500", "blue.400");
  const bgAi   = useColorModeValue("#f3f4f6", "gray.700");
  const textAi = useColorModeValue("gray.800", "gray.100");
  const bgErr  = useColorModeValue("yellow.100", "yellow.600");
  const textErr= useColorModeValue("yellow.800", "yellow.100");

  // filter for inverting logos in dark mode
  // const logoFilter = useColorModeValue("none", "invert(1)"); // Commented out for now

  // title styles: gradient in light, white in dark


  // Pre-compute copy button colors to avoid conditional hook calls


  const bubbleBg   = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  /* Tail pointer */
  const pointerDir = isUser ? "right" : "left";
  const pointer = pointerDir === "right"
    ? { _after:{ content:'""',pos:"absolute", right:"-6px", top:"12px",
                 borderLeft:"6px solid", borderLeftColor:bubbleBg,
                 borderY:"6px solid transparent" } }
    : { _after:{ content:'""',pos:"absolute", left:"-6px", top:"12px",
                 borderRight:"6px solid", borderRightColor:bubbleBg,
                 borderY:"6px solid transparent" } };

  return (
    <Box
      mt={1}
      w="full"
      display="flex"
      justifyContent={isUser ? "flex-end" : "flex-start"}
    >
      <MotionBox
        maxW="100%"
        px={4}
        py={3}
        borderRadius="lg"
        bg={bubbleBg}
        color={bubbleText}
        fontSize="sm"
        whiteSpace="pre-wrap"
        position="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        {...pointer}
        onClick={!isUser ? toggleExpand : undefined}
        cursor={!isUser ? "pointer" : "default"}
        _focus={{ boxShadow: "none" }}
        _active={{ bg: bubbleBg }}
        style={{ WebkitTapHighlightColor: "transparent" }}
        boxShadow={useColorModeValue('sm', 'md')}
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
      >
        <VStack align="stretch" spacing={1}>
          {!isUser && (
            <>
              <HStack justify="space-between" align="center" mb={1}>
                <Text
                  fontSize="xs"
                  color={useColorModeValue('gray.400', 'gray.500')}
                  fontFamily="Inter, system-ui, sans-serif"
                  opacity={0.8}
                >
                  {formatTimestamp(m.timestamp)}
                </Text>
              </HStack>
            </>
          )}

          {/* User message header with save prompt button */}
          {isUser && (
            <HStack justify="space-between" align="center" mb={1}>
              <Text
                fontSize="xs"
                color="whiteAlpha.600"
                fontFamily="Inter, system-ui, sans-serif"
                opacity={0.8}
              >
                {formatTimestamp(m.timestamp)}
              </Text>

              <Tooltip label="Save as prompt" hasArrow>
                <IconButton
                  aria-label="Save as prompt"
                  icon={<PiBookmarkBold />}
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSavePrompt();
                  }}
                  color="whiteAlpha.700"
                  _hover={{
                    color: "white",
                    transform: "scale(1.1)"
                  }}
                  transition="all 0.2s ease"
                />
              </Tooltip>
            </HStack>
          )}

          {!isUser && isFirstAssistantMessage && (
            <>
              {/* Consolidated model badge - show only on first assistant message */}
              <HStack justify="flex-start" align="center" mb={2}>
                <Text
                  fontSize="xs"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  px={2}
                  py={1}
                  borderRadius="full"
                  color={useColorModeValue('gray.600', 'gray.300')}
                  fontWeight="medium"
                >
                  Powered by OpenAI, Gemini & Grok
                </Text>
              </HStack>
            </>
          )}

          <Box
            maxH={expanded || isUser ? "none" : COLLAPSED_HEIGHT}
            overflow={expanded || isUser ? "visible" : "hidden"}
            position="relative"
            _after={
              !expanded && !isUser
                ? {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2rem",
                    bgGradient: "linear(to-b, rgba(255,255,255,0), " + bubbleBg + ")",
                  }
                : undefined
            }
          >
            {isLoad ? (
              <SkeletonText noOfLines={3} skeletonHeight="3" />
            ) : isError ? (
              <ErrorMessage
                message={sanitizedContent || 'An error occurred'}
                metadata={m.metadata}
                onRetry={() => {
                  // Could implement retry logic here
                  toast({
                    title: "Retry functionality",
                    description: "Please send your message again",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                  });
                }}
                showRetryButton={false} // Don't show retry for now
              />
            ) : (
              <ResponseErrorBoundary
                fallback={
                  <Box p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                    <Text fontSize="sm" color="red.600">
                      Unable to display this response safely. Content may be corrupted.
                    </Text>
                  </Box>
                }
                onError={(error, errorInfo) => {
                  console.error('ChatMessage render error:', error, errorInfo);
                  // Could send to error tracking service here
                }}
              >
                <ReactMarkdown
                  components={{
                    ol: ({ node, ...props }) => (
                      <OrderedList pl={4} spacing={1} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <UnorderedList pl={4} spacing={1} {...props} />
                    ),
                    li: ({ node, ...props }) => <ListItem {...props} />,
                  }}
                >
                  {sanitizedContent}
                </ReactMarkdown>
              </ResponseErrorBoundary>
            )}
          </Box>

          {!isUser && (
            <HStack justify="flex-end" mt={2}>
              <Button
                size="sm"
                variant="ghost"
                fontSize="xs"
                color={useColorModeValue('blue.500', 'blue.300')}
                _hover={{
                  textDecoration: 'underline',
                  bg: useColorModeValue('blue.50', 'blue.900'),
                  transform: 'scale(1.05)'
                }}
                _focus={{
                  boxShadow: '0 0 0 2px',
                  boxShadowColor: useColorModeValue('blue.500', 'blue.300')
                }}
                rightIcon={
                  <Box
                    as="span"
                    fontSize="xs"
                    transform={expanded ? "rotate(180deg)" : "rotate(0deg)"}
                    transition="transform 0.2s ease"
                    aria-hidden="true"
                  >
                    ▼
                  </Box>
                }
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleExpand();
                  }
                }}
                px={3}
                py={2}
                h="auto"
                minH="44px" // Ensure touch-friendly size
                borderRadius="md"
                transition="all 0.2s ease"
                aria-label={expanded ? "Collapse message" : "Expand message"}
                aria-expanded={expanded}
              >
                {expanded ? "Show less" : "Read more"}
              </Button>
            </HStack>
          )}
        </VStack>
      </MotionBox>

      {/* Save Prompt Modal */}
      {isUser && (
        <SavePromptModal
          isOpen={isSavePromptOpen}
          onClose={onSavePromptClose}
          onSave={handlePromptSaved}
          initialContent={m.text}
          initialTitle=""
        />
      )}
    </Box>
  );
});

export default ChatMessage;
