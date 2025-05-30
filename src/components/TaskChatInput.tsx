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
} from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

interface TaskChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export default function TaskChatInput({ onSend, isLoading, placeholder = "Describe what you need to do..." }: TaskChatInputProps) {
  const [txt, setTxt] = useState("");
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  const MAX_CHARS = 4000;

  useEffect(() => {
    setCharCount(txt.length);
  }, [txt]);

  const handleSend = async () => {
    if (isLoading || !txt.trim()) return;

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
      await onSend(txt.trim());
      setTxt("");
      setCharCount(0);
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

  return (
    <Box
      w="full"
      px={{ base: 3, md: 4 }}
      py={{ base: 3, md: 4 }}
      bg={pageBg}
      borderTopWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      // Safe area for mobile devices
      pb={{ base: "env(safe-area-inset-bottom, 16px)", md: 4 }}
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
          borderColor: useColorModeValue("gray.400", "gray.500"),
        }}
        minH={{ base: "48px", md: "auto" }}
      >
        <Textarea
          ref={textareaRef}
          flex={1}
          variant="unstyled"
          placeholder={placeholder}
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          isDisabled={isLoading}
          rows={1}
          minH={{ base: "2.5rem", md: "3rem" }}
          maxH={{ base: "5rem", md: "6.5rem" }}
          resize="none"
          _placeholder={{ color: useColorModeValue("gray.500", "gray.400") }}
          color={useColorModeValue("gray.800", "gray.100")}
          aria-label="Task description"
          pr={{ base: "4rem", md: "5rem" }}
          borderColor={charCount > MAX_CHARS ? "red.400" : "transparent"}
          fontSize={{ base: "16px", md: "16px" }}
          lineHeight="1.5"
        />

        <InputRightElement
          width={{ base: "4rem", md: "5rem" }}
          top="50%"
          transform="translateY(-50%)"
          pr={2}
        >
          <HStack spacing={2} align="center">
            {/* Inline Character Count */}
            <Text
              fontSize="xs"
              color={charCount > MAX_CHARS ? "red.400" : useColorModeValue("gray.400", "gray.500")}
              fontWeight="500"
              minW="6"
              textAlign="right"
              opacity={charCount > 0 ? 1 : 0}
              transition="opacity 0.2s ease"
              display={{ base: charCount > 100 ? "block" : "none", md: "block" }}
            >
              {charCount > 0 && `${charCount}`}
            </Text>

            <IconButton
              aria-label="Send message"
              aria-disabled={isLoading || !txt.trim()}
              icon={<FiSend />}
              onClick={handleSend}
              isLoading={isLoading}
              size={{ base: "sm", md: "sm" }}
              minW={{ base: "7", md: "8" }}
              h={{ base: "7", md: "8" }}
              bg={txt.trim() ? "#3b82f6" : btnBg}
              _hover={{ bg: txt.trim() ? "#2f6fe4" : btnHover }}
              color={txt.trim() ? "white" : "gray.600"}
              borderRadius="full"
              isDisabled={isLoading || !txt.trim()}
              transition="all 0.2s ease"
            />
          </HStack>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}
