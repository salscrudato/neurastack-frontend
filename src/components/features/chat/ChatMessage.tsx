/**
 * Simplified Chat Message Component
 *
 * Streamlined message display with better separation of concerns,
 * improved performance, and consistent styling.
 */

import {
    Badge,
    Box,
    Flex,
    HStack,
    IconButton,
    Text,
    Tooltip,
    useClipboard,
} from '@chakra-ui/react';
import { memo, useMemo, useState } from 'react';
import {
    PiBrainBold,
    PiCheckBold,
    PiCopyBold,
    PiSparkle
} from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { APP_CONFIG } from '../../../config/app';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';
import { useModelResponses } from '../../../hooks/useModelResponses';
import type { Message } from '../../../stores/useChatStore';
import { EnsembleInfoModal } from '../../EnsembleInfoModal';
import { IndividualModelModal } from '../../IndividualModelModal';
import { ModelResponseGrid } from '../../ModelResponseGrid';
import Modal from '../../ui/Modal/Modal';

// ============================================================================
// Types
// ============================================================================

interface ChatMessageProps {
  /** Message data */
  message: Message;

  /** Whether this is the first assistant message */
  isFirstAssistantMessage?: boolean;

  /** Whether message is highlighted */
  isHighlighted?: boolean;

  /** Custom message actions */
  customActions?: React.ReactNode;
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;

  // For older messages, show time
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ============================================================================
// Sub-components
// ============================================================================

const CopyButton: React.FC<{ text: string }> = memo(({ text }) => {
  const { onCopy, hasCopied } = useClipboard(text);
  const { config, triggerHaptic } = useOptimizedDevice();

  const handleCopy = () => {
    onCopy();
    if (config.shouldEnableHaptics) {
      triggerHaptic('SUCCESS');
    }
  };

  return (
    <Tooltip label={hasCopied ? 'Copied!' : 'Copy message'} placement="top">
      <IconButton
        icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />}
        aria-label="Copy message"
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        color={hasCopied ? APP_CONFIG.THEME.COLORS.SUCCESS : APP_CONFIG.THEME.COLORS.TEXT_SECONDARY}
        _hover={{
          bg: 'rgba(79, 156, 249, 0.1)',
          color: APP_CONFIG.THEME.COLORS.ACCENT,
        }}
        transition="all 0.2s ease"
      />
    </Tooltip>
  );
});

CopyButton.displayName = 'CopyButton';

// Enhanced Response Actions Component for better modal accessibility
const ResponseActions: React.FC<{
  models?: string[];
  ensembleData?: any;
  responseTime?: number;
  onEnsembleClick?: () => void;
  onIndividualModelsClick?: () => void;
  onIndividualModelClick?: (modelName: string) => void;
  modelResponses?: any[];
}> = memo(({ models, ensembleData, responseTime, onEnsembleClick, onIndividualModelsClick, onIndividualModelClick, modelResponses }) => {
  const { capabilities } = useOptimizedDevice();

  if (!models || models.length === 0) return null;

  const hasEnsembleData = ensembleData && (ensembleData.roles || ensembleData.metadata);
  const hasIndividualModels = models.length > 1;

  return (
    <Flex
      justify="space-between"
      align="center"
      mt={3}
      gap={3}
      flexWrap="wrap"
    >
      {/* Model Information and Actions */}
      <HStack spacing={2} flex={1}>
        {/* Enhanced Ensemble Badge with Better Visibility */}
        {hasEnsembleData && (
          <Tooltip
            label="View AI ensemble analysis and metrics"
            placement="top"
            hasArrow
            isDisabled={capabilities.isMobile} // Disable tooltips on mobile
          >
            <Badge
              variant="subtle"
              colorScheme="blue"
              fontSize={capabilities.isMobile ? "sm" : "xs"}
              px={capabilities.isMobile ? 5 : 4}
              py={capabilities.isMobile ? 3 : 2}
              minH={capabilities.isMobile ? "48px" : "36px"} // Larger touch target
              borderRadius="full"
              cursor="pointer"
              onClick={onEnsembleClick}
              bg="linear-gradient(135deg, rgba(79, 156, 249, 0.12) 0%, rgba(139, 92, 246, 0.1) 100%)"
              border="2px solid rgba(79, 156, 249, 0.3)"
              color="#4F9CF9"
              fontWeight="700"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              _hover={{
                bg: "linear-gradient(135deg, rgba(79, 156, 249, 0.18) 0%, rgba(139, 92, 246, 0.15) 100%)",
                transform: capabilities.isMobile ? 'scale(0.98)' : 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(79, 156, 249, 0.25), 0 2px 8px rgba(79, 156, 249, 0.15)',
                borderColor: "rgba(79, 156, 249, 0.4)",
              }}
              _active={{
                transform: capabilities.isMobile ? 'scale(0.95)' : 'translateY(0)',
              }}
              _focus={{
                outline: '2px solid var(--color-accent)',
                outlineOffset: '2px',
              }}
              transition="all 0.2s ease"
              aria-label={`View ensemble analysis for ${models.length} AI models`}
              role="button"
              tabIndex={0}
              sx={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <HStack spacing={1.5}>
                <PiSparkle size={capabilities.isMobile ? 16 : 14} />
                <Text>AI Ensemble</Text>
                {/* Subtle indicator for more info */}
                <Box
                  w="4px"
                  h="4px"
                  borderRadius="full"
                  bg="currentColor"
                  opacity={0.6}
                />
              </HStack>
            </Badge>
          </Tooltip>
        )}

        {/* Individual Models Badge */}
        {hasIndividualModels && (
          <Tooltip
            label={`View individual responses from ${models.length} models`}
            placement="top"
            hasArrow
            isDisabled={capabilities.isMobile} // Disable tooltips on mobile
          >
            <Badge
              variant="subtle"
              colorScheme="purple"
              fontSize="xs"
              px={capabilities.isMobile ? 4 : 3}
              py={capabilities.isMobile ? 2 : 1.5}
              minH={capabilities.isMobile ? "44px" : "auto"} // Better touch target
              borderRadius="full"
              cursor="pointer"
              onClick={onIndividualModelsClick}
              bg="linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(79, 156, 249, 0.08) 100%)"
              border="1px solid rgba(139, 92, 246, 0.2)"
              color="#8B5CF6"
              fontWeight="600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{
                bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(79, 156, 249, 0.12) 100%)",
                transform: capabilities.isMobile ? 'scale(0.98)' : 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
              }}
              _active={{
                transform: capabilities.isMobile ? 'scale(0.95)' : 'translateY(0)',
              }}
              _focus={{
                outline: '2px solid var(--color-secondary-500)',
                outlineOffset: '2px',
              }}
              transition="all 0.2s ease"
              aria-label={`View individual responses from ${models.length} models`}
              role="button"
              tabIndex={0}
              sx={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <HStack spacing={1}>
                <PiBrainBold size={12} />
                <Text>{models.length} Models</Text>
              </HStack>
            </Badge>
          </Tooltip>
        )}

        {/* Simple model count for single model responses */}
        {!hasEnsembleData && !hasIndividualModels && (
          <Badge
            variant="subtle"
            colorScheme="gray"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="md"
            color={APP_CONFIG.THEME.COLORS.TEXT_MUTED}
          >
            <HStack spacing={1}>
              <PiSparkle size={10} />
              <Text>1 model</Text>
            </HStack>
          </Badge>
        )}

        {/* Individual Model Quick Access Badges */}
        {modelResponses && modelResponses.length > 0 && onIndividualModelClick && (
          <HStack spacing={1} flexWrap="wrap">
            {modelResponses.slice(0, capabilities.isMobile ? 2 : 3).map((model) => (
              <Tooltip
                key={model.model}
                label={`View ${model.model} response`}
                placement="top"
                hasArrow
                isDisabled={capabilities.isMobile}
              >
                <Badge
                  variant="outline"
                  colorScheme={model.status === 'success' ? 'green' : model.status === 'failed' ? 'red' : 'yellow'}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => onIndividualModelClick(model.model)}
                  minH={capabilities.isMobile ? "32px" : "auto"}
                  display="flex"
                  alignItems="center"
                  _hover={{
                    bg: model.status === 'success' ? 'green.50' : model.status === 'failed' ? 'red.50' : 'yellow.50',
                    transform: 'scale(1.05)',
                  }}
                  _active={{
                    transform: 'scale(0.95)',
                  }}
                  transition="all 0.2s ease"
                  sx={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <Text fontSize="xs" fontWeight="600">
                    {model.provider?.toUpperCase() || model.model.split('-')[0].toUpperCase()}
                  </Text>
                </Badge>
              </Tooltip>
            ))}

            {/* Show more indicator if there are additional models */}
            {modelResponses.length > (capabilities.isMobile ? 2 : 3) && (
              <Badge
                variant="ghost"
                colorScheme="gray"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                cursor="pointer"
                onClick={onIndividualModelsClick}
                _hover={{
                  bg: 'gray.100',
                }}
              >
                <Text fontSize="xs">+{modelResponses.length - (capabilities.isMobile ? 2 : 3)}</Text>
              </Badge>
            )}
          </HStack>
        )}
      </HStack>

      {/* Response Time */}
      {responseTime && (
        <Text
          fontSize="xs"
          color={APP_CONFIG.THEME.COLORS.TEXT_MUTED}
          fontWeight="500"
          minW="fit-content"
        >
          {(responseTime / 1000).toFixed(1)}s
        </Text>
      )}
    </Flex>
  );
});

ResponseActions.displayName = 'ResponseActions';

// ============================================================================
// Main Component
// ============================================================================

export const ChatMessage: React.FC<ChatMessageProps> = memo(({
  message,
  // isFirstAssistantMessage = false,
  isHighlighted = false,
  customActions,
}) => {
  const { capabilities, config, triggerHaptic } = useOptimizedDevice();
  const [showEnsembleModal, setShowEnsembleModal] = useState(false);
  const [showIndividualModelsModal, setShowIndividualModelsModal] = useState(false);

  // Extract model responses for individual model modal
  const { modelResponses, selectedModel, isModalOpen, openModelModal, closeModelModal } =
    message.metadata?.individualResponses ?
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useModelResponses(
        message.metadata.individualResponses,
        message.metadata.modelsUsed,
        message.metadata.fallbackReasons,
        message.metadata.ensembleData
      ) :
      { modelResponses: [], selectedModel: null, isModalOpen: false, openModelModal: () => {}, closeModelModal: () => {} };

  // Message properties
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isAssistant = message.role === 'assistant';

  // Process message content
  const processedContent = useMemo(() => {
    if (isError) return message.text;
    return message.text || 'No content available';
  }, [message.text, isError]);

  // Message styling with modern design tokens
  const messageStyles = useMemo(() => {
    const baseStyles = {
      maxW: capabilities.isMobile ? '85%' : APP_CONFIG.CHAT.MESSAGE_BUBBLE.MAX_WIDTH,
      borderRadius: '18px',
      p: capabilities.isMobile ? 4 : 3,
      position: 'relative' as const,
      wordBreak: 'break-word' as const,
      transition: 'all 0.15s ease',
      fontSize: capabilities.isMobile ? 'md' : 'sm',
      lineHeight: '1.6',
    };

    // User message - iMessage-style blue bubble with sleek design
    if (isUser) {
      return {
        ...baseStyles,
        bg: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
        color: 'white',
        ml: 'auto',
        alignSelf: 'flex-end',
        maxW: capabilities.isMobile ? '75%' : '60%',
        boxShadow: '0 1px 2px rgba(0, 122, 255, 0.2)',
        border: 'none',
        borderRadius: '18px',
        // Reduced padding for sleeker look
        p: capabilities.isMobile ? 3 : 2.5,
        // Clean text styling
        fontWeight: '400',
        letterSpacing: 'normal',
        fontSize: capabilities.isMobile ? 'md' : 'sm',
        lineHeight: '1.4',
        textAlign: 'center' as const,
        // Minimal animations
        transition: 'all 0.15s ease',
        // Better mobile touch targets
        minH: capabilities.isMobile ? '40px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    }

    if (isError) {
      return {
        ...baseStyles,
        bg: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: APP_CONFIG.THEME.COLORS.ERROR,
        alignSelf: 'flex-start',
      };
    }



    // Assistant message - Modern, wider ChatGPT-like styling
    return {
      ...baseStyles,
      bg: '#ffffff',
      border: '1px solid #e5e7eb',
      color: '#374151',
      alignSelf: 'flex-start',
      maxW: capabilities.isMobile ? '95%' : '85%',
      borderRadius: '18px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      // Modern text styling
      fontWeight: '400',
      letterSpacing: '-0.01em',
      lineHeight: '1.7',
      fontSize: capabilities.isMobile ? 'md' : 'sm',
      // Enhanced padding for better readability
      p: capabilities.isMobile ? 5 : 4,
      // Minimal animations
      transition: 'all 0.15s ease',
      // Better mobile touch targets
      minH: capabilities.isMobile ? '44px' : 'auto',
    };
  }, [isUser, isError, isHighlighted, capabilities.isMobile]);

  // Markdown components for assistant messages
  const markdownComponents = useMemo(() => ({
    p: ({ children }: any) => (
      <Text
        mb={3}
        lineHeight="1.7"
        fontSize={capabilities.isMobile ? 'md' : 'sm'}
        color="#374151"
        fontWeight="400"
        letterSpacing="-0.01em"
      >
        {children}
      </Text>
    ),
    code: ({ children, className }: any) => {
      const isInline = !className;
      return (
        <Box
          as={isInline ? 'code' : 'pre'}
          bg="#f8f9fa"
          border="1px solid #e9ecef"
          p={isInline ? 1.5 : 4}
          borderRadius={isInline ? '6px' : '12px'}
          fontSize="sm"
          fontFamily="'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
          overflowX={isInline ? 'visible' : 'auto'}
          whiteSpace={isInline ? 'nowrap' : 'pre'}
          display={isInline ? 'inline' : 'block'}
          color="#1f2937"
          fontWeight="500"
        >
          {children}
        </Box>
      );
    },
    ul: ({ children }: any) => (
      <Box as="ul" pl={5} mb={3} sx={{
        '& li': {
          mb: 1.5,
          lineHeight: '1.6',
          color: '#374151'
        }
      }}>
        {children}
      </Box>
    ),
    ol: ({ children }: any) => (
      <Box as="ol" pl={5} mb={3} sx={{
        '& li': {
          mb: 1.5,
          lineHeight: '1.6',
          color: '#374151'
        }
      }}>
        {children}
      </Box>
    ),
    h1: ({ children }: any) => (
      <Text fontSize="xl" fontWeight="600" mb={3} color="#1f2937" lineHeight="1.4">
        {children}
      </Text>
    ),
    h2: ({ children }: any) => (
      <Text fontSize="lg" fontWeight="600" mb={2.5} color="#1f2937" lineHeight="1.4">
        {children}
      </Text>
    ),
    h3: ({ children }: any) => (
      <Text fontSize="md" fontWeight="600" mb={2} color="#1f2937" lineHeight="1.4">
        {children}
      </Text>
    ),
    li: ({ children }: any) => (
      <Box as="li" mb={1}>
        {children}
      </Box>
    ),
  }), [capabilities.isMobile]);

  // Handle ensemble modal
  const handleEnsembleClick = () => {
    if (config.shouldEnableHaptics) {
      triggerHaptic('TAP');
    }
    setShowEnsembleModal(true);
  };

  // Handle individual models modal
  const handleIndividualModelsClick = () => {
    if (config.shouldEnableHaptics) {
      triggerHaptic('TAP');
    }
    setShowIndividualModelsModal(true);
  };

  // Handle individual model click - direct access to specific model modal
  const handleIndividualModelClick = (modelName: string) => {
    if (config.shouldEnableHaptics) {
      triggerHaptic('TAP');
    }

    // Find the specific model in the responses
    const targetModel = modelResponses.find(model => model.model === modelName);
    if (targetModel) {
      openModelModal(targetModel);
    }
  };

  return (
    <>
      <Flex
        direction="column"
        align={isUser ? 'flex-end' : 'flex-start'}
        mb={4}
        w="100%"
        sx={{
          // Performance optimizations
          contain: 'layout style',
          willChange: 'auto',
        }}
      >
        {/* Timestamp */}
        <Text
          fontSize="xs"
          color="#9ca3af"
          mb={1}
          fontWeight="400"
          alignSelf={isUser ? 'flex-end' : 'flex-start'}
          px={2}
        >
          {formatTimestamp(message.timestamp)}
        </Text>

        {/* Message Bubble */}
        <Box {...messageStyles}>
          {/* Ensemble Indicator */}
          {isAssistant && message.metadata?.ensembleData && (
            <Flex
              align="center"
              gap={2}
              mb={3}
              pb={2}
              borderBottom="1px solid"
              borderColor="rgba(79, 156, 249, 0.15)"
            >
              <PiSparkle
                size={16}
                color="#4F9CF9"
              />
              <Text
                fontSize="xs"
                fontWeight="600"
                color="#4F9CF9"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                AI Ensemble Response
              </Text>
              <Box
                w="6px"
                h="6px"
                borderRadius="full"
                bg="#4F9CF9"
                opacity={0.6}
                animation="pulse 2s infinite"
              />
            </Flex>
          )}

          {/* Content */}
          {isAssistant && !isError ? (
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {processedContent}
            </ReactMarkdown>
          ) : (
            <Text
              fontSize={capabilities.isMobile ? 'md' : 'sm'}
              lineHeight={isUser ? "1.4" : "1.6"}
              whiteSpace="pre-wrap"
              textAlign={isUser ? "center" : "left"}
              fontWeight={isUser ? "400" : "400"}
              color={isUser ? "white" : "#374151"}
            >
              {processedContent}
            </Text>
          )}

          {/* Enhanced Response Actions */}
          {isAssistant && message.metadata?.models && (
            <ResponseActions
              models={message.metadata.models}
              ensembleData={message.metadata.ensembleData}
              responseTime={message.metadata.responseTime}
              onEnsembleClick={handleEnsembleClick}
              onIndividualModelsClick={handleIndividualModelsClick}
              onIndividualModelClick={handleIndividualModelClick}
              modelResponses={modelResponses}
            />
          )}
        </Box>

        {/* Actions */}
        {!isUser && (
          <Flex
            justify="flex-start"
            align="center"
            mt={2}
            opacity={0.7}
            _hover={{ opacity: 1 }}
            transition="opacity 0.2s ease"
            gap={2}
          >
            <CopyButton text={processedContent} />

            {/* Ensemble Info Button - Prominent Access */}
            {message.metadata?.ensembleData && (
              <Tooltip
                label="View ensemble analysis"
                placement="top"
                hasArrow
                isDisabled={capabilities.isMobile}
              >
                <IconButton
                  icon={<PiSparkle />}
                  aria-label="View ensemble analysis"
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={handleEnsembleClick}
                  borderRadius="full"
                  minW={capabilities.isMobile ? "44px" : "32px"}
                  h={capabilities.isMobile ? "44px" : "32px"}
                  _hover={{
                    bg: "rgba(79, 156, 249, 0.1)",
                    transform: "scale(1.05)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                  transition="all 0.2s ease"
                  sx={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                />
              </Tooltip>
            )}

            {/* Individual Model Quick Access Buttons */}
            {modelResponses && modelResponses.length > 0 && (
              <HStack spacing={1}>
                {modelResponses.slice(0, capabilities.isMobile ? 2 : 3).map((model) => (
                  <Tooltip
                    key={model.model}
                    label={`${model.provider || model.model} - ${model.status}`}
                    placement="top"
                    hasArrow
                    isDisabled={capabilities.isMobile}
                  >
                    <IconButton
                      icon={<PiBrainBold />}
                      aria-label={`View ${model.model} response`}
                      size="sm"
                      variant="ghost"
                      colorScheme={model.status === 'success' ? 'green' : model.status === 'failed' ? 'red' : 'yellow'}
                      onClick={() => handleIndividualModelClick(model.model)}
                      borderRadius="full"
                      minW={capabilities.isMobile ? "36px" : "28px"}
                      h={capabilities.isMobile ? "36px" : "28px"}
                      fontSize="xs"
                      _hover={{
                        bg: model.status === 'success' ? 'rgba(34, 197, 94, 0.1)' :
                            model.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' :
                            'rgba(245, 158, 11, 0.1)',
                        transform: "scale(1.05)",
                      }}
                      _active={{
                        transform: "scale(0.95)",
                      }}
                      transition="all 0.2s ease"
                      sx={{
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    />
                  </Tooltip>
                ))}

                {/* Show all models button if there are more */}
                {modelResponses.length > (capabilities.isMobile ? 2 : 3) && (
                  <Tooltip
                    label="View all model responses"
                    placement="top"
                    hasArrow
                    isDisabled={capabilities.isMobile}
                  >
                    <IconButton
                      icon={<Text fontSize="xs" fontWeight="bold">+{modelResponses.length - (capabilities.isMobile ? 2 : 3)}</Text>}
                      aria-label="View all model responses"
                      size="sm"
                      variant="ghost"
                      colorScheme="gray"
                      onClick={handleIndividualModelsClick}
                      borderRadius="full"
                      minW={capabilities.isMobile ? "36px" : "28px"}
                      h={capabilities.isMobile ? "36px" : "28px"}
                      _hover={{
                        bg: "rgba(107, 114, 128, 0.1)",
                        transform: "scale(1.05)",
                      }}
                      _active={{
                        transform: "scale(0.95)",
                      }}
                      transition="all 0.2s ease"
                      sx={{
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    />
                  </Tooltip>
                )}
              </HStack>
            )}

            {customActions}
          </Flex>
        )}
      </Flex>

      {/* Enhanced Ensemble Modal */}
      {showEnsembleModal && message.metadata?.ensembleData && (
        <EnsembleInfoModal
          isOpen={showEnsembleModal}
          onClose={() => setShowEnsembleModal(false)}
          ensembleData={message.metadata.ensembleData}
        />
      )}

      {/* Individual Models Modal */}
      {showIndividualModelsModal && modelResponses.length > 0 && (
        <Modal
          isOpen={showIndividualModelsModal}
          onClose={() => setShowIndividualModelsModal(false)}
          title="Individual Model Responses"
          size="xl"
        >
          <Box>
            <Text mb={4} color={APP_CONFIG.THEME.COLORS.TEXT_SECONDARY}>
              View individual responses from each AI model in the ensemble.
            </Text>

            <ModelResponseGrid
              models={modelResponses}
              onModelClick={openModelModal}
              compact={capabilities.isMobile}
            />
          </Box>
        </Modal>
      )}

      {/* Individual Model Detail Modal */}
      {selectedModel && (
        <IndividualModelModal
          isOpen={isModalOpen}
          onClose={closeModelModal}
          modelData={selectedModel}
          allModels={modelResponses}
          onNavigateNext={() => {
            const currentIndex = modelResponses.findIndex((m: any) => m.model === selectedModel?.model);
            if (currentIndex < modelResponses.length - 1) {
              openModelModal(modelResponses[currentIndex + 1]);
            }
          }}
          onNavigatePrevious={() => {
            const currentIndex = modelResponses.findIndex((m: any) => m.model === selectedModel?.model);
            if (currentIndex > 0) {
              openModelModal(modelResponses[currentIndex - 1]);
            }
          }}
          canNavigateNext={(() => {
            const currentIndex = modelResponses.findIndex((m: any) => m.model === selectedModel?.model);
            return currentIndex < modelResponses.length - 1;
          })()}
          canNavigatePrevious={(() => {
            const currentIndex = modelResponses.findIndex((m: any) => m.model === selectedModel?.model);
            return currentIndex > 0;
          })()}
          currentIndex={modelResponses.findIndex((m: any) => m.model === selectedModel?.model)}
          totalModels={modelResponses.length}
        />
      )}
    </>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
