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
      size={{ base: "full", md: "lg" }}
      scrollBehavior="inside"
      isCentered={true}
      closeOnOverlayClick={true}
      closeOnEsc={true}
      trapFocus={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay
        bg="blackAlpha.600"
        backdropFilter="blur(4px)"
        onClick={onClose}
        sx={{
          // Ensure overlay covers full screen on mobile
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1400,
          cursor: 'pointer'
        }}
      />
      <ModalContent
        bg={modalBg}
        borderRadius={{ base: 0, md: "2xl" }}
        maxH={{ base: "100vh", md: "85vh" }}
        maxW={{ base: "100vw", md: "700px" }}
        mx={{ base: 0, md: 4 }}
        my={{ base: 0, md: "auto" }}
        position={{ base: "fixed", md: "relative" }}
        top={{ base: 0, md: "auto" }}
        left={{ base: 0, md: "auto" }}
        right={{ base: 0, md: "auto" }}
        bottom={{ base: 0, md: "auto" }}
        overflow="hidden"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
        border="1px solid"
        borderColor="rgba(226, 232, 240, 0.8)"
        sx={{
          // Ensure proper z-index and positioning
          zIndex: 1401,
          // Mobile-specific styles
          '@media (max-width: 768px)': {
            margin: 0,
            borderRadius: 0,
            height: '100vh',
            width: '100vw',
          }
        }}
      >
        {/* Header */}
        <ModalHeader
          bg="linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)"
          borderTopRadius={{ base: 0, md: "2xl" }}
          borderBottom="1px solid"
          borderColor="rgba(226, 232, 240, 0.6)"
          pb={6}
          pt={6}
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

        {/* Custom Close Button - More visible on mobile */}
        <IconButton
          aria-label="Close modal"
          icon={<Text fontSize="20px" fontWeight="bold" color="#FFFFFF">×</Text>}
          onClick={onClose}
          position="absolute"
          top={{ base: "16px", md: "20px" }}
          right={{ base: "16px", md: "20px" }}
          w={{ base: "48px", md: "44px" }}
          h={{ base: "48px", md: "44px" }}
          borderRadius="full"
          bg="#4F9CF9"
          border="2px solid #FFFFFF"
          boxShadow="0 4px 16px rgba(79, 156, 249, 0.3)"
          zIndex={1500}
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
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            // Ensure it's always visible on mobile
            '@media (max-width: 768px)': {
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 9999,
            }
          }}
        />

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
                {/* 3 Key Metrics Section - Following Integration Guide */}
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={6}
                  border="1px solid"
                  borderColor="rgba(226, 232, 240, 0.6)"
                  boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                >
                  <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                    Key Performance Metrics
                  </Text>

                  <VStack spacing={4} align="stretch">
                    {/* Metric 1: Response Quality */}
                    <Box p={4} bg="rgba(248, 250, 252, 0.8)" borderRadius="xl" border="1px solid rgba(226, 232, 240, 0.4)">
                      <Text fontSize="sm" fontWeight="600" color="#64748B" mb={1}>
                        Response Quality
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={textColor} mb={1}>
                        {typeof modelData.quality === 'object' && modelData.quality?.complexity || 'medium'}
                      </Text>
                      <Text fontSize="xs" color="#64748B">
                        Assessment of response structure and depth
                      </Text>
                    </Box>

                    {/* Metric 2: Semantic Confidence */}
                    <Box p={4} bg="rgba(248, 250, 252, 0.8)" borderRadius="xl" border="1px solid rgba(226, 232, 240, 0.4)">
                      <Text fontSize="sm" fontWeight="600" color="#64748B" mb={1}>
                        Semantic Confidence
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={textColor} mb={1}>
                        {Math.round((modelData.confidence?.score || 0) * 100)}%
                      </Text>
                      <Text fontSize="xs" color="#64748B">
                        AI model's confidence in semantic accuracy and relevance
                      </Text>
                    </Box>

                    {/* Metric 3: Word Efficiency */}
                    <Box p={4} bg="rgba(248, 250, 252, 0.8)" borderRadius="xl" border="1px solid rgba(226, 232, 240, 0.4)">
                      <Text fontSize="sm" fontWeight="600" color="#64748B" mb={1}>
                        Word Efficiency
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={textColor} mb={1}>
                        {modelData.wordCount || 0} words in {modelData.responseTime || 0}ms
                      </Text>
                      <Text fontSize="xs" color="#64748B">
                        Response length and generation speed efficiency
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Model Response Content */}
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={6}
                  border="1px solid"
                  borderColor="rgba(226, 232, 240, 0.6)"
                  boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  color={textColor}
                  lineHeight="1.7"
                  sx={{
                    '& > *:first-of-type': { mt: 0 },
                    '& > *:last-child': { mb: 0 }
                  }}
                >
                  <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                    Model Response
                  </Text>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {modelData.answer}
                  </ReactMarkdown>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
