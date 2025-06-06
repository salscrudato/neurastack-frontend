import {
  Box,
  IconButton,
  Textarea,
  InputGroup,
  InputRightElement,
  Text,
  HStack,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { PiArrowUpBold } from "react-icons/pi";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { estimateTokenCount, formatTokenCount, getTokenCountColor } from "../utils/tokenCounter";
import { createErrorToast } from "../utils/errorHandler";

/**
 * ChatInput – redesigned to match Grok style:
 *  ╭──────────────────────────────────────────────╮
 *  │ What do you want to know?            ○ ↑     │
 *  ╰──────────────────────────────────────────────╯
 */
export default function ChatInput() {
  const send = useChatStore((s) => s.sendMessage);
  const busy = useChatStore((s) => s.isLoading);
  const [txt, setTxt] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  // Enhanced smart suggestions for streamlined chat experience
  const placeholderSuggestions = [
    "What do you want to know?",
    "Ask me anything...",
    "How can I help you today?",
    "What's on your mind?",
    "Need help with something?",
    "Tell me about...",
    "Help me understand...",
    "Explain how to...",
    "Give me ideas for...",
    "What are the benefits of..."
  ];

  const MAX_CHARS = 4000;

  useEffect(() => {
    setCharCount(txt.length);
    setTokenCount(estimateTokenCount(txt));
  }, [txt]);

  // Cycle through placeholder suggestions
  useEffect(() => {
    if (txt.length === 0) {
      const interval = setInterval(() => {
        setCurrentPlaceholderIndex((prev) =>
          (prev + 1) % placeholderSuggestions.length
        );
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval);
    }
  }, [txt.length, placeholderSuggestions.length]);

  const handleSend = async () => {
    if (busy || !txt.trim()) return;

    if (txt.trim().length > MAX_CHARS) {
      toast({
        title: "Message too long",
        description: `Please keep your message under ${MAX_CHARS} characters.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await send(txt.trim());
      setTxt("");
      setCharCount(0);
      setTokenCount(0);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      // Use the new error handling utility
      const errorToast = createErrorToast(error, {
        component: 'ChatInput',
        action: 'sendMessage'
      });

      // Only show toast for non-Firebase errors
      if (!error || !(error instanceof Error) || !error.message.includes('Firebase')) {
        toast(errorToast);
      }
    }
  };

  const shellBg  = "#FFFFFF";
  const border   = "#CBD5E1";
  const pageBg   = "#FAFBFC";
  const btnBg    = "#F1F5F9";
  const btnHover = "#E2E8F0";

  const borderTopColor = "#E2E8F0";
  const hoverBorderColor = "#94A3B8";
  const placeholderColor = "#94A3B8";
  const textColor = "#1E293B";
  const hintTextColor = '#94A3B8';

  return (
    <Box
      w="full"
      px={{ base: 3, md: 4 }}
      py={{ base: 3, md: 4 }}
      bg={pageBg}
      borderTopWidth="1px"
      borderColor={borderTopColor}
    >
      <InputGroup
        w="full"
        bg={shellBg}
        borderWidth="1px"
        borderColor={border}
        borderRadius="2xl"
        px={{ base: 3, md: 4 }}
        py={{ base: 2.5, md: 3 }}
        alignItems="center"
        transition="all 0.2s ease"
        _focusWithin={{
          borderColor: "#3b82f6",
          boxShadow: "0 0 0 1px #3b82f6",
          transform: "translateY(-1px)",
        }}
        _hover={{
          borderColor: hoverBorderColor,
        }}
      >
        <Textarea
          ref={textareaRef}
          flex={1}
          variant="unstyled"
          placeholder={placeholderSuggestions[currentPlaceholderIndex]}
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          isDisabled={busy}
          rows={1}
          minH={{ base: "44px", md: "48px" }} // Enhanced minimum touch target
          maxH={{ base: "120px", md: "140px" }} // Better mobile scrolling
          resize="none"
          _placeholder={{
            color: placeholderColor,
            transition: "opacity 0.3s ease",
            fontSize: { base: "16px", md: "16px" } // Prevent zoom on iOS
          }}
          color={textColor}
          aria-label="Message to Neurastack"
          pr={{ base: "5rem", md: "6rem" }}
          borderColor={charCount > MAX_CHARS ? "red.400" : "transparent"}
          fontSize={{ base: "16px", md: "16px" }} // Prevent zoom on iOS
          lineHeight="1.5"
          // Enhanced mobile experience
          sx={{
            '@media (max-width: 768px)': {
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent',
            }
          }}
        />

        <InputRightElement width={{ base: "5rem", md: "6rem" }} top="50%" transform="translateY(-50%)" pr={2}>
          <HStack spacing={{ base: 1, md: 2 }} align="center">
            {/* Token Count Only - Simplified for mobile */}
            {tokenCount > 0 && (
              <Tooltip
                label={`~${tokenCount} token${tokenCount === 1 ? '' : 's'} (${charCount} characters)`}
                hasArrow
                placement="top"
                fontSize="sm"
              >
                <Text
                  fontSize={{ base: "2xs", md: "xs" }}
                  color={`${getTokenCountColor(tokenCount)}.400`}
                  fontWeight="500"
                  lineHeight="1"
                  opacity={tokenCount > 0 ? 1 : 0}
                  transition="opacity 0.2s ease"
                  minW={{ base: "8", md: "10" }}
                  textAlign="center"
                >
                  {formatTokenCount(tokenCount)}
                </Text>
              </Tooltip>
            )}

            <IconButton
              aria-label="Send message"
              aria-disabled={busy || !txt.trim()}
              icon={<PiArrowUpBold />}
              onClick={handleSend}
              isLoading={busy}
              size="sm"
              minW={{ base: "9", md: "10" }} // Optimized for mobile touch
              h={{ base: "9", md: "10" }}    // Optimized for mobile touch
              bg={txt.trim() ? "#3b82f6" : btnBg}
              _hover={{
                bg: txt.trim() ? "#2f6fe4" : btnHover,
                transform: "scale(1.05)"
              }}
              _focus={{
                boxShadow: "0 0 0 2px",
                boxShadowColor: txt.trim() ? "#3b82f6" : "gray.400"
              }}
              _active={{
                transform: "scale(0.95)"
              }}
              color={txt.trim() ? "white" : "gray.600"}
              borderRadius="full"
              isDisabled={busy || !txt.trim()}
              transition="all 0.2s ease"
            />
          </HStack>
        </InputRightElement>
      </InputGroup>

      {/* Enter key hint */}
      {txt.trim() && (
        <Text
          fontSize={{ base: "2xs", md: "xs" }}
          color={hintTextColor}
          textAlign="center"
          mt={{ base: 0.5, md: 1 }}
          opacity={0.7}
          fontWeight="400"
        >
          Press ⏎ to submit
        </Text>
      )}
    </Box>
  );
}