/**
 * Unified AI Response Component
 * 
 * Consolidates AIResponseFormatter and EnhancedAIResponse into a single,
 * optimized component for rendering AI responses with markdown support.
 */

import { memo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useDisclosure,
  Code,
  UnorderedList,
  OrderedList,
  ListItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { PiClockBold } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ============================================================================
// Types
// ============================================================================

interface AIResponseData {
  answer: string;
  modelsUsed?: Record<string, boolean>;
  fallbackReasons?: Record<string, string>;
  executionTime?: string;
  ensembleMode?: boolean;
  ensembleMetadata?: {
    scientificAnalyst?: string;
    creativeAdvisor?: string;
    devilsAdvocate?: string;
    executionTime?: number;
  };
}

interface UnifiedAIResponseProps {
  content?: string;
  data?: AIResponseData;
  fontSize?: {
    content: any;
    heading: any;
    code: any;
    small: any;
  };
}

// ============================================================================
// Default Font Sizes
// ============================================================================

const defaultFontSizes = {
  content: { base: "14px", md: "15px" },
  heading: { base: "16px", md: "18px" },
  code: { base: "12px", md: "13px" },
  small: { base: "12px", md: "13px" },
};

// ============================================================================
// Markdown Components
// ============================================================================

const createMarkdownComponents = (fontSize: any) => ({
  // Enhanced paragraphs for mobile reading
  p: ({ children }: any) => (
    <Text
      fontSize={fontSize.content}
      lineHeight={{ base: "1.6", md: "1.5" }}
      color="#1E293B"
      mb={3}
      sx={{
        '&:last-child': { mb: 0 },
        // Better text wrapping on mobile
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
      }}
    >
      {children}
    </Text>
  ),

  // Mobile-optimized headings
  h1: ({ children }: any) => (
    <Text
      as="h1"
      fontSize={{ base: "18px", md: "20px" }}
      fontWeight="700"
      color="#0F172A"
      mb={4}
      mt={6}
      lineHeight="1.3"
      sx={{ '&:first-child': { mt: 0 } }}
    >
      {children}
    </Text>
  ),

  h2: ({ children }: any) => (
    <Text
      as="h2"
      fontSize={fontSize.heading}
      fontWeight="600"
      color="#1E293B"
      mb={3}
      mt={5}
      lineHeight="1.3"
      sx={{ '&:first-child': { mt: 0 } }}
    >
      {children}
    </Text>
  ),

  h3: ({ children }: any) => (
    <Text
      as="h3"
      fontSize={{ base: "15px", md: "16px" }}
      fontWeight="600"
      color="#334155"
      mb={2}
      mt={4}
      lineHeight="1.3"
      sx={{ '&:first-child': { mt: 0 } }}
    >
      {children}
    </Text>
  ),

  // Enhanced lists for mobile
  ul: ({ children }: any) => (
    <UnorderedList
      pl={{ base: 4, md: 5 }}
      mb={3}
      spacing={1}
      sx={{
        '& li::marker': {
          color: '#64748B',
          fontSize: '0.9em'
        }
      }}
    >
      {children}
    </UnorderedList>
  ),

  ol: ({ children }: any) => (
    <OrderedList
      pl={{ base: 4, md: 5 }}
      mb={3}
      spacing={1}
      sx={{
        '& li::marker': {
          color: '#64748B',
          fontWeight: '600'
        }
      }}
    >
      {children}
    </OrderedList>
  ),

  li: ({ children }: any) => (
    <ListItem
      fontSize={fontSize.content}
      lineHeight={{ base: "1.5", md: "1.4" }}
      color="#1E293B"
      mb={1}
    >
      {children}
    </ListItem>
  ),

  // Enhanced code blocks for mobile
  code: ({ children, className }: any) => {
    const isInline = !className;
    
    if (isInline) {
      return (
        <Code
          bg="#F1F5F9"
          color="#475569"
          px={1.5}
          py={0.5}
          borderRadius="md"
          fontSize={fontSize.code}
          fontFamily="'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
          wordBreak="break-all"
        >
          {children}
        </Code>
      );
    }

    return (
      <Box
        as="pre"
        bg="#F8FAFC"
        border="1px solid #E2E8F0"
        borderRadius="lg"
        p={{ base: 3, md: 4 }}
        mb={3}
        overflow="auto"
        fontSize={fontSize.code}
        fontFamily="'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
        lineHeight="1.5"
        sx={{
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bg: '#F1F5F9',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: '#CBD5E1',
            borderRadius: '4px',
          },
        }}
      >
        <Text as="code" color="#475569" whiteSpace="pre-wrap">
          {children}
        </Text>
      </Box>
    );
  },

  // Mobile-optimized tables
  table: ({ children }: any) => (
    <TableContainer mb={3} overflowX="auto">
      <Table size={{ base: "sm", md: "md" }} variant="simple">
        {children}
      </Table>
    </TableContainer>
  ),

  thead: ({ children }: any) => <Thead>{children}</Thead>,
  tbody: ({ children }: any) => <Tbody>{children}</Tbody>,
  tr: ({ children }: any) => <Tr>{children}</Tr>,
  th: ({ children }: any) => (
    <Th
      fontSize={fontSize.small}
      color="#475569"
      fontWeight="600"
      textTransform="none"
      letterSpacing="normal"
    >
      {children}
    </Th>
  ),
  td: ({ children }: any) => (
    <Td fontSize={fontSize.content} color="#1E293B">
      {children}
    </Td>
  ),

  // Enhanced blockquotes
  blockquote: ({ children }: any) => (
    <Box
      borderLeft="4px solid #4F9CF9"
      bg="rgba(79, 156, 249, 0.05)"
      pl={4}
      py={3}
      mb={3}
      borderRadius="md"
      ml={0}
    >
      <Text
        fontSize={fontSize.content}
        lineHeight={{ base: "1.6", md: "1.5" }}
        color="#475569"
        fontStyle="italic"
      >
        {children}
      </Text>
    </Box>
  ),

  // Horizontal rules
  hr: () => (
    <Divider
      my={4}
      borderColor="#E2E8F0"
      borderWidth="1px"
    />
  ),

  // Links with mobile-friendly styling
  a: ({ children, href }: any) => (
    <Text
      as="a"
      href={href}
      color="#4F9CF9"
      textDecoration="underline"
      textDecorationColor="rgba(79, 156, 249, 0.3)"
      textUnderlineOffset="2px"
      _hover={{
        color: "#3B82F6",
        textDecorationColor: "rgba(59, 130, 246, 0.5)",
      }}
      wordBreak="break-word"
    >
      {children}
    </Text>
  ),

  // Strong and emphasis
  strong: ({ children }: any) => (
    <Text as="strong" fontWeight="600" color="#0F172A">
      {children}
    </Text>
  ),
  em: ({ children }: any) => (
    <Text as="em" fontStyle="italic" color="#475569">
      {children}
    </Text>
  ),
});

