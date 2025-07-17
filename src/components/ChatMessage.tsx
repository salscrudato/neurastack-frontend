import {
  Badge,
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
import { PiCheckBold, PiCopyBold } from "react-icons/pi";
import type { Message } from "../store/useChatStore";
import { AdvancedAnalyticsModal } from "./AdvancedAnalyticsModal";
import { Loader } from "./LoadingSpinner";
import { UnifiedAIResponse } from "./UnifiedAIResponse";

interface ChatMessageProps {
  message: Message;
  isHighlighted?: boolean;
  fullData?: any;
}

const processContent = (text: string): string => text ? text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').replace(/\n{5,}/g, '\n\n\n\n').replace(/[ \t]{4,}/g, '   ').trim() : '';

const formatTimestamp = (timestamp: number): string => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const CopyButton = memo(({ text }: { text: string }) => {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Tooltip
      label={hasCopied ? "Copied!" : "Copy message"}
      hasArrow
      fontSize="xs"
      bg="var(--color-surface-glass-strong)"
      color="var(--color-text-primary)"
      borderRadius="var(--radius-lg)"
      backdropFilter="blur(12px)"
    >
      <IconButton
        aria-label="Copy message"
        icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />}
        size={{ base: "md", md: "sm" }}
        variant="ghost"
        onClick={onCopy}
        color="var(--color-text-muted)"
        bg="transparent"
        borderRadius="var(--radius-lg)"
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          color: "var(--color-text-secondary)",
          bg: "var(--color-surface-glass)",
          transform: "translateY(-1px) scale(1.05)",
          boxShadow: "var(--shadow-button-hover)"
        }}
        _focus={{
          boxShadow: "0 0 0 2px var(--color-brand-primary)",
          outline: "none"
        }}
        _active={{
          transform: "translateY(0) scale(0.95)",
          boxShadow: "var(--shadow-button)"
        }}
        minW={{ base: "44px", md: "36px" }}
        minH={{ base: "44px", md: "36px" }}
        sx={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          backdropFilter: hasCopied ? 'blur(8px)' : 'none'
        }}
      />
    </Tooltip>
  );
});

CopyButton.displayName = 'CopyButton';

