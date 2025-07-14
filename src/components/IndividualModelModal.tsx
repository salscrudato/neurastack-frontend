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
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useClipboard,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { useEffect } from 'react';
import {
  PiCheckBold,
  PiCopyBold,
  PiWarningBold
} from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ModelResponseData } from '../hooks/useModelResponses';
import { formatModelName } from '../hooks/useModelResponses';
import { commonModalProps, modalSizes } from './shared/modalConfig';

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
}

// ============================================================================
// Copy Button Component
// ============================================================================

interface CopyButtonProps {
  text: string;
}

function CopyButton({ text }: CopyButtonProps) {
  const { onCopy, hasCopied } = useClipboard(text);

  return (
    <IconButton
      aria-label="Copy response"
      icon={hasCopied ? <PiCheckBold size={16} /> : <PiCopyBold size={16} />}
      onClick={onCopy}
      size="sm"
      variant="ghost"
      colorScheme={hasCopied ? "green" : "gray"}
      borderRadius="lg"
      transition="all 0.2s ease"
      _hover={{
        bg: hasCopied ? "green.50" : "gray.100",
        transform: "scale(1.05)"
      }}
      _active={{
        transform: "scale(0.95)"
      }}
    />
  );
}

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
  modelData
}: IndividualModelModalProps) {
  // Modern color values - light mode only
  const modalBg = '#FFFFFF';
  const textColor = '#1E293B';

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
      size={modalSizes.small}
      {...commonModalProps}
    >
      <ModalOverlay
        bg="blackAlpha.700"
        backdropFilter="blur(8px)"
        onClick={onClose}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 'var(--z-modal-backdrop)',
          '&:hover': {
            bg: 'blackAlpha.750'
          }
        }}
      />
      <ModalContent
        bg={modalBg}
        borderRadius="2xl"
        maxH="90vh"
        maxW="700px"
        m={0}
        overflow="hidden"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
        border="1px solid"
        borderColor="rgba(226, 232, 240, 0.8)"
        sx={{
          zIndex: 'var(--z-modal)',
        }}
      >
        {/* Optimized Header */}
        <ModalHeader
          bg="linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)"
          borderTopRadius={{ base: "xl", md: "2xl" }}
          borderBottom="1px solid"
          borderColor="rgba(226, 232, 240, 0.6)"
          pb={4}
          pt={4}
          px={6}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" w="100%">
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                {formatModelName(modelData.model).toUpperCase()}
              </Text>
              {modelData.confidence && (
                <Badge
                  colorScheme={
                    modelData.confidence.level === 'high' ? 'green' :
                    modelData.confidence.level === 'medium' ? 'yellow' : 'red'
                  }
                  variant="solid"
                  size="sm"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="xs"
                >
                  {Math.round(modelData.confidence.score * 100)}% Confidence
                </Badge>
              )}
            </VStack>
          </Box>
        </ModalHeader>

        {/* Custom Close Button - Compact modal design */}
        <Box
          position="absolute"
          top={{ base: "16px", md: "20px" }}
          right={{ base: "16px", md: "20px" }}
          zIndex="calc(var(--z-modal) + 100)" // Higher z-index to ensure visibility
          sx={{
            // Force visibility
            display: 'block !important',
            visibility: 'visible !important',
            opacity: '1 !important',
          }}
        >
          <IconButton
            aria-label="Close modal"
            icon={<Text fontSize="18px" fontWeight="bold" color="#FFFFFF">×</Text>}
            onClick={onClose}
            w={{ base: "80px", md: "72px" }}
            h={{ base: "36px", md: "32px" }}
            borderRadius="lg"
            bg="#4F9CF9"
            border="2px solid #FFFFFF"
            boxShadow="0 4px 16px rgba(79, 156, 249, 0.3)"
            sx={{
              // Force visibility and positioning
              display: 'flex !important',
              visibility: 'visible !important',
              opacity: '1 !important',
              position: 'relative !important',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            _hover={{
              bg: "#3B82F6",
              transform: "scale(1.1)",
              boxShadow: "0 6px 20px rgba(79, 156, 249, 0.4)"
            }}
            _focus={{
              boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.5)",
              outline: "none"
            }}
            _active={{
              transform: "scale(0.95)",
              bg: "#2563EB"
            }}
          />
        </Box>

        {/* Body */}
        <ModalBody
          p={6}
          bg="#FAFBFC"
          overflowY="auto"
          maxH="100%"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '2px',
            },
          }}
        >
          <VStack spacing={6} align="stretch">
            {isFailed ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon as={PiWarningBold} />
                <Box>
                  <AlertTitle>Model Failed</AlertTitle>
                  <AlertDescription>
                    {modelData.errorReason || 'This model failed to generate a response.'}
                  </AlertDescription>
                </Box>
              </Alert>
            ) : (
              <>
                {/* Optimized Performance Metrics Grid */}
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={{ base: 4, md: 6 }}
                  border="1px solid"
                  borderColor="rgba(226, 232, 240, 0.6)"
                  boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                >
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor} mb={4}>
                    Performance Metrics
                  </Text>

                  <Box
                    display="grid"
                    gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                    gap={4}
                  >
                    {/* Metric 1: Response Quality */}
                    <Box
                      p={4}
                      bg="linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)"
                      borderRadius="xl"
                      border="1px solid rgba(226, 232, 240, 0.4)"
                      transition="all 0.2s ease"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    >
                      <Text fontSize="xs" fontWeight="600" color="#64748B" mb={1} textTransform="uppercase" letterSpacing="0.5px">
                        Quality
                      </Text>
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={1}>
                        {typeof modelData.quality === 'object' && modelData.quality?.complexity || 'Medium'}
                      </Text>
                      <Text fontSize="xs" color="#64748B" lineHeight="1.4">
                        Response structure & depth
                      </Text>
                    </Box>

                    {/* Metric 2: Semantic Confidence */}
                    <Box
                      p={4}
                      bg="linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)"
                      borderRadius="xl"
                      border="1px solid rgba(226, 232, 240, 0.4)"
                      transition="all 0.2s ease"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    >
                      <Text fontSize="xs" fontWeight="600" color="#64748B" mb={1} textTransform="uppercase" letterSpacing="0.5px">
                        Confidence
                      </Text>
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={1}>
                        {Math.round((modelData.confidence?.score || 0) * 100)}%
                      </Text>
                      <Text fontSize="xs" color="#64748B" lineHeight="1.4">
                        Semantic accuracy level
                      </Text>
                    </Box>

                    {/* Metric 3: Performance Stats */}
                    <Box
                      p={4}
                      bg="linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)"
                      borderRadius="xl"
                      border="1px solid rgba(226, 232, 240, 0.4)"
                      transition="all 0.2s ease"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    >
                      <Text fontSize="xs" fontWeight="600" color="#64748B" mb={1} textTransform="uppercase" letterSpacing="0.5px">
                        Performance
                      </Text>
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor} mb={1}>
                        {modelData.wordCount || 0}w / {modelData.responseTime || 0}ms
                      </Text>
                      <Text fontSize="xs" color="#64748B" lineHeight="1.4">
                        Words & response time
                      </Text>
                    </Box>
                  </Box>
                </Box>

                {/* Enhanced Model Response Content */}
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={{ base: 4, md: 6 }}
                  border="1px solid"
                  borderColor="rgba(226, 232, 240, 0.6)"
                  boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  color={textColor}
                  lineHeight="1.7"
                  position="relative"
                  sx={{
                    '& > *:first-of-type': { mt: 0 },
                    '& > *:last-child': { mb: 0 }
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                      Model Response
                    </Text>
                    <CopyButton text={modelData.answer} />
                  </Box>
                  <Box
                    sx={{
                      '& p': { mb: 3, lineHeight: '1.7', fontSize: { base: 'sm', md: 'md' } },
                      '& h1, & h2, & h3': { fontWeight: 'semibold', mb: 2, mt: 4 },
                      '& ul, & ol': { pl: 4, mb: 3 },
                      '& li': { mb: 1, lineHeight: '1.6' },
                      '& code': {
                        bg: 'gray.100',
                        px: 1,
                        py: 0.5,
                        borderRadius: 'sm',
                        fontSize: 'sm',
                        fontFamily: 'mono'
                      },
                      '& pre': {
                        bg: 'gray.50',
                        p: 3,
                        borderRadius: 'md',
                        overflow: 'auto',
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'gray.200'
                      }
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {modelData.answer}
                    </ReactMarkdown>
                  </Box>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
