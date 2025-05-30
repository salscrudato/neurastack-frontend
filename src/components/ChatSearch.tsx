import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  VStack,
  Text,
  useColorModeValue,
  Collapse,
  HStack,
  Badge,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import type { Message } from '../store/useChatStore';

interface SearchResult {
  message: Message;
  matchIndex: number;
  snippet: string;
}

interface ChatSearchProps {
  onResultSelect?: (messageId: string) => void;
}

export default function ChatSearch({ onResultSelect }: ChatSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const messages = useChatStore(s => s.messages);
  const { isOpen, onToggle, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    messages.forEach((message) => {
      if (message.role === 'error') return; // Skip error messages

      const text = message.text.toLowerCase();
      const index = text.indexOf(term);

      if (index !== -1) {
        // Create snippet with context
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + term.length + 30);
        let snippet = message.text.slice(start, end);

        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';

        results.push({
          message,
          matchIndex: index,
          snippet,
        });
      }
    });

    return results;
  }, [searchTerm, messages]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentResultIndex(0);
    if (value.trim() && !isOpen) {
      onToggle();
    } else if (!value.trim() && isOpen) {
      onClose();
    }
  };

  const navigateResults = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
      newIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    }

    setCurrentResultIndex(newIndex);

    if (onResultSelect) {
      onResultSelect(searchResults[newIndex].message.id);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentResultIndex(0);
    onClose();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        navigateResults('prev');
      } else {
        navigateResults('next');
      }
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Auto-focus when component mounts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={100}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      p={3}
    >
      <VStack spacing={2} align="stretch">
        <InputGroup size="sm">
          <InputLeftElement>
            <SearchIcon color="gray.400" />
          </InputLeftElement>

          <Input
            ref={inputRef}
            placeholder="Search messages... (Ctrl+F)"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            bg={useColorModeValue('gray.50', 'gray.700')}
            border="1px solid"
            borderColor={borderColor}
            _focus={{
              borderColor: 'blue.400',
              boxShadow: '0 0 0 1px blue.400',
            }}
          />

          <InputRightElement width="auto" pr={2}>
            <HStack spacing={1}>
              {searchResults.length > 0 && (
                <>
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    fontSize="xs"
                    borderRadius="md"
                  >
                    {currentResultIndex + 1}/{searchResults.length}
                  </Badge>

                  <Tooltip label="Previous (Shift+Enter)" hasArrow>
                    <IconButton
                      aria-label="Previous result"
                      icon={<ChevronUpIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => navigateResults('prev')}
                      isDisabled={searchResults.length === 0}
                    />
                  </Tooltip>

                  <Tooltip label="Next (Enter)" hasArrow>
                    <IconButton
                      aria-label="Next result"
                      icon={<ChevronDownIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => navigateResults('next')}
                      isDisabled={searchResults.length === 0}
                    />
                  </Tooltip>
                </>
              )}

              {searchTerm && (
                <Tooltip label="Clear search (Esc)" hasArrow>
                  <IconButton
                    aria-label="Clear search"
                    icon={<CloseIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={clearSearch}
                  />
                </Tooltip>
              )}
            </HStack>
          </InputRightElement>
        </InputGroup>

        <Collapse in={isOpen && searchResults.length > 0} animateOpacity>
          <Box
            maxH="200px"
            overflowY="auto"
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
            p={2}
          >
            <VStack spacing={1} align="stretch">
              {searchResults.slice(0, 10).map((result, index) => (
                <Box
                  key={result.message.id}
                  p={2}
                  borderRadius="sm"
                  cursor="pointer"
                  bg={index === currentResultIndex ? 'blue.100' : 'transparent'}
                  _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                  onClick={() => {
                    setCurrentResultIndex(index);
                    if (onResultSelect) {
                      onResultSelect(result.message.id);
                    }
                  }}
                >
                  <HStack justify="space-between" align="start">
                    <Box flex={1}>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        {result.message.role === 'user' ? 'You' : 'Neurastack'} • {
                          new Date(result.message.timestamp).toLocaleTimeString()
                        }
                      </Text>
                      <Text fontSize="sm" noOfLines={2}>
                        {result.snippet}
                      </Text>
                    </Box>
                    {index === currentResultIndex && (
                      <Badge colorScheme="blue" size="sm">
                        Current
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ))}

              {searchResults.length > 10 && (
                <Text fontSize="xs" color="gray.500" textAlign="center" pt={2}>
                  Showing first 10 of {searchResults.length} results
                </Text>
              )}
            </VStack>
          </Box>
        </Collapse>
      </VStack>
    </Box>
  );
}