export const ChatMessage = memo<ChatMessageProps>(({ message, isHighlighted = false, fullData }) => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isLoading = !message.text;

  const fontSizes = { micro: { base: "2xs", md: "xs" }, small: { base: "xs", md: "sm" }, content: { base: "xs", md: "sm" }, code: { base: "2xs", md: "xs" } };

  const processedContent = useMemo(() => processContent(message.text || ''), [message.text]);

  const parseAIResponse = (content: string) => {
    try { if (content.trim().startsWith('{') && content.trim().endsWith('}')) return JSON.parse(content); return null; } catch { return null; }
  };

  const structuredResponse = !isUser && !isError ? parseAIResponse(processedContent) : null;
  const displayText = processedContent;

  const [isAdvancedAnalyticsOpen, setIsAdvancedAnalyticsOpen] = useState(false);

  // Enhanced styling system with improved visual hierarchy
  const messageStyles = useMemo(() => {
    if (isUser) {
      return {
        bg: "var(--gradient-primary)",
        color: "white",
        shadow: "var(--shadow-brand), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        align: "flex-end" as const,
        borderRadius: "var(--radius-2xl) var(--radius-lg) var(--radius-lg) var(--radius-2xl)"
      };
    } else if (isError) {
      return {
        bg: "rgba(254, 242, 242, 0.95)",
        color: "var(--color-text-error)",
        shadow: "var(--shadow-card)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        align: "flex-start" as const,
        borderRadius: "var(--radius-lg) var(--radius-2xl) var(--radius-2xl) var(--radius-lg)"
      };
    } else {
      return {
        bg: "var(--color-surface-glass-strong)",
        color: "var(--color-text-primary)",
        shadow: "var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        border: "none",
        align: "flex-start" as const,
        borderRadius: "var(--radius-lg) var(--radius-2xl) var(--radius-2xl) var(--radius-lg)"
      };
    }
  }, [isUser, isError]);

  // Extract analytics from fullData
  const confidence = fullData?.synthesis?.confidence?.score || 0;
  const confidenceLevel = fullData?.synthesis?.confidence?.level || 'medium';
  const winner = fullData?.voting?.winner || 'unknown';
  const consensus = fullData?.voting?.consensus || 'medium';

  // Debug logging
  if (import.meta.env.DEV && !isUser && !isError) {
    console.log('ChatMessage Debug:', {
      hasMetadata: !!message.metadata?.metadata,
      hasFullData: !!fullData,
      fullData,
      messageMetadata: message.metadata
    });
  }

  return (
    <VStack spacing={{ base: 1, md: 2 }} w="100%" align="stretch">
      <Flex align="center" w="100%" my={{ base: 1, md: 1.5 }}>
        <Box flex="1" h="1px" bg="var(--color-border-light)" opacity={0.4} />
        <Text
          px={{ base: 2, md: 3 }}
          py={0.5}
          fontSize={{ base: "2xs", md: "xs" }}
          color="#6B7280"
          fontWeight="400"
          bg="transparent"
          letterSpacing="var(--letter-spacing-normal)"
        >
          {formatTimestamp(message.timestamp)}
        </Text>
        <Box flex="1" h="1px" bg="var(--color-border-light)" opacity={0.4} />
      </Flex>
      <Flex
        direction="column"
        align={messageStyles.align}
        w="100%"
        bg={isHighlighted ? 'rgba(79, 156, 249, 0.04)' : 'transparent'}
        borderRadius="var(--radius-2xl)"
        p={isHighlighted ? 3 : 0}
        transition="var(--transition-normal)"
      >
        <Box
          bg={messageStyles.bg}
          color={messageStyles.color}
          px={{ base: 4, md: 5 }}
          py={{ base: 3, md: 3.5 }}
          borderRadius={messageStyles.borderRadius}
          maxW={{
            base: isUser ? "85%" : "92%",
            sm: isUser ? "80%" : "88%",
            md: isUser ? "75%" : "85%",
            lg: isUser ? "70%" : "80%"
          }}
          minW={{ base: "20%", sm: "25%", md: "30%" }}
          position="relative"
          boxShadow={messageStyles.shadow}
          border={messageStyles.border}
          backdropFilter={isUser ? "none" : "blur(20px)"}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          minH={{ base: "44px", md: "auto" }}
          _hover={{
            transform: isUser ? "translateY(-2px) scale(1.02)" : "translateY(-1px) scale(1.01)",
            boxShadow: isUser
              ? "var(--shadow-brand-hover), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
              : "var(--shadow-card-hover), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
          }}
          sx={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            ...(isUser && {
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                borderRadius: 'inherit',
                pointerEvents: 'none'
              }
            }),
            ...(!isUser && !isError && {
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 0 20px rgba(79, 156, 249, 0.15)',
              animation: 'subtleBlueGlow 3s ease-in-out infinite',
              '@keyframes subtleBlueGlow': {
                '0%, 100%': {
                  boxShadow: '0 0 15px rgba(79, 156, 249, 0.1), var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                },
                '50%': {
                  boxShadow: '0 0 25px rgba(79, 156, 249, 0.2), var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: 1
              }
            })
          }}
        >
          {!isUser && !isError && !isLoading && message.metadata?.metadata && (
            <Box mb={2}>
              <VStack spacing={2} align="stretch">
                <Flex justify="space-between" align="center" p={{ base: 2, md: 3 }} bg="rgba(255, 255, 255, 0.9)" borderRadius="lg" border="1px solid" borderColor="rgba(226, 232, 240, 0.4)" position="relative" backdropFilter="blur(20px)" sx={{ WebkitBackdropFilter: 'blur(20px)', '@keyframes shimmer': { '0%, 100%': { opacity: 0.2 }, '50%': { opacity: 0.4 } } }} overflow="hidden" _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.3) 50%, transparent 100%)', animation: 'shimmer 4s ease-in-out infinite' }}>
                  <HStack justify="space-between" align="center" w="100%" spacing={2}>
                    <HStack spacing={2}>
                      <Box w="5px" h="5px" borderRadius="full" bg="linear-gradient(45deg, #94A3B8, #64748B)" boxShadow="0 0 4px rgba(148, 163, 184, 0.3)" animation="pulse 3s ease-in-out infinite" sx={{ '@keyframes pulse': { '0%, 100%': { transform: 'scale(1)', opacity: 0.7 }, '50%': { transform: 'scale(1.1)', opacity: 0.9 } } }} />
                      <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="#475569" letterSpacing="-0.025em">AI Ensemble</Text>
                    </HStack>
                    <Button
                        size="xs"
                        onClick={() => {
                          console.log('Analytics button clicked, ensembleData:', message.metadata?.ensembleData);
                          setIsAdvancedAnalyticsOpen(true);
                        }}
                        bg="#4F9CF9"
                        color="white"
                        fontWeight="600"
                        fontSize="2xs"
                        border="1px solid #4F9CF9"
                        boxShadow="0 1px 4px rgba(79, 156, 249, 0.1), 0 4px 12px rgba(79, 156, 249, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                        position="relative"
                        overflow="hidden"
                        minH={{ base: "32px", md: "28px" }}
                        px={3}
                        py={1}
                        h="auto"
                        borderRadius="lg"
                        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                        letterSpacing="0.025em"
                        sx={{
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                        _before={{
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                          transition: 'left 0.8s ease'
                        }}
                        _hover={{
                          bg: "#3B82F6",
                          borderColor: "#3B82F6",
                          color: "white",
                          transform: "translateY(-1px)",
                          boxShadow: "0 8px 24px rgba(79, 156, 249, 0.35)",
                          _before: { left: '100%' }
                        }}
                        _active={{
                          transform: "translateY(0) scale(0.98)",
                          bg: "#2563EB",
                          boxShadow: "0 2px 8px rgba(79, 156, 249, 0.25)"
                        }}
                        _focus={{
                          boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)",
                          outline: "none"
                        }}
                      >
                        <Text>Analytics</Text>
                      </Button>
                  </HStack>
                </Flex>

              </VStack>
            </Box>
          )}
          <Box>
            {isLoading ? <Loader variant="team" size="sm" /> : isError ? <Text fontSize={fontSizes.content} color={messageStyles.color}>{processedContent || 'An error occurred'}</Text> : isUser ? <Text fontSize={fontSizes.content} lineHeight={{ base: "1.4", md: "1.5" }} fontWeight="500" letterSpacing="0.01em" color="white" sx={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{displayText}</Text> : <UnifiedAIResponse content={structuredResponse ? undefined : displayText} data={structuredResponse || undefined} fontSize={{ content: fontSizes.content as any, heading: { base: "md", md: "lg" } as any, code: fontSizes.code as any, small: fontSizes.small as any }} />}
          </Box>
          {!isUser && fullData && (
            <HStack spacing={2} mt={2} justify="flex-start">
              <Badge colorScheme={confidenceLevel === 'high' ? 'green' : confidenceLevel === 'medium' ? 'yellow' : 'red'}>
                Confidence: {(confidence * 100).toFixed(0)}%
              </Badge>
              <Badge colorScheme="blue">Winner: {winner}</Badge>
              <Badge colorScheme="purple">Consensus: {consensus}</Badge>
            </HStack>
          )}
          {!isUser && <HStack justify="flex-end" align="center" mt={1} spacing={1}><CopyButton text={processedContent} /></HStack>}
        </Box>
      </Flex>
      <AdvancedAnalyticsModal isOpen={isAdvancedAnalyticsOpen} onClose={() => setIsAdvancedAnalyticsOpen(false)} analyticsData={message.metadata?.ensembleData} />
    </VStack>
  );
});

ChatMessage.displayName = 'ChatMessage';