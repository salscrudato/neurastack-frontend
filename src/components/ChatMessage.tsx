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
import { PiCheckBold, PiCopyBold } from "react-icons/pi";
import { useModelResponses } from "../hooks/useModelResponses";
import type { Message } from "../store/useChatStore";
import { EnsembleInfoModal } from "./EnsembleInfoModal";
import { IndividualModelModal } from "./IndividualModelModal";
import { Loader } from "./LoadingSpinner";
import { UnifiedAIResponse } from "./UnifiedAIResponse";

interface ChatMessageProps {
  message: Message;
  isHighlighted?: boolean;
}

const processContent = (text: string): string => text ? text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').replace(/\n{5,}/g, '\n\n\n\n').replace(/[ \t]{4,}/g, '   ').trim() : '';

const formatTimestamp = (timestamp: number): string => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const CopyButton = memo(({ text }: { text: string }) => {
  const { onCopy, hasCopied } = useClipboard(text);
  return (
    <Tooltip label={hasCopied ? "Copied!" : "Copy message"} hasArrow fontSize="xs">
      <IconButton aria-label="Copy message" icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />} size={{ base: "md", md: "sm" }} variant="ghost" onClick={onCopy} color="#94A3B8" boxShadow="none" _hover={{ color: "#475569", bg: "#F8FAFC", transform: "translateY(-1px)", boxShadow: "0 2px 8px rgba(148, 163, 184, 0.15)" }} _focus={{ boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)", outline: "none" }} _active={{ transform: "scale(0.95)", boxShadow: "none" }} minW={{ base: "44px", md: "32px" }} minH={{ base: "44px", md: "32px" }} sx={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} />
    </Tooltip>
  );
});

CopyButton.displayName = 'CopyButton';

