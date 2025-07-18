/**
 * Unified AI Response Component
 * 
 * Consolidates AIResponseFormatter and EnhancedAIResponse into a single,
 * optimized component for rendering AI responses with markdown support.
 */

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Code,
    Divider,
    HStack,
    ListItem,
    OrderedList,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    UnorderedList,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import { memo } from 'react';
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

interface FontSizeConfig {
  content: string | object;
  heading: string | object;
  code: string | object;
  small: string | object;
}

interface UnifiedAIResponseProps {
  content?: string;
  data?: AIResponseData;
  fontSize?: FontSizeConfig;
}

// ============================================================================
// Default Font Sizes
// ============================================================================

const defaultFontSizes = {
  content: { base: "13px", md: "14px" },
  heading: { base: "15px", md: "16px" },
  code: { base: "11px", md: "12px" },
  small: { base: "11px", md: "12px" },
};

// ============================================================================
// Markdown Components
// ============================================================================

const createMarkdownComponents = (fontSize: any) => ({
  p: ({ children }: any) => (
    <Text
      fontSize={fontSize.content}
      lineHeight={{ base: "1.45", md: "1.4" }}
      color="#1E293B"
      mb={2.5}
      sx={{
        '&:last-child': { mb: 0 },
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
      }}
    >
      {children}
    </Text>
  ),

  h1: ({ children }: any) => (
    <Text
      as="h1"
      fontSize={{ base: "16px", md: "17px" }}
      fontWeight="700"
      color="#0F172A"
      mb={3}
      mt={4}
      lineHeight="1.25"
      sx={{ '&:first-of-type': { mt: 0 } }}
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
      mb={2.5}
      mt={4}
      lineHeight="1.25"
      sx={{ '&:first-of-type': { mt: 0 } }}
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
      sx={{ '&:first-of-type': { mt: 0 } }}
    >
      {children}
    </Text>
  ),

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
        overflowX="auto"
        overflowY="visible"
        fontSize={fontSize.code}
        fontFamily="'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
        lineHeight="1.5"
        sx={{
          // Mobile-friendly scrolling for code blocks
          touchAction: 'pan-x',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bg: '#F1F5F9',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: '#CBD5E1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bg: '#94A3B8',
          },
        }}
      >
        <Text as="code" color="#475569" whiteSpace="pre-wrap">
          {children}
        </Text>
      </Box>
    );
  },

  table: ({ children }: any) => (
    <TableContainer
      mb={3}
      overflowX="auto"
      sx={{
        // Mobile-friendly table scrolling
        touchAction: 'pan-x',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          bg: '#F1F5F9',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          bg: '#CBD5E1',
          borderRadius: '3px',
        },
      }}
    >
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

  hr: () => (
    <Divider
      my={4}
      borderColor="#E2E8F0"
      borderWidth="1px"
    />
  ),

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
  
  const shouldRenderStructured = data && (data.ensembleMode || data.ensembleMetadata);
  const contentToRender = content || data?.answer || '';
  
  const markdownComponents = createMarkdownComponents(fontSize);

  if (shouldRenderStructured && data) {
    return (
      <VStack align="stretch" spacing={4} w="100%">
        <Box>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {data.answer}
          </ReactMarkdown>
        </Box>

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

  return (
    <Box
      w="100%"
      className="ai-response-content"
      sx={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
        // Prevent scrolling conflicts on mobile
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        // Ensure content doesn't create internal scrollable areas
        overflow: 'visible',
        minWidth: 0,
        '& > *:first-of-type': { mt: 0 },
        '& > *:last-child': { mb: 0 },
        // Ensure all child elements follow mobile-friendly scrolling
        '& *': {
          touchAction: 'manipulation',
          overflowX: 'hidden',
          overflowY: 'visible'
        }
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