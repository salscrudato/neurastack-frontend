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
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { useEffect } from 'react';
import {
    PiWarningBold
} from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ModelResponseData } from '../hooks/useModelResponses';
import { formatModelName } from '../hooks/useModelResponses';

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
    const isInline = !className;
    return isInline ? (
      <Text
        as="code"
        bg={useColorModeValue('gray.100', 'gray.700')}
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
        bg={useColorModeValue('gray.50', 'gray.800')}
        p={3}
        borderRadius="md"
        overflow="auto"
        mb={3}
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
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
  const headerBg = '#F8FAFC';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const closeButtonColor = '#64748B';
  const closeButtonHoverColor = '#1E293B';
  const closeButtonHoverBg = '#F1F5F9';

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
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={modalBg}
        borderRadius={{ base: 0, md: "xl" }}
        maxH={{ base: "100vh", md: "70vh" }}
        maxW={{ base: "100vw", md: "600px" }}
        mx={{ base: 0, md: 4 }}
        my={{ base: 0, md: "15vh" }}
      >
        {/* Header */}
        <ModalHeader
          bg={headerBg}
          borderTopRadius={{ base: 0, md: "xl" }}
          borderBottom="1px solid"
          borderColor={borderColor}
          pb={4}
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {formatModelName(modelData.model, modelData.role, modelData.provider).toUpperCase()}
            </Text>
            {modelData.confidence && (
              <Badge
                colorScheme={
                  modelData.confidence.level === 'high' ? 'green' :
                  modelData.confidence.level === 'medium' ? 'yellow' : 'red'
                }
                variant="solid"
                size="md"
                borderRadius="full"
                px={3}
                py={1}
              >
                {Math.round(modelData.confidence.score * 100)}% Confidence
              </Badge>
            )}
          </VStack>
        </ModalHeader>

        <ModalCloseButton
          color={closeButtonColor}
          _hover={{
            color: closeButtonHoverColor,
            bg: closeButtonHoverBg
          }}
        />

        {/* Body */}
        <ModalBody p={6}>
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
            <Box
              color={textColor}
              lineHeight="1.7"
              sx={{
                '& > *:first-of-type': { mt: 0 },
                '& > *:last-child': { mb: 0 }
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {modelData.answer}
              </ReactMarkdown>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
