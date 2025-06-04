import React from 'react';
import { Box, VStack, Text, Button, useToast } from '@chakra-ui/react';
import { EnhancedAIResponse } from './EnhancedAIResponse';

// Sample AI response data matching your example
const sampleAIResponse = {
  "answer": "Given your request for variations of Markdown responses that a software engineer can use to build a robust formatter for handling AI responses, I'll provide a concise set of examples and actionable insights tailored to your needs. The response is structured to offer practical guidance and diverse Markdown patterns for implementation.\n\n### Markdown Response Variations for Formatter Development\n\nBelow are examples of Markdown structures commonly found in AI responses, which you can use to test and build a robust formatter:\n\n1. **Basic Text and Headings**  \n   ```markdown\n   # Main Topic\n   This is a sample AI response with **bold text** and *italicized content* for emphasis.\n   ```\n\n2. **Lists (Ordered and Unordered)**  \n   ```markdown\n   - Item 1: A key point\n     - Nested item for deeper context\n   - Item 2: Another idea\n   1. First step\n   2. Second step\n   ```\n\n3. **Code Blocks**  \n   ```markdown\n   Here's a code snippet:\n   ```python\n   def format_response(text):\n       return text.strip()\n   ```\n   ```\n\n4. **Tables**  \n   ```markdown\n   | Feature       | Description            |\n   |---------------|------------------------|\n   | Formatting    | Handles bold, italics |\n   | Compatibility | Supports GFM          |\n   ```\n\n5. **Links and Quotes**  \n   ```markdown\n   > This is a quoted insight from the AI.\n   Learn more at [Markdown Guide](https://www.markdownguide.org).\n   ```\n\n### Actionable Insights for Building a Formatter\n\n- **Parse with ASTs**: Use Abstract Syntax Trees (via libraries like `markdown-it`) to break down Markdown into structural components for flexible formatting rules.\n- **Support Variations**: Ensure compatibility with CommonMark and GitHub Flavored Markdown by testing against diverse syntax (e.g., nested lists, malformed input).\n- **Sanitize Input**: Prevent security risks like XSS by sanitizing AI responses before rendering, using tools like DOMPurify.\n- **Handle Edge Cases**: Build fallback rendering for complex structures (e.g., nested tables) to maintain readability.\n- **Leverage Templates**: Use template engines like Jinja2 to standardize output styles for AI responses, ensuring consistent formatting.\n\n### Key Focus Areas\n\nStart by compiling a test suite of Markdown variations (like those above) to identify rendering issues. Prioritize platform compatibility (e.g., GitHub, Slack) and security to avoid vulnerabilities. These steps will help you create a robust, user-friendly formatter for AI-generated content.",
  "modelsUsed": {
    "openai:gpt-4": false,
    "google:gemini-1.5-flash": true,
    "xai:grok-3-mini": true
  },
  "fallbackReasons": {
    "openai:gpt-4": "Failed calling openai:gpt-4: Invalid character in header content [\"Authorization\"]"
  },
  "executionTime": "10840ms",
  "ensembleMode": true,
  "ensembleMetadata": {
    "scientificAnalyst": "[Failed]",
    "creativeAdvisor": "**1. Creative Insights:**\n\n* **Treat AI responses like code:**  Use Abstract Syntax Trees (ASTs) to parse the response's structure, identifying headers, lists, code blocks, etc., similar to how compilers handle code. This enables flexible formatting rules.\n* **Employ a template engine:**  Think of the AI response as data to be filled into pre-defined Markdown templates.  This allows for consistency and easy customization of output style.  Jinja2 or similar engines are suitable.\n* **Develop a \"Markdown dialect\":** Extend standard Markdown with custom tags for specific AI response elements (e.g., `<ai-code>`, `<ai-warning>`). This increases control over formatting and semantic highlighting.\n\n\n**2. Real-world Applications:**\n\n* **Consistent documentation:** Ensure AI-generated documentation maintains a unified style guide.\n* **Enhanced readability:** Improve the presentation of complex AI-generated reports, making them easier to digest.\n* **Automated report generation:** Generate formatted reports directly from AI outputs, reducing manual effort.\n\n\n**3. Implementation Ideas:**\n\n*   **AST-based parsing:** Use libraries like `markdown-it` with custom plugins for AST manipulation and formatting.\n*   **Template-based rendering:** Design reusable Markdown templates (e.g., for tables, code examples) and use a template engine to populate them.\n*   **Custom Markdown parser:** Build a parser that explicitly handles your \"Markdown dialect\" extensions.\n*   **Unit testing:** Rigorously test with diverse AI-generated responses to cover edge cases.",
    "devilsAdvocate": "I'm glad to help with building a robust markdown formatter for AI responses. Here are key considerations to strengthen your approach:\n\n1) **Key Risks/Concerns**: Overlooking diverse markdown syntax variations (e.g., headers, lists, code blocks) may lead to inconsistent formatting. Compatibility issues across platforms (GitHub, Slack, etc.) and security risks from unescaped user input (e.g., XSS attacks) are also concerns.\n\n2) **Potential Consequences**: Inconsistent formatting can confuse users or break rendering on different platforms. Security flaws might expose vulnerabilities, while incomplete handling of edge cases (e.g., nested structures) could degrade user experience.\n\n3) **Mitigation Strategies**:\n   - Compile a comprehensive list of markdown variations (e.g., CommonMark, GitHub Flavored Markdown) to ensure broad compatibility.\n   - Test formatter across multiple platforms to identify rendering discrepancies.\n   - Implement input sanitization to prevent security issues like script injection.\n   - Include edge case handling (e.g., nested lists, malformed syntax) with fallback rendering options.\n   - Use existing libraries (e.g., marked.js, markdown-it) to leverage tested solutions and reduce development risks.\n\nThese steps will help build a robust, secure, and user-friendly markdown formatter for AI responses.",
    "executionTime": 10838
  }
};

export const AIResponseDemo: React.FC = () => {
  const toast = useToast();

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleAIResponse, null, 2));
    toast({
      title: "JSON Copied",
      description: "Sample AI response JSON copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} maxW="4xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2} color="#0F172A">
            Enhanced AI Response Formatter Demo
          </Text>
          <Text color="#64748B" mb={4}>
            This demonstrates the mobile-optimized AI response formatting with structured data support.
          </Text>
          <Button onClick={handleCopyJSON} size="sm" colorScheme="blue">
            Copy Sample JSON
          </Button>
        </Box>

        <Box
          bg="#FFFFFF"
          border="1px solid #E2E8F0"
          borderRadius="xl"
          p={6}
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        >
          <EnhancedAIResponse data={sampleAIResponse} />
        </Box>
      </VStack>
    </Box>
  );
};
