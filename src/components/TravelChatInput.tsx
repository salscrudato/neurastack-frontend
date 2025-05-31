import {
  Box,
  Flex,
  Textarea,
  IconButton,
  useColorModeValue,
  HStack,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import { PiPaperPlaneRightFill, PiMagicWandBold, PiCalendarBold } from 'react-icons/pi';
import { useState, useRef, useEffect } from 'react';

interface TravelChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function TravelChatInput({
  onSend,
  isLoading = false,
  placeholder = "Where would you like to go?"
}: TravelChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const buttonBg = useColorModeValue('blue.500', 'blue.600');
  const buttonHoverBg = useColorModeValue('blue.600', 'blue.700');

  // Quick suggestions for travel queries
  const quickSuggestions = [
    "Find flights from NYC to Paris",
    "Hotels in Tokyo for next week",
    "Best restaurants in Rome",
    "Plan a weekend trip to San Francisco",
    "Cheap flights to Europe",
    "Luxury hotels in Bali"
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <Box
      px={{ base: 3, md: 4 }}
      py={{ base: 3, md: 4 }}
      bg={useColorModeValue('gray.50', 'gray.900')}
      borderTop="1px solid"
      borderColor={borderColor}
    >
      <Box maxW="4xl" mx="auto">
        {/* Quick Suggestions */}
        <HStack
          spacing={2}
          mb={3}
          overflowX="auto"
          pb={2}
          css={{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          <Popover placement="top-start">
            <PopoverTrigger>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<PiMagicWandBold />}
                flexShrink={0}
              >
                Suggestions
              </Button>
            </PopoverTrigger>
            <PopoverContent w="300px">
              <PopoverBody p={3}>
                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>
                    Try asking about:
                  </Text>
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="ghost"
                      justifyContent="flex-start"
                      onClick={() => handleSuggestionClick(suggestion)}
                      fontSize="xs"
                      h="auto"
                      py={2}
                      whiteSpace="normal"
                      textAlign="left"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          {/* Quick action buttons */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PiCalendarBold />}
            onClick={() => handleSuggestionClick("Plan a trip for next month")}
            flexShrink={0}
          >
            Plan Trip
          </Button>
          
          <Badge
            colorScheme="green"
            variant="subtle"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            flexShrink={0}
          >
            $0 Booking Fees
          </Badge>
        </HStack>

        {/* Input Area */}
        <Flex
          bg={bgColor}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          p={3}
          gap={3}
          align="flex-end"
          boxShadow="sm"
          _focusWithin={{
            borderColor: useColorModeValue('blue.500', 'blue.400'),
            boxShadow: useColorModeValue(
              '0 0 0 1px var(--chakra-colors-blue-500)',
              '0 0 0 1px var(--chakra-colors-blue-400)'
            ),
          }}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            resize="none"
            border="none"
            outline="none"
            _focus={{ boxShadow: 'none' }}
            _placeholder={{ color: placeholderColor }}
            fontSize={{ base: 'sm', md: 'md' }}
            minH="20px"
            maxH="120px"
            rows={1}
            disabled={isLoading}
          />

          <IconButton
            aria-label="Send message"
            icon={<PiPaperPlaneRightFill />}
            onClick={handleSubmit}
            isDisabled={!input.trim() || isLoading}
            isLoading={isLoading}
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            _disabled={{
              bg: useColorModeValue('gray.300', 'gray.600'),
              color: useColorModeValue('gray.500', 'gray.400'),
            }}
            size="sm"
            borderRadius="lg"
            flexShrink={0}
          />
        </Flex>

        {/* Input hints */}
        <HStack
          spacing={4}
          mt={2}
          fontSize="xs"
          color={useColorModeValue('gray.500', 'gray.400')}
          justify="center"
        >
          <Text>Press Enter to send</Text>
          <Text>•</Text>
          <Text>Shift + Enter for new line</Text>
        </HStack>
      </Box>
    </Box>
  );
}