// ============================================================================
// Main Component
// ============================================================================

export const UnifiedAIResponse = memo(({ 
  content,
  data,
  fontSize = defaultFontSizes 
}: UnifiedAIResponseProps) => {
  const { isOpen: isExpanded, onToggle } = useDisclosure({ defaultIsOpen: true });
  
  // Determine what to render
  const shouldRenderStructured = data && (data.ensembleMode || data.ensembleMetadata);
  const contentToRender = content || data?.answer || '';
  
  const markdownComponents = createMarkdownComponents(fontSize);

  // If structured data, render enhanced version
  if (shouldRenderStructured && data) {
    return (
      <VStack align="stretch" spacing={4} w="100%">
        {/* Main Response */}
        <Box>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {data.answer}
          </ReactMarkdown>
        </Box>

        {/* Ensemble Metadata (if available) */}
        {data.ensembleMetadata && (
          <Accordion allowToggle index={isExpanded ? 0 : -1}>
            <AccordionItem border="none">
              <AccordionButton
                onClick={onToggle}
                px={0}
                py={2}
                _hover={{ bg: 'transparent' }}
                justifyContent="flex-start"
              >
                <HStack spacing={2}>
                  <Text fontSize="sm" color="#64748B" fontWeight="500">
                    View Analysis Details
                  </Text>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
              <AccordionPanel px={0} py={3}>
                <VStack align="stretch" spacing={3}>
                  {data.ensembleMetadata.scientificAnalyst && (
                    <Box>
                      <Text fontSize="xs" color="#64748B" fontWeight="600" mb={1}>
                        SCIENTIFIC ANALYSIS
                      </Text>
                      <Text fontSize={fontSize.small} color="#475569">
                        {data.ensembleMetadata.scientificAnalyst}
                      </Text>
                    </Box>
                  )}
                  
                  {data.ensembleMetadata.creativeAdvisor && (
                    <Box>
                      <Text fontSize="xs" color="#64748B" fontWeight="600" mb={1}>
                        CREATIVE PERSPECTIVE
                      </Text>
                      <Text fontSize={fontSize.small} color="#475569">
                        {data.ensembleMetadata.creativeAdvisor}
                      </Text>
                    </Box>
                  )}
                  
                  {data.ensembleMetadata.devilsAdvocate && (
                    <Box>
                      <Text fontSize="xs" color="#64748B" fontWeight="600" mb={1}>
                        CRITICAL ANALYSIS
                      </Text>
                      <Text fontSize={fontSize.small} color="#475569">
                        {data.ensembleMetadata.devilsAdvocate}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}

        {/* Execution Info */}
        {(data.executionTime || data.ensembleMode) && (
          <HStack spacing={3} pt={2}>
            {data.ensembleMode && (
              <Badge
                colorScheme="blue"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                Ensemble Mode
              </Badge>
            )}
            {data.executionTime && (
              <HStack spacing={1}>
                <PiClockBold size={12} color="#64748B" />
                <Text fontSize="xs" color="#64748B">
                  {data.executionTime}
                </Text>
              </HStack>
            )}
          </HStack>
        )}
      </VStack>
    );
  }

  // Simple markdown rendering for regular content
  return (
    <Box
      w="100%"
      className="ai-response-content"
      sx={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
        '& > *:first-child': { mt: 0 },
        '& > *:last-child': { mb: 0 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {contentToRender}
      </ReactMarkdown>
    </Box>
  );
});

UnifiedAIResponse.displayName = 'UnifiedAIResponse';
