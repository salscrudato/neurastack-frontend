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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { PiWarningBold } from "react-icons/pi";
import type { Message } from "../store/useChatStore";

// provider logos (SVGS now next to this file)
import gptLogo   from "./openai.svg";
import gptText   from "./openai-text.svg";
import gemLogo   from "./google.svg";
import gemText   from "./gemini-text.svg";
import grokLogo  from "./xai.svg";
import grokText  from "./grok-text.svg";

const MotionBox = motion(Box);

// model → { logo, label }
const logoMap: Record<
  string,
  { icon: string; label: string }
> = {
  openai: { icon: gptLogo,  label: gptText },
  google: { icon: gemLogo,  label: gemText },
  xai:    { icon: grokLogo, label: grokText },
};

export default function ChatMessage({ m }: { m: Message }) {
  const isUser  = m.role === "user";
  const isError = m.role === "error";
  const isLoad  = !m.text;

  /* color tokens */
  const bgUser = useColorModeValue("blue.500", "blue.400");
  const bgAi   = useColorModeValue("#f3f4f6", "gray.700");
  const textAi = useColorModeValue("gray.800", "gray.100");
  const bgErr  = useColorModeValue("yellow.100", "yellow.600");
  const textErr= useColorModeValue("yellow.800", "yellow.100");

  // filter for inverting logos in dark mode
  const logoFilter = useColorModeValue("none", "invert(1)");

  // title styles: gradient in light, white in dark
  const titleStyles = useColorModeValue(
    {
      bgGradient: "linear(to-r, rgb(128, 183, 228) 0%, rgb(18, 88, 240) 100%)",
      bgClip: "text",
    },
    {
      color: "white",
    }
  );

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
      mt={2}  
      w="full"
      display="flex"
      justifyContent={isUser ? "flex-end" : "flex-start"}
    >
      <MotionBox
        maxW="100%"
        px={4}
        py={3}
        borderRadius="xl"
        bg={bubbleBg}
        color={bubbleText}
        fontSize="sm"
        whiteSpace="pre-wrap"
        position="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        {...pointer}
      >
        <VStack align="stretch" spacing={2}>
          {!isUser && (
            <>
              <Text
                fontFamily="Inter, sans-serif"
                fontSize="2xl"
                fontWeight="extrabold"
                letterSpacing="-1px"
                {...titleStyles}
              >
                neurastack
              </Text>

              {/* provider badges */}
              <HStack spacing={4} mb={5} opacity={0.85}>
                {Object.entries(logoMap).map(([key, { icon, label }]) => (
                  <HStack key={key} spacing={1}>
                    <Box as="img" src={icon}  w="18px" h="18px" alt={`${key}`} filter={logoFilter} />
                    <Box as="img" src={label} w="42px" h="18px" alt={`${key}-text`} filter={logoFilter} />
                  </HStack>
                ))}
              </HStack>
            </>
          )}

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
        </VStack>
      </MotionBox>
    </Box>
  );
}
