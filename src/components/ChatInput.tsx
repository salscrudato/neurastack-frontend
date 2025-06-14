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
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useReducedMotion } from "../hooks/useAccessibility";
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
  const prefersReducedMotion = useReducedMotion();



  // Enhanced input configuration
  const inputConfig = useMemo(() => ({
    minHeight: { xs: "44px", sm: "46px", md: "48px", lg: "50px", xl: "52px" },
    maxHeight: { xs: "120px", sm: "130px", md: "140px", lg: "150px", xl: "160px" },
    fontSize: { xs: "16px", sm: "16px", md: "16px", lg: "16px", xl: "16px" }, // Prevent zoom
    padding: { xs: 3, sm: 3.5, md: 4, lg: 4.5, xl: 5 },
    borderRadius: { xs: "xl", sm: "2xl", md: "2xl", lg: "3xl", xl: "3xl" }
  }), []);

  // Animation configuration
  const animationConfig = useMemo(() => ({
    transition: prefersReducedMotion ? 'none' : 'all 0.2s ease',
    transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
    scale: prefersReducedMotion ? 'none' : 'scale(1.05)'
  }), [prefersReducedMotion]);

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

  const handleSend = useCallback(async () => {
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
  }, [busy, txt, toast, send]);

  // Enhanced keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Add Escape key to clear input
    if (e.key === "Escape") {
      setTxt("");
      setCharCount(0);
      setTokenCount(0);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [handleSend]);

  const shellBg  = "#FFFFFF";
  const border   = "#CBD5E1";
  const pageBg   = "#FAFBFC";
  const btnBg    = "#F8FAFC";
  const btnHover = "#E2E8F0";
  const btnDisabledBg = "#F1F5F9";
  const btnDisabledColor = "#64748B";

  const borderTopColor = "#E2E8F0";
  const hoverBorderColor = "#94A3B8";
  const placeholderColor = "#94A3B8";
  const textColor = "#1E293B";
  const hintTextColor = '#94A3B8';

  return (
    <Box
      w="full"
      px={inputConfig.padding}
      py={{ xs: 2.5, sm: 3, md: 3.5, lg: 4, xl: 4.5 }}
      bg={pageBg}
      borderTopWidth="1px"
      borderColor={borderTopColor}
      // Enhanced mobile support
      sx={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Safe area support for mobile devices
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        '@media (max-width: 768px)': {
          paddingX: 3,
          paddingY: 3,
        }
      }}
    >
      <InputGroup
        w="full"
        bg={shellBg}
        borderWidth="1px"
        borderColor={border}
        borderRadius={inputConfig.borderRadius}
        px={inputConfig.padding}
        py={{ xs: 2.5, sm: 3, md: 3, lg: 3.5, xl: 4 }}
        alignItems="center"
        transition={animationConfig.transition}
        // Enhanced focus and hover states
        _focusWithin={{
          borderColor: "#3b82f6",
          boxShadow: "0 0 0 1px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.15)",
          transform: animationConfig.transform,
        }}
        _hover={{
          borderColor: hoverBorderColor,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
        // Enhanced accessibility
        role="group"
        aria-label="Message input area"
      >
        <Textarea
          ref={textareaRef}
          flex={1}
          variant="unstyled"
          placeholder={placeholderSuggestions[currentPlaceholderIndex]}
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={handleKeyDown}
          isDisabled={busy}
          rows={1}
          minH={inputConfig.minHeight}
          maxH={inputConfig.maxHeight}
          resize="none"
          // Enhanced accessibility
          aria-label="Type your message here"
          aria-describedby="char-count token-count"
          aria-invalid={charCount > MAX_CHARS}
          // Enhanced mobile support
          autoComplete="off"
          autoCorrect="on"
          spellCheck="true"
          _placeholder={{
            color: placeholderColor,
            transition: animationConfig.transition,
            fontSize: inputConfig.fontSize,
            opacity: 0.7
          }}
          _focus={{
            outline: "none"
          }}
          _disabled={{
            opacity: 0.6,
            cursor: "not-allowed"
          }}
          // Enhanced touch interactions
          sx={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            // Prevent zoom on iOS
            '@media (max-width: 768px)': {
              fontSize: '16px !important',
            }
          }}
          color={textColor}
          pr={{ base: "6rem", md: "7rem" }}
          pl={{ base: "1.5rem", md: "2rem" }}
          py={{ base: "1.25rem", md: "1.5rem" }}
          borderColor={charCount > MAX_CHARS ? "red.400" : "transparent"}
          fontSize={{ base: "16px", md: "16px" }} // Prevent zoom on iOS
          lineHeight="1.5"
        />

        <InputRightElement
          width={{ base: "5rem", md: "6rem" }}
          top="50%"
          transform="translateY(-50%)"
          pr={{ base: 1, md: 2 }}
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
        >
          <HStack spacing={{ base: 0.5, md: 1 }} align="center" w="100%" justify="flex-end">
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
                  minW={{ base: "6", md: "8" }}
                  textAlign="center"
                  mr={{ base: 0.5, md: 1 }}
                >
                  {formatTokenCount(tokenCount)}
                </Text>
              </Tooltip>
            )}

            <IconButton
              aria-label={txt.trim() ? "Send message" : "Enter a message to send"}
              aria-disabled={busy || !txt.trim()}
              icon={<PiArrowUpBold size={txt.trim() ? 22 : 20} />}
              onClick={handleSend}
              isLoading={busy}
              size={{ base: "md", md: "lg" }}
              w={{ base: "42px", md: "48px" }}
              h={{ base: "42px", md: "48px" }}
              minW={{ base: "42px", md: "48px" }}
              minH={{ base: "42px", md: "48px" }}
              bg={txt.trim() ? "#3b82f6" : btnBg}
              color={txt.trim() ? "white" : btnDisabledColor}
              border={txt.trim() ? "none" : "1px solid #CBD5E1"}
              transition={animationConfig.transition}
              _hover={{
                bg: txt.trim() ? "#2563eb" : btnHover,
                borderColor: txt.trim() ? "transparent" : "#94A3B8",
                transform: animationConfig.scale
              }}
              _focus={{
                boxShadow: txt.trim() ? "0 0 0 2px #3b82f6" : "0 0 0 2px #64748B",
                outline: "2px solid transparent",
                outlineOffset: "2px"
              }}
              _active={{
                transform: prefersReducedMotion ? 'none' : "scale(0.95)",
                bg: txt.trim() ? "#1d4ed8" : "#E2E8F0"
              }}
              _disabled={{
                bg: btnDisabledBg,
                color: "#94A3B8",
                borderColor: "#E2E8F0",
                cursor: "not-allowed",
                opacity: 0.6
              }}
              borderRadius="full"
              isDisabled={busy || !txt.trim()}
              flexShrink={0}
              sx={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                // Enhanced icon visibility with better contrast
                '& svg': {
                  color: 'currentColor !important',
                  filter: txt.trim() ? 'none' : 'contrast(1.2)',
                  transition: 'all 0.2s ease'
                }
              }}
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