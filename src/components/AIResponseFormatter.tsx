import { memo } from 'react';
import {
  Box,
  Text,
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
  Divider,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIResponseFormatterProps {
  content: string;
  fontSize?: {
    content: any;
    heading: any;
    code: any;
    small: any;
  };
}

const defaultFontSizes = {
  content: { base: "14px", md: "15px" },
  heading: { base: "16px", md: "18px" },
  code: { base: "12px", md: "13px" },
  small: { base: "12px", md: "13px" },
};

export const AIResponseFormatter = memo(({ 
  content, 
  fontSize = defaultFontSizes 
}: AIResponseFormatterProps) => {
  
  // Mobile-optimized markdown components
  const mobileOptimizedComponents = {
    // Headings with mobile-first sizing
    h1: ({ children }: any) => (
      <Text
        as="h1"
        fontSize={{ base: "18px", md: "20px" }}
        fontWeight="700"
        color="#0F172A"
        mb={3}
        mt={4}
        lineHeight="1.3"
        letterSpacing="-0.025em"
      >
        {children}
      </Text>
    ),
    h2: ({ children }: any) => (
      <Text
        as="h2"
        fontSize={{ base: "16px", md: "18px" }}
        fontWeight="600"
        color="#1E293B"
        mb={2}
        mt={3}
        lineHeight="1.3"
        letterSpacing="-0.025em"
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
        mt={3}
        lineHeight="1.4"
      >
        {children}
      </Text>
    ),
    h4: ({ children }: any) => (
      <Text
        as="h4"
        fontSize={fontSize.content}
        fontWeight="600"
        color="#475569"
        mb={1.5}
        mt={2}
        lineHeight="1.4"
      >
        {children}
      </Text>
    ),

    // Paragraphs with optimal mobile spacing
    p: ({ children }: any) => (
      <Text
        mb={3}
        fontSize={fontSize.content}
        lineHeight={{ base: "1.6", md: "1.5" }}
        color="#1E293B"
        wordBreak="break-word"
      >
        {children}
      </Text>
    ),

    // Mobile-optimized lists
    ul: ({ children }: any) => (
      <UnorderedList
        pl={{ base: 4, md: 5 }}
        mb={3}
        spacing={1}
        styleType="disc"
      >
        {children}
      </UnorderedList>
    ),
    ol: ({ children }: any) => (
      <OrderedList
        pl={{ base: 4, md: 5 }}
        mb={3}
        spacing={1}
      >
        {children}
      </OrderedList>
    ),
    li: ({ children }: any) => (
      <ListItem
        fontSize={fontSize.content}
        lineHeight={{ base: "1.6", md: "1.5" }}
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
          // Mobile scroll optimization
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
    thead: ({ children }: any) => <Thead bg="#F8FAFC">{children}</Thead>,
    tbody: ({ children }: any) => <Tbody>{children}</Tbody>,
    tr: ({ children }: any) => <Tr>{children}</Tr>,
    th: ({ children }: any) => (
      <Th
        fontSize={fontSize.small}
        fontWeight="600"
        color="#475569"
        borderColor="#E2E8F0"
        py={3}
      >
        {children}
      </Th>
    ),
    td: ({ children }: any) => (
      <Td
        fontSize={fontSize.content}
        color="#1E293B"
        borderColor="#E2E8F0"
        py={3}
        wordBreak="break-word"
      >
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
  };

  return (
    <Box
      w="100%"
      className="ai-response-content"
      sx={{
        // Ensure proper text wrapping on mobile
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
        // Optimize for mobile reading
        '& > *:first-child': {
          mt: 0,
        },
        '& > *:last-child': {
          mb: 0,
        },
        // Mobile-specific optimizations
        '@media (max-width: 768px)': {
          fontSize: '14px',
          lineHeight: '1.6',
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            marginTop: '1rem',
            marginBottom: '0.5rem',
            lineHeight: '1.3',
          },
          '& p': {
            marginBottom: '0.75rem',
            lineHeight: '1.6',
          },
          '& ul, & ol': {
            marginBottom: '0.75rem',
            paddingLeft: '1.25rem',
          },
          '& li': {
            marginBottom: '0.25rem',
            lineHeight: '1.5',
          },
          '& pre': {
            padding: '0.75rem',
            marginBottom: '0.75rem',
            fontSize: '12px',
            lineHeight: '1.4',
          },
          '& code': {
            fontSize: '12px',
            padding: '0.125rem 0.25rem',
          },
          '& blockquote': {
            margin: '0.75rem 0',
            padding: '0.75rem',
            borderLeftWidth: '3px',
          },
          '& table': {
            fontSize: '12px',
            marginBottom: '0.75rem',
          },
          '& th, & td': {
            padding: '0.5rem',
            wordBreak: 'break-word',
          },
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={mobileOptimizedComponents}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
});

AIResponseFormatter.displayName = 'AIResponseFormatter';
