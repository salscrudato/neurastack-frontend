import {
  Box,
  Flex,
  IconButton,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

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

  const handleSend = () => {
    if (busy || !txt.trim()) return;
    send(txt.trim());
    setTxt("");
  };

  const shellBg  = useColorModeValue("#ffffff", "#2c2c2e");
  const border   = useColorModeValue("gray.300", "gray.600");
  const pageBg   = useColorModeValue("#f5f5f7", "#1c1c1e");
  const btnBg    = useColorModeValue("gray.100", "gray.700");
  const btnHover = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      w="full"
      px={4}
      py={4}
      bg={pageBg}
      borderTopWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Flex
        w="full"
        bg={shellBg}
        borderWidth="1px"
        borderColor={border}
        borderRadius="2xl"
        px={4}
        py={3}
        gap={3}
        align="center"
        _focusWithin={{
          borderColor: "#3b82f6",                // brand blue
          boxShadow: "0 0 0 1px #3b82f6",
        }}
      >
        <Textarea
          flex={1}
          variant="unstyled"
          placeholder="What do you want to know?"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey
              ? (e.preventDefault(), handleSend())
              : undefined
          }
          isDisabled={busy}
          rows={1}
          minH="3rem"
          maxH="6.5rem"          // ~3 lines before scroll
          resize="none"
          _placeholder={{ color: useColorModeValue("gray.500", "gray.400") }}
          color={useColorModeValue("gray.800", "gray.100")}
        />

        <IconButton
          aria-label="Send"
          icon={<FiSend />}
          onClick={handleSend}
          isLoading={busy}
          size="sm"
          minW="8"
          h="8"
          bg={txt.trim() ? "#3b82f6" : btnBg}
          _hover={{ bg: txt.trim() ? "#2f6fe4" : btnHover }}
          color={txt.trim() ? "white" : "gray.600"}
          borderRadius="full"
          isDisabled={busy || !txt.trim()}
        />
      </Flex>
    </Box>
  );
}