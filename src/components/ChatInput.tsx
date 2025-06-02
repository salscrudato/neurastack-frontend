import {
  Box,
  IconButton,
  Textarea,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Text,
  HStack,
  useToast,
  VStack,
  Tooltip,
} from "@chakra-ui/react";
import { PiArrowUpBold } from "react-icons/pi";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { estimateTokenCount, formatTokenCount, getTokenCountColor } from "../utils/tokenCounter";

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

  // Cycling placeholder suggestions
  const placeholderSuggestions = [
    "Create a leg workout.",
    "How do I grill the perfect steak?",
    "Plan a weekend trip to Paris.",
    "Write a professional email.",
    "Explain quantum computing simply."
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
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const shellBg  = useColorModeValue("#ffffff", "#2c2c2e");
  const border   = useColorModeValue("gray.300", "gray.600");
  const pageBg   = useColorModeValue("#f5f5f7", "#1c1c1e");
  const btnBg    = useColorModeValue("gray.100", "gray.700");
  const btnHover = useColorModeValue("gray.200", "gray.600");
  const charCountColor = useColorModeValue("gray.400", "gray.500");
  const borderTopColor = useColorModeValue("gray.200", "gray.700");
  const hoverBorderColor = useColorModeValue("gray.400", "gray.500");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("gray.800", "gray.100");

  return (
    <Box
      w="full"
      px={4}
      py={4}
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
        px={4}
        py={3}
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
          minH="3rem"
          maxH="6.5rem"
          resize="none"
          _placeholder={{
            color: placeholderColor,
            transition: "opacity 0.3s ease"
          }}
          color={textColor}
          aria-label="Message to Neurastack"
          pr="6rem"
          borderColor={charCount > MAX_CHARS ? "red.400" : "transparent"}
          fontSize="16px"
          lineHeight="1.5"
        />

        <InputRightElement width="6rem" top="50%" transform="translateY(-50%)" pr={2}>
          <HStack spacing={2} align="center">
            {/* Token and Character Count */}
            {(charCount > 0 || tokenCount > 0) && (
              <Tooltip
                label={`${charCount} characters, ~${tokenCount} token${tokenCount === 1 ? '' : 's'}`}
                hasArrow
                placement="top"
              >
                <VStack spacing={0} align="end" minW="10">
                  <Text
                    fontSize="xs"
                    color={`${getTokenCountColor(tokenCount)}.400`}
                    fontWeight="500"
                    lineHeight="1"
                    opacity={tokenCount > 0 ? 1 : 0}
                    transition="opacity 0.2s ease"
                  >
                    {tokenCount > 0 && `${formatTokenCount(tokenCount)} token${tokenCount === 1 ? '' : 's'}`}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={charCount > MAX_CHARS ? "red.400" : charCountColor}
                    fontWeight="500"
                    lineHeight="1"
                    opacity={charCount > 0 ? 1 : 0}
                    transition="opacity 0.2s ease"
                  >
                    {charCount > 0 && `${charCount} count`}
                  </Text>
                </VStack>
              </Tooltip>
            )}

            <IconButton
              aria-label="Send message"
              aria-disabled={busy || !txt.trim()}
              icon={<PiArrowUpBold />}
              onClick={handleSend}
              isLoading={busy}
              size="sm"
              minW="10" // Increased for better touch target
              h="10"    // Increased for better touch target
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
          fontSize="xs"
          color={useColorModeValue('gray.500', 'gray.400')}
          textAlign="center"
          mt={1}
          opacity={0.8}
        >
          Press ⏎ to submit
        </Text>
      )}
    </Box>
  );
}