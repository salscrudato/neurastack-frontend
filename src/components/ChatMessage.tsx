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
import type { Message } from "../store/useChatStore";
import { useChatStore } from "../store/useChatStore";
import { AdvancedErrorHandler } from "./AdvancedErrorHandler";
import { EnhancedConfidenceIndicator } from "./EnhancedConfidenceIndicator";
import {
    LazyEnhancedAnalyticsModal,
    LazyResponseComparisonModal
} from "./LazyAnalyticsComponents";
import { Loader } from "./LoadingSpinner";
import { UnifiedAIResponse } from "./UnifiedAIResponse";

interface ChatMessageProps {
  message: Message;
  isHighlighted?: boolean;
  fullData?: any;
}

// Utility functions
const processContent = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/\n{5,}/g, '\n\n\n\n')
    .replace(/[ \t]{4,}/g, '   ')
    .trim();
};

const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Constants
const FONT_SIZES = {
  content: { base: "12px", md: "13px" },
  code: { base: "10px", md: "11px" },
  timestamp: { base: "9px", md: "10px" },
  analytics: { base: "12px", md: "13px" }
} as const;

// Helper function to get message styles
const getMessageStyles = (isUser: boolean, isError: boolean) => {
  if (isUser) {
    return {
      align: 'flex-end' as const,
      bg: 'linear-gradient(135deg, #4F9CF9 0%, #3B82F6 100%)',
      color: 'white',
      shadow: '0 4px 12px rgba(79, 156, 249, 0.25)',
      border: 'none'
    };
  }

  if (isError) {
    return {
      align: 'flex-start' as const,
      bg: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
      color: '#DC2626',
      shadow: '0 2px 8px rgba(220, 38, 38, 0.1)',
      border: '1px solid #FECACA'
    };
  }

  return {
    align: 'flex-start' as const,
    bg: 'rgba(255, 255, 255, 0.95)',
    color: '#1F2937',
    shadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.6)'
  };
};

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

  // State for response selection and modals
  const [isEnhancedAnalyticsOpen, setIsEnhancedAnalyticsOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<number>(-1); // -1 for synthesized, 0+ for individual models

  // Use centralized font sizes

  const processedContent = useMemo(() => processContent(message.text || ''), [message.text]);

  const parseAIResponse = (content: string) => {
    try { if (content.trim().startsWith('{') && content.trim().endsWith('}')) return JSON.parse(content); return null; } catch { return null; }
  };

  const structuredResponse = !isUser && !isError ? parseAIResponse(processedContent) : null;

  // Get individual model responses from metadata
  const individualResponses = message.metadata?.individualResponses || [];
  const hasIndividualResponses = individualResponses.length > 0;

  // Determine what content to display based on selected response
  const displayContent = useMemo(() => {
    if (isUser || isError || !hasIndividualResponses) {
      return processedContent;
    }

    if (selectedResponseIndex === -1) {
      // Show synthesized response (default)
      return processedContent;
    } else if (selectedResponseIndex >= 0 && selectedResponseIndex < individualResponses.length) {
      // Show individual model response
      const selectedResponse = individualResponses[selectedResponseIndex];
      return selectedResponse.content || selectedResponse.answer || 'No response available';
    }

    return processedContent;
  }, [processedContent, selectedResponseIndex, individualResponses, isUser, isError, hasIndividualResponses]);

  const displayText = displayContent;



  // Get message styles using helper function
  const messageStyles = useMemo(() => {
    const baseStyles = getMessageStyles(isUser, isError);

    // Add CSS variable-based styling for consistency
    if (isUser) {
      return {
        ...baseStyles,
        bg: "var(--gradient-primary)",
        shadow: "var(--shadow-brand), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "var(--radius-2xl) var(--radius-lg) var(--radius-lg) var(--radius-2xl)"
      };
    } else if (isError) {
      return {
        ...baseStyles,
        bg: "rgba(254, 242, 242, 0.95)",
        color: "var(--color-text-error)",
        shadow: "var(--shadow-card)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "var(--radius-lg) var(--radius-2xl) var(--radius-2xl) var(--radius-lg)"
      };
    } else {
      return {
        ...baseStyles,
        bg: "var(--color-surface-glass-strong)",
        color: "var(--color-text-primary)",
        shadow: "var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        border: "none",
        borderRadius: "var(--radius-lg) var(--radius-2xl) var(--radius-2xl) var(--radius-lg)"
      };
    }
  }, [isUser, isError]);

  // Extract analytics from fullData (for future use)
  // const confidence = fullData?.synthesis?.confidence?.score || 0;
  // const confidenceLevel = fullData?.synthesis?.confidence?.level || 'medium';
  // const winner = fullData?.voting?.winner || 'unknown';
  // const consensus = fullData?.voting?.consensus || 'medium';

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
    <VStack
      spacing={{ base: 0.5, md: 1 }}
      w="100%"
      align="stretch"
      sx={{
        // Ensure this container doesn't capture scroll events
        overflow: 'visible',
        touchAction: 'inherit',
        overscrollBehavior: 'none',
        transform: 'none',
        willChange: 'auto'
      }}
    >
      <Flex align="center" w="100%" my={{ base: 1, md: 1.5 }}>
        <Box flex="1" h="1px" bg="var(--color-border-light)" opacity={0.4} />
        <Text
          px={{ base: 2, md: 3 }}
          py={0.5}
          fontSize={FONT_SIZES.timestamp}
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
        sx={{
          // Ensure this container doesn't capture scroll events
          overflow: 'visible',
          touchAction: 'inherit',
          overscrollBehavior: 'none'
        }}
      >
        <Box
          bg={messageStyles.bg}
          color={messageStyles.color}
          px={{ base: 3, md: 4 }}
          py={{ base: 2.5, md: 3 }}
          borderRadius={messageStyles.borderRadius}
          w={{
            base: isUser ? "94%" : "97%",
            sm: isUser ? "92%" : "97%",
            md: isUser ? "88%" : "97%",
            lg: isUser ? "85%" : "97%"
          }}
          maxW={{
            base: isUser ? "94%" : "97%",
            sm: isUser ? "92%" : "97%",
            md: isUser ? "88%" : "97%",
            lg: isUser ? "85%" : "97%"
          }}
          minW={{
            base: isUser ? "94%" : "97%",
            sm: isUser ? "92%" : "97%",
            md: isUser ? "88%" : "97%",
            lg: isUser ? "85%" : "97%"
          }}
          position="relative"
          boxShadow={messageStyles.shadow}
          border={messageStyles.border}
          backdropFilter={isUser ? "none" : "blur(20px)"}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          minH={{ base: "44px", md: "auto" }}
          sx={{
            // Simple styling without scroll interference
            overflowWrap: "break-word",
            wordWrap: "break-word",
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Ensure this container doesn't capture scroll events
            overflow: 'visible',
            touchAction: 'inherit',
            overscrollBehavior: 'none',
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
          _hover={{
            transform: isUser ? "translateY(-2px) scale(1.02)" : "translateY(-1px) scale(1.01)",
            boxShadow: isUser
              ? "var(--shadow-brand-hover), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
              : "var(--shadow-card-hover), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
          }}
        >
          {!isUser && !isError && !isLoading && message.metadata && (
            <Box mb={1.5}>
              <VStack
                spacing={1.5}
                align="stretch"
                sx={{
                  // Ensure this container doesn't capture scroll events
                  overflow: 'visible',
                  touchAction: 'inherit',
                  overscrollBehavior: 'none'
                }}
              >
                <Flex justify="space-between" align="center" p={{ base: 2, md: 3 }} bg="rgba(255, 255, 255, 0.9)" borderRadius="lg" border="1px solid" borderColor="rgba(226, 232, 240, 0.4)" position="relative" backdropFilter="blur(20px)" sx={{ WebkitBackdropFilter: 'blur(20px)', '@keyframes shimmer': { '0%, 100%': { opacity: 0.2 }, '50%': { opacity: 0.4 } } }} overflow="hidden" _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.3) 50%, transparent 100%)', animation: 'shimmer 4s ease-in-out infinite' }}>
                  <HStack justify="space-between" align="center" w="100%" spacing={2}>
                    <HStack spacing={2}>
                      <Box w="5px" h="5px" borderRadius="full" bg="linear-gradient(45deg, #94A3B8, #64748B)" boxShadow="0 0 4px rgba(148, 163, 184, 0.3)" animation="pulse 3s ease-in-out infinite" sx={{ '@keyframes pulse': { '0%, 100%': { transform: 'scale(1)', opacity: 0.7 }, '50%': { transform: 'scale(1.1)', opacity: 0.9 } } }} />
                      <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="#475569" letterSpacing="-0.025em">AI Ensemble</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Button
                          size="xs"
                          onClick={() => {
                            console.log('Analytics button clicked, ensembleData:', message.metadata?.ensembleData);
                            setIsEnhancedAnalyticsOpen(true);
                          }}
                          bg="white"
                          color="#4F9CF9"
                          fontWeight="600"
                          fontSize={FONT_SIZES.analytics}
                          border="1px solid rgba(79, 156, 249, 0.25)"
                          boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                          minH="26px"
                          px={2.5}
                          py={1}
                          h="26px"
                          borderRadius="md"
                          transition="all 0.15s ease"
                          letterSpacing="-0.01em"
                          sx={{
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                          _hover={{
                            bg: "#4F9CF9",
                            borderColor: "#4F9CF9",
                            color: "white",
                            transform: "translateY(-0.5px)",
                            boxShadow: "0 2px 8px rgba(79, 156, 249, 0.2)"
                          }}
                          _active={{
                            transform: "translateY(0)",
                            boxShadow: "0 1px 2px rgba(79, 156, 249, 0.2)"
                          }}
                          _focus={{
                            boxShadow: "0 0 0 2px rgba(79, 156, 249, 0.3)",
                            outline: "none"
                          }}
                        >
                          Analytics
                        </Button>

                        {hasIndividualResponses && (
                          <Button
                            size="xs"
                            onClick={() => setIsComparisonModalOpen(true)}
                            bg="white"
                            color="#8B5CF6"
                            fontWeight="600"
                            fontSize={FONT_SIZES.analytics}
                            border="1px solid rgba(139, 92, 246, 0.25)"
                            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                            minH="26px"
                            px={2.5}
                            py={1}
                            h="26px"
                            borderRadius="md"
                            transition="all 0.15s ease"
                            letterSpacing="-0.01em"
                            sx={{
                              touchAction: 'manipulation',
                              WebkitTapHighlightColor: 'transparent'
                            }}
                            _hover={{
                              bg: "#8B5CF6",
                              borderColor: "#8B5CF6",
                              color: "white",
                              transform: "translateY(-0.5px)",
                              boxShadow: "0 2px 8px rgba(139, 92, 246, 0.2)"
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 1px 2px rgba(139, 92, 246, 0.2)"
                            }}
                            _focus={{
                              boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.3)",
                              outline: "none"
                            }}
                          >
                            Compare
                          </Button>
                        )}
                      </HStack>
                  </HStack>
                </Flex>

                {/* Response Selector - Only show if individual responses are available */}
                {hasIndividualResponses && (
                  <Flex justify="center" px={{ base: 2, md: 3 }} pb={2}>
                    <Box>
                      <Button
                        size="xs"
                        variant="ghost"
                        rightIcon={<Box as="span" fontSize="xs">▼</Box>}
                        color="#64748B"
                        fontWeight="500"
                        fontSize="xs"
                        _hover={{ bg: "rgba(100, 116, 139, 0.1)" }}
                        onClick={() => {
                          // Cycle through responses: Synthesized -> Model 1 -> Model 2 -> ... -> Synthesized
                          const nextIndex = selectedResponseIndex === -1
                            ? 0
                            : selectedResponseIndex + 1 >= individualResponses.length
                              ? -1
                              : selectedResponseIndex + 1;
                          setSelectedResponseIndex(nextIndex);
                        }}
                      >
                        {selectedResponseIndex === -1
                          ? "Synthesized"
                          : `${individualResponses[selectedResponseIndex]?.model || individualResponses[selectedResponseIndex]?.role || 'Model'} Response`
                        }
                      </Button>
                    </Box>
                  </Flex>
                )}

              </VStack>
            </Box>
          )}
          <Box
            className="chat-message-content"
            sx={{
              // Ensure text content doesn't interfere with parent scrolling
              touchAction: "manipulation",
              WebkitTouchCallout: "none",
              // Prevent text selection from blocking scroll gestures
              WebkitUserSelect: "text",
              userSelect: "text",
              // Ensure proper text wrapping
              wordWrap: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
              // Prevent any internal scrolling
              overflow: "visible",
              overflowX: "visible",
              overflowY: "visible",
              // Ensure content fits within container
              minWidth: 0,
              width: "100%",
              // Prevent scroll event capture
              overscrollBehavior: "auto",
              // Ensure no nested scroll containers
              WebkitOverflowScrolling: "auto"
            }}
          >
            {isLoading ? (
              <Loader variant="team" size="sm" />
            ) : isError ? (
              <AdvancedErrorHandler
                error={{
                  message: processedContent || 'An error occurred',
                  statusCode: message.metadata?.statusCode,
                  correlationId: message.metadata?.correlationId,
                  retryable: message.metadata?.retryable !== false
                }}
                onRetry={() => {
                  // Trigger retry from chat store
                  const { retryMessage } = useChatStore.getState();
                  retryMessage(message.id);
                }}
                context="chat"
                showRecoveryOptions={true}
              />
            ) : isUser ? (
              <Text
                fontSize={FONT_SIZES.content}
                lineHeight={{ base: "1.35", md: "1.4" }}
                fontWeight="500"
                letterSpacing="-0.01em"
                color="white"
                sx={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  touchAction: 'manipulation'
                }}
              >
                {displayText}
              </Text>
            ) : (
              <UnifiedAIResponse
                content={structuredResponse ? undefined : displayText}
                data={structuredResponse || undefined}
                fontSize={{
                  content: FONT_SIZES.content as any,
                  heading: { base: "15px", md: "16px" } as any,
                  code: FONT_SIZES.code as any,
                  small: FONT_SIZES.code as any
                }}
              />
            )}
          </Box>
          {!isUser && fullData && (
            <EnhancedConfidenceIndicator
              fullData={fullData}
              isCompact={true}
            />
          )}
          {!isUser && <HStack justify="flex-end" align="center" mt={1} spacing={1}><CopyButton text={displayContent} /></HStack>}
        </Box>
      </Flex>
      <LazyEnhancedAnalyticsModal
        isOpen={isEnhancedAnalyticsOpen}
        onClose={() => setIsEnhancedAnalyticsOpen(false)}
        analyticsData={message.metadata?.ensembleData}
      />
      <LazyResponseComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        responses={individualResponses}
        synthesizedResponse={displayText}
        onPreferenceSelect={(modelId: string, preference: 'like' | 'dislike') => {
          console.log(`User ${preference}d model ${modelId}`);
          // Here you could track user preferences for future model selection
        }}
      />
    </VStack>
  );
});

ChatMessage.displayName = 'ChatMessage';