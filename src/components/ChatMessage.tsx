import {
  Box,
  HStack,
  Icon,
  SkeletonText,
  useColorModeValue,
  VStack,
  Text,
  OrderedList,
  ListItem,
  IconButton,
  Tooltip,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { PiWarningBold, PiBookmarkBold } from "react-icons/pi";
import type { Message } from "../store/useChatStore";
import SavePromptModal from "./NeuraPrompts/SavePromptModal";

// provider logos (SVGS now next to this file)
import gptLogo   from "./openai.svg";
import gptText   from "./openai-text.svg";
import gemLogo   from "./google.svg";
import gemText   from "./gemini-text.svg";
import grokLogo  from "./xai.svg";
import grokText  from "./grok-text.svg";

const MotionBox = motion(Box);

// utility: collapse height (approx. for ~2 lines of text in sm font)
const COLLAPSED_HEIGHT = "3.5rem";

// model → { logo, label }
const logoMap: Record<
  string,
  { icon: string; label: string }
> = {
  openai: { icon: gptLogo,  label: gptText },
  google: { icon: gemLogo,  label: gemText },
  xai:    { icon: grokLogo, label: grokText },
};

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

const ChatMessage = memo(function ChatMessage({ m }: { m: Message }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded((prev) => !prev);
  const toast = useToast();
  const { isOpen: isSavePromptOpen, onOpen: onSavePromptOpen, onClose: onSavePromptClose } = useDisclosure();

  const isUser  = m.role === "user";
  const isError = m.role === "error";
  const isLoad  = !m.text;



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
  const logoFilter = useColorModeValue("none", "invert(1)");

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
        px={3}
        py={2}
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
      >
        <VStack align="stretch" spacing={1}>
          {!isUser && (
            <>
              <HStack justify="flex-start" align="center" mb={1}>
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontFamily="Inter, system-ui, sans-serif"
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
                fontWeight="medium"
                color="whiteAlpha.700"
                fontFamily="Inter, system-ui, sans-serif"
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

          {!isUser && (
            <>
              {/* provider badges */}
              <HStack spacing={3} mb={2} opacity={0.85}>
                {Object.entries(logoMap).map(([key, { icon, label }]) => (
                  <HStack key={key} spacing={1}>
                    <Box as="img" src={icon}  w="16px" h="16px" alt={`${key}`} filter={logoFilter} />
                    <Box as="img" src={label} w="38px" h="16px" alt={`${key}-text`} filter={logoFilter} />
                  </HStack>
                ))}
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
              <HStack>
                <Icon as={PiWarningBold} color={textErr} />
                <Box>{m.text}</Box>
              </HStack>
            ) : (
              <ReactMarkdown
                components={{
                  ol: ({ node, ...props }) => (
                    <OrderedList pl={4} spacing={1} {...props} />
                  ),
                  li: ({ node, ...props }) => <ListItem {...props} />,
                }}
              >
                {m.text}
              </ReactMarkdown>
            )}
          </Box>

          {!isUser && (
            <Text
              fontSize="xs"
              color={bubbleText}
              opacity={0.7}
              alignSelf="flex-end"
              mt={0.5}
            >
              {expanded ? "Tap to collapse ▲" : "Tap to expand ▼"}
            </Text>
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