export const ChatMessage = memo<ChatMessageProps>(({ message, isHighlighted = false }) => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isLoading = !message.text;

  const fontSizes = { micro: { base: "xs", md: "sm" }, small: { base: "sm", md: "md" }, content: { base: "sm", md: "md" }, code: { base: "xs", md: "sm" } };

  const processedContent = useMemo(() => processContent(message.text || ''), [message.text]);

  const parseAIResponse = (content: string) => {
    try { if (content.trim().startsWith('{') && content.trim().endsWith('}')) return JSON.parse(content); return null; } catch { return null; }
  };

  const structuredResponse = !isUser && !isError ? parseAIResponse(processedContent) : null;
  const displayText = processedContent;

  const { selectedModel, isModalOpen, openModelModal, closeModal, getAvailableModels } = useModelResponses(message.metadata?.individualResponses, message.metadata?.modelsUsed, message.metadata?.fallbackReasons, message.metadata?.metadata);
  const availableModels = getAvailableModels();

  const [isEnsembleInfoOpen, setIsEnsembleInfoOpen] = useState(false);

  const bgUser = "linear-gradient(135deg, #4F9CF9 0%, #3B82F6 100%)";
  const bgAi = "rgba(255, 255, 255, 0.95)";
  const textAi = "#1E293B";
  const bgErr = "rgba(254, 242, 242, 0.95)";
  const textErr = "#DC2626";
  const timestampColor = "#94A3B8";
  const borderAi = "rgba(226, 232, 240, 0.3)";
  const shadowUser = "0 4px 16px rgba(79, 156, 249, 0.2), 0 2px 8px rgba(79, 156, 249, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
  const shadowAi = "0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.8)";

  const bubbleBg = isUser ? bgUser : isError ? bgErr : bgAi;
  const bubbleText = isUser ? "white" : isError ? textErr : textAi;

  return (
    <VStack spacing={{ base: 3, md: 4 }} w="100%" align="stretch">
      <Flex align="center" w="100%" my={{ base: 1, md: 2 }}>
        <Box flex="1" h="1px" bg="#E2E8F0" opacity={0.4} />
        <Text px={{ base: 3, md: 4 }} fontSize={fontSizes.micro} color={timestampColor} fontWeight="500" bg="rgba(248, 250, 252, 0.8)" backdropFilter="blur(8px)" borderRadius="full" py={0.5} border="1px solid" borderColor="rgba(226, 232, 240, 0.3)">{formatTimestamp(message.timestamp)}</Text>
        <Box flex="1" h="1px" bg="#E2E8F0" opacity={0.4} />
      </Flex>
      <Flex direction="column" align={isUser ? "flex-end" : "flex-start"} w="100%" bg={isHighlighted ? 'rgba(79, 156, 249, 0.05)' : 'transparent'} borderRadius="xl" p={isHighlighted ? 3 : 0} transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)">
        <Box bg={bubbleBg} color={bubbleText} px={{ base: isUser ? 4 : 5, md: isUser ? 4.5 : 6 }} py={{ base: isUser ? 2.5 : 4, md: isUser ? 3 : 4.5 }} borderRadius={isUser ? "2xl" : "xl"} maxW={{ base: isUser ? "90%" : "95%", sm: isUser ? "88%" : "92%", md: isUser ? "80%" : "88%", lg: isUser ? "75%" : "85%" }} minW={{ base: "20%", sm: "25%", md: "30%" }} position="relative" boxShadow={isUser ? shadowUser : shadowAi} border={isUser ? "none" : "1px solid"} borderColor={isUser ? "transparent" : borderAi} backdropFilter={isUser ? "none" : "blur(16px)"} transition="all 250ms cubic-bezier(0.4, 0, 0.2, 1)" minH={{ base: "44px", md: "auto" }} _hover={{ transform: isUser ? "translateY(-2px) scale(1.01)" : "translateY(-1px)", boxShadow: isUser ? "0 12px 40px rgba(79, 156, 249, 0.35), 0 4px 16px rgba(79, 156, 249, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)" : "0 6px 20px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)" }} sx={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', ...(isUser && { background: 'linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)', borderRadius: '2xl', pointerEvents: 'none' } }), ...(!isUser && !isError && { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', borderRadius: 'xl', pointerEvents: 'none', zIndex: 1 } }), '@media (max-width: 768px)': { minHeight: '44px' } }}>
          {!isUser && !isError && !isLoading && message.metadata?.metadata && (
            <Box mb={4}>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center" p={{ base: 3, md: 4 }} bg="rgba(255, 255, 255, 0.9)" borderRadius="xl" border="1px solid" borderColor="rgba(226, 232, 240, 0.4)" position="relative" backdropFilter="blur(20px)" sx={{ WebkitBackdropFilter: 'blur(20px)', '@keyframes shimmer': { '0%, 100%': { opacity: 0.2 }, '50%': { opacity: 0.4 } } }} overflow="hidden" _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.3) 50%, transparent 100%)', animation: 'shimmer 4s ease-in-out infinite' }}>
                  <HStack justify="space-between" align="center" w="100%" spacing={4}>
                    <HStack spacing={3}>
                      <Box w="6px" h="6px" borderRadius="full" bg="linear-gradient(45deg, #94A3B8, #64748B)" boxShadow="0 0 6px rgba(148, 163, 184, 0.3)" animation="pulse 3s ease-in-out infinite" sx={{ '@keyframes pulse': { '0%, 100%': { transform: 'scale(1)', opacity: 0.7 }, '50%': { transform: 'scale(1.1)', opacity: 0.9 } } }} />
                      <Text fontSize={{ base: "sm", md: "md" }} fontWeight="600" color="#475569" letterSpacing="-0.025em">AI Ensemble</Text>
                    </HStack>
                    <Button size="sm" onClick={() => setIsEnsembleInfoOpen(true)} bg="rgba(255, 255, 255, 0.95)" color="#64748B" fontWeight="600" fontSize="xs" border="1px solid rgba(100, 116, 139, 0.2)" boxShadow="0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)" position="relative" overflow="hidden" minH="36px" px={5} py={2} h="auto" borderRadius="lg" transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" letterSpacing="0.025em" sx={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} _before={{ content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(100, 116, 139, 0.05), transparent)', transition: 'left 0.8s ease' }} _hover={{ bg: "rgba(255, 255, 255, 0.9)", borderColor: "rgba(100, 116, 139, 0.5)", color: "#475569", transform: "translateY(-1px)", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)", _before: { left: '100%' } }} _active={{ transform: "translateY(0) scale(0.98)", bg: "rgba(255, 255, 255, 0.95)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }} _focus={{ boxShadow: "0 0 0 2px rgba(100, 116, 139, 0.3)", outline: "none" }}><Text>Details</Text></Button>
                  </HStack>
                </Flex>
                <HStack spacing={2} wrap="wrap" justify="center" w="100%">
                  {availableModels.map((model, index) => {
                    const modelColors = { openai: { border: '#4F9CF9', text: '#4F9CF9', hover: 'rgba(79, 156, 249, 0.05)' }, gemini: { border: '#3B82F6', text: '#3B82F6', hover: 'rgba(59, 130, 246, 0.05)' }, claude: { border: '#2563EB', text: '#2563EB', hover: 'rgba(37, 99, 235, 0.05)' }, default: { border: '#6366F1', text: '#6366F1', hover: 'rgba(99, 102, 241, 0.05)' } };
                    const colors = modelColors[model.provider as keyof typeof modelColors] || modelColors.default;
                    return (
                      <Button key={model.model} size="sm" onClick={() => openModelModal(model)} bg="white" color={colors.text} fontWeight="700" fontSize="xs" border={`1px solid ${colors.border}`} boxShadow="none" position="relative" overflow="hidden" minH="36px" flex="1" maxW="120px" px={4} py={2} h="auto" borderRadius="lg" transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" display="flex" alignItems="center" justifyContent="center" _before={{ content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: `linear-gradient(90deg, transparent, ${colors.hover}, transparent)`, transition: 'left 0.6s ease' }} _hover={{ bg: colors.hover, borderColor: colors.border, transform: "translateY(-1px)", boxShadow: `0 2px 8px ${colors.border}30`, _before: { left: '100%' } }} _active={{ transform: "translateY(0) scale(0.98)", bg: colors.hover, boxShadow: "none" }} _focus={{ boxShadow: `0 0 0 2px ${colors.border}50`, outline: "none" }} style={{ animationDelay: `${index * 0.1}s`, animation: 'fadeInUp 0.6s ease-out forwards' }} sx={{ '@keyframes fadeInUp': { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } } }}><Text letterSpacing="0.025em">{model.provider === 'openai' ? 'GPT-4o' : model.provider === 'gemini' ? 'Gemini' : model.provider === 'claude' ? 'Claude' : (model.provider || 'Unknown').toUpperCase()}</Text></Button>
                    );
                  })}
                </HStack>
              </VStack>
            </Box>
          )}
          <Box>
            {isLoading ? <Loader variant="team" size="sm" /> : isError ? <Text fontSize={fontSizes.content} color={textErr}>{processedContent || 'An error occurred'}</Text> : isUser ? <Text fontSize={fontSizes.content} lineHeight={{ base: "1.4", md: "1.5" }} fontWeight="500" letterSpacing="0.01em" color="white" sx={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{displayText}</Text> : <UnifiedAIResponse content={structuredResponse ? undefined : displayText} data={structuredResponse || undefined} fontSize={{ content: fontSizes.content as any, heading: { base: "md", md: "lg" } as any, code: fontSizes.code as any, small: fontSizes.small as any }} />}
          </Box>
          {!isUser && <HStack justify="flex-end" align="center" mt={2} spacing={1}><CopyButton text={processedContent} /></HStack>}
        </Box>
      </Flex>
      <IndividualModelModal isOpen={isModalOpen} onClose={closeModal} modelData={selectedModel} />
      <EnsembleInfoModal isOpen={isEnsembleInfoOpen} onClose={() => setIsEnsembleInfoOpen(false)} ensembleData={message.metadata?.metadata} />
    </VStack>
  );
});

ChatMessage.displayName = 'ChatMessage';