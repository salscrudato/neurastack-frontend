/**
 * Individual Model Response Modal
 * 
 * A sophisticated modal component for displaying individual AI model responses
 * with navigation, copy functionality, and responsive design.
 */

import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Badge,
    Box,
    Flex,
    HStack,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    useClipboard,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { useEffect } from 'react';
import {
    PiArrowLeftBold,
    PiArrowRightBold,
    PiCheckBold,
    PiCopyBold,
    PiWarningBold
} from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ModelResponseData } from '../hooks/useModelResponses';
import { formatModelName } from '../hooks/useModelResponses';

// Modern animation keyframes for enhanced modal UX
const modalSlideIn = {
  from: {
    opacity: 0,
    transform: 'translateY(30px) scale(0.95)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
  },
};

// const fadeIn = {
//   from: { opacity: 0 },
//   to: { opacity: 1 },
// };

// ============================================================================
// Component Props
// ============================================================================

interface IndividualModelModalProps {
  /** Whether modal is open */
  isOpen: boolean;

  /** Close modal handler */
  onClose: () => void;

  /** Currently selected model data */
  modelData: ModelResponseData | null;

  /** All available models for navigation */
  allModels?: ModelResponseData[];

  /** Navigation handlers */
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;

  /** Navigation state */
  canNavigateNext?: boolean;
  canNavigatePrevious?: boolean;

  /** Current model index for display */
  currentIndex?: number;
  totalModels?: number;
}

// ============================================================================
// Sub-components
// ============================================================================

// Enhanced Copy Button with modern design
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <Tooltip label={hasCopied ? 'Copied!' : 'Copy response'} placement="top" hasArrow>
      <IconButton
        icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />}
        aria-label="Copy response"
        size="sm"
        variant="ghost"
        onClick={onCopy}
        color={hasCopied ? '#10B981' : '#64748B'}
        bg="rgba(255, 255, 255, 0.8)"
        border="1px solid rgba(226, 232, 240, 0.6)"
        borderRadius="lg"
        _hover={{
          bg: 'rgba(59, 130, 246, 0.08)',
          color: '#3b82f6',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        }}
        transition="all 0.2s ease"
        sx={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />
    </Tooltip>
  );
};

// Navigation Button Component
const NavigationButton: React.FC<{
  direction: 'previous' | 'next';
  onClick: () => void;
  disabled: boolean;
}> = ({ direction, onClick, disabled }) => {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? PiArrowLeftBold : PiArrowRightBold;

  return (
    <Tooltip
      label={isPrevious ? 'Previous model' : 'Next model'}
      placement="top"
      hasArrow
      isDisabled={disabled}
    >
      <IconButton
        icon={<Icon />}
        aria-label={`${direction} model`}
        size="md"
        variant="ghost"
        onClick={onClick}
        isDisabled={disabled}
        color={disabled ? '#CBD5E1' : '#64748B'}
        bg="rgba(255, 255, 255, 0.9)"
        border="1px solid rgba(226, 232, 240, 0.6)"
        borderRadius="xl"
        _hover={!disabled ? {
          bg: 'rgba(59, 130, 246, 0.08)',
          color: '#3b82f6',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        } : undefined}
        _disabled={{
          opacity: 0.4,
          cursor: 'not-allowed',
        }}
        transition="all 0.2s ease"
        sx={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />
    </Tooltip>
  );
};

// ============================================================================
// Markdown Components
// ============================================================================

const MarkdownComponents = {
  p: ({ children }: any) => (
    <Text mb={3} lineHeight="1.7" fontSize={{ base: "sm", md: "md" }}>
      {children}
    </Text>
  ),
  h1: ({ children }: any) => (
    <Text as="h1" fontSize="xl" fontWeight="bold" mb={4} mt={6}>
      {children}
    </Text>
  ),
  h2: ({ children }: any) => (
    <Text as="h2" fontSize="lg" fontWeight="semibold" mb={3} mt={5}>
      {children}
    </Text>
  ),
  h3: ({ children }: any) => (
    <Text as="h3" fontSize="md" fontWeight="medium" mb={2} mt={4}>
      {children}
    </Text>
  ),
  ul: ({ children }: any) => (
    <Box as="ul" pl={4} mb={3}>
      {children}
    </Box>
  ),
  ol: ({ children }: any) => (
    <Box as="ol" pl={4} mb={3}>
      {children}
    </Box>
  ),
  li: ({ children }: any) => (
    <Text as="li" mb={1} lineHeight="1.6">
      {children}
    </Text>
  ),
  code: ({ children, className }: any) => {
    // Move hooks to top level - this is a component function
    const inlineCodeBg = useColorModeValue('gray.100', 'gray.700');
    const blockCodeBg = useColorModeValue('gray.50', 'gray.800');
    const blockCodeBorder = useColorModeValue('gray.200', 'gray.600');

    const isInline = !className;
    return isInline ? (
      <Text
        as="code"
        bg={inlineCodeBg}
        px={1}
        py={0.5}
        borderRadius="sm"
        fontSize="sm"
        fontFamily="mono"
      >
        {children}
      </Text>
    ) : (
      <Box
        as="pre"
        bg={blockCodeBg}
        p={3}
        borderRadius="md"
        overflow="auto"
        mb={3}
        border="1px solid"
        borderColor={blockCodeBorder}
      >
        <Text as="code" fontSize="sm" fontFamily="mono">
          {children}
        </Text>
      </Box>
    );
  }
};

// ============================================================================
// Main Component
// ============================================================================

export function IndividualModelModal({
  isOpen,
  onClose,
  modelData,
  // allModels = [],
  onNavigateNext,
  onNavigatePrevious,
  canNavigateNext = false,
  canNavigatePrevious = false,
  currentIndex,
  totalModels
}: IndividualModelModalProps) {
  // Modern monochromatic color values
  const textColor = '#171717';

  // Keyboard navigation (simplified - only Escape to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Early return after all hooks
  if (!modelData) return null;

  const isFailed = modelData.status === 'failed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "lg" }}
      scrollBehavior="inside"
      closeOnOverlayClick={true}
      closeOnEsc={true}
      trapFocus={true}
      preserveScrollBarGap={true}
      returnFocusOnClose={true}
    >
      <ModalOverlay
        bg="rgba(0, 0, 0, 0.4)"
        sx={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />
      <ModalContent
        bg="#ffffff"
        borderRadius={{ base: 0, md: "20px" }}
        maxH={{ base: "100vh", md: "85vh" }}
        maxW={{ base: "100vw", md: "750px" }}
        mx={{ base: 0, md: 6 }}
        my={{ base: 0, md: "7.5vh" }}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(59, 130, 246, 0.08)"
        border="1px solid rgba(226, 232, 240, 0.6)"
        overflow="hidden"
        position="relative"
        sx={{
          animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '@keyframes modalSlideIn': modalSlideIn,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, rgba(37, 99, 235, 0.01) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
            borderRadius: '3xl',
            zIndex: -1,
            opacity: 0.6,
            filter: 'blur(1px)'
          }
        }}
      >
        {/* Enhanced Header with Glass Morphism */}
        <ModalHeader
          bg="linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)"
          borderTopRadius={{ base: 0, md: "3xl" }}
          borderBottom="1px solid rgba(255, 255, 255, 0.3)"
          borderColor="rgba(255, 255, 255, 0.3)"
          pb={8}
          pt={8}
          position="relative"
          zIndex={2}
          boxShadow="0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
          sx={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Navigation and Actions Bar */}
          <Flex justify="space-between" align="center" mb={4}>
            {/* Navigation Controls */}
            <HStack spacing={2}>
              {(canNavigatePrevious || canNavigateNext) && (
                <>
                  <NavigationButton
                    direction="previous"
                    onClick={onNavigatePrevious || (() => {})}
                    disabled={!canNavigatePrevious}
                  />
                  <NavigationButton
                    direction="next"
                    onClick={onNavigateNext || (() => {})}
                    disabled={!canNavigateNext}
                  />
                </>
              )}

              {/* Model Counter */}
              {currentIndex !== undefined && totalModels && (
                <Text
                  fontSize="sm"
                  color="#64748B"
                  fontWeight="600"
                  bg="rgba(255, 255, 255, 0.8)"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  border="1px solid rgba(226, 232, 240, 0.6)"
                  sx={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  {currentIndex + 1} of {totalModels}
                </Text>
              )}
            </HStack>

            {/* Copy Button */}
            <CopyButton text={modelData.answer} />
          </Flex>

          {/* Model Information */}
          <VStack spacing={3} align="center">
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="800"
              color="#1E293B"
              textAlign="center"
              letterSpacing="-0.02em"
              lineHeight="1.2"
              bgGradient="linear(135deg, #4F9CF9 0%, #8B5CF6 100%)"
              bgClip="text"
              sx={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {formatModelName(modelData.model, modelData.role, modelData.provider).toUpperCase()}
            </Text>

            {/* Confidence and Metrics */}
            <HStack spacing={3} flexWrap="wrap" justify="center">
              {modelData.confidence && (
                <Badge
                  bg={
                    modelData.confidence.level === 'high'
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' :
                    modelData.confidence.level === 'medium'
                      ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' :
                      'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }
                  color="white"
                  variant="solid"
                  size="md"
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  fontSize="xs"
                  fontWeight="700"
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  sx={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                >
                  {Math.round(modelData.confidence.score * 100)}% Confidence
                </Badge>
              )}

              {/* Response Time */}
              {modelData.responseTime && (
                <Badge
                  bg="linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)"
                  color="#2563EB"
                  variant="subtle"
                  size="md"
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  fontSize="xs"
                  fontWeight="600"
                  border="1px solid rgba(37, 99, 235, 0.2)"
                  sx={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                >
                  {(modelData.responseTime / 1000).toFixed(1)}s
                </Badge>
              )}

              {/* Word Count */}
              {modelData.wordCount && (
                <Badge
                  bg="linear-gradient(135deg, rgba(115, 115, 115, 0.1) 0%, rgba(115, 115, 115, 0.05) 100%)"
                  color="#737373"
                  variant="subtle"
                  size="md"
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  fontSize="xs"
                  fontWeight="600"
                  border="1px solid rgba(139, 92, 246, 0.2)"
                  sx={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                >
                  {modelData.wordCount} words
                </Badge>
              )}
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalCloseButton
          color="rgba(37, 99, 235, 0.8)"
          bg="linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)"
          border="1px solid rgba(255, 255, 255, 0.3)"
          borderRadius="full"
          w="48px"
          h="48px"
          fontSize="18px"
          fontWeight="bold"
          boxShadow="0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(37, 99, 235, 0.1)"
          _hover={{
            bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.95) 100%)",
            color: "white",
            borderColor: "rgba(239, 68, 68, 0.4)",
            transform: "scale(1.1)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(239, 68, 68, 0.3)"
          }}
          _focus={{
            boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.3), 0 8px 24px rgba(0, 0, 0, 0.15)",
            outline: "none"
          }}
          _active={{
            transform: "scale(1.05)",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(239, 68, 68, 0.2)"
          }}
          size="lg"
          zIndex={9999}
          position="absolute"
          top={6}
          right={6}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            willChange: 'transform, box-shadow',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        />

        {/* Enhanced Body with Glass Morphism */}
        <ModalBody
          p={8}
          bg="transparent"
          position="relative"
          zIndex={2}
        >
          {isFailed ? (
            <Alert
              status="error"
              borderRadius="2xl"
              bg="linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)"
              border="1px solid rgba(239, 68, 68, 0.3)"
              boxShadow="0 8px 32px rgba(239, 68, 68, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)"
              p={6}
              sx={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <AlertIcon as={PiWarningBold} color="#EF4444" boxSize={6} />
              <Box>
                <AlertTitle color="#DC2626" fontSize="lg" fontWeight="700" mb={2}>
                  Model Failed
                </AlertTitle>
                <AlertDescription color="#7F1D1D" fontSize="md" lineHeight="1.6">
                  {modelData.errorReason || 'This model failed to generate a response.'}
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Box
              bg="linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)"
              borderRadius="3xl"
              p={8}
              border="1px solid rgba(255, 255, 255, 0.3)"
              boxShadow="0 12px 40px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(37, 99, 235, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
              color={textColor}
              lineHeight="1.8"
              position="relative"
              overflow="hidden"
              sx={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                '& > *:first-of-type': { mt: 0 },
                '& > *:last-child': { mb: 0 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, rgba(37, 99, 235, 0.01) 100%)',
                  borderRadius: '3xl',
                  pointerEvents: 'none',
                  zIndex: 1
                }
              }}
            >
              <Box position="relative" zIndex={2}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {modelData.answer}
                </ReactMarkdown>
              </Box>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
