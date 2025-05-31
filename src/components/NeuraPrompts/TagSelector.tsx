import {
  Box,
  Input,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Button,
  Text,
  VStack,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react';
import { useState } from 'react';
import { usePopularTags } from '../../hooks/usePrompts';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagSelector({
  selectedTags,
  onTagsChange,
  placeholder = "Filter by tags...",
  maxTags = 10
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const { tags: popularTags, loading: tagsLoading } = usePopularTags();
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !selectedTags.includes(normalizedTag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, normalizedTag]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      // Remove last tag when backspacing on empty input
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
    setInputValue('');
  };

  // Filter popular tags to show only unselected ones
  const availablePopularTags = popularTags.filter(
    ({ tag }) => !selectedTags.includes(tag)
  ).slice(0, 8); // Show top 8 unselected popular tags

  return (
    <VStack align="stretch" spacing={3}>
      {/* Input and Selected Tags */}
      <Box
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgColor}
        p={3}
        _focusWithin={{
          borderColor: 'blue.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
        }}
      >
        <VStack align="stretch" spacing={2}>
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <Wrap spacing={2}>
              {selectedTags.map((tag, index) => (
                <WrapItem key={index}>
                  <Tag
                    size="sm"
                    borderRadius="md"
                    variant="solid"
                    colorScheme="blue"
                  >
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}

          {/* Input */}
          <HStack>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleInputKeyPress}
              placeholder={selectedTags.length === 0 ? placeholder : "Add another tag..."}
              border="none"
              p={0}
              _focus={{ boxShadow: 'none' }}
              isDisabled={selectedTags.length >= maxTags}
            />
            
            {selectedTags.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                color={subtextColor}
              >
                Clear All
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>

      {/* Popular Tags */}
      {!tagsLoading && availablePopularTags.length > 0 && (
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              Popular Tags
            </Text>
            <Text fontSize="xs" color={subtextColor}>
              Click to add
            </Text>
          </HStack>
          
          <Wrap spacing={2}>
            {availablePopularTags.map(({ tag, count }, index) => (
              <WrapItem key={index}>
                <Popover trigger="hover" placement="top">
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTag(tag)}
                      isDisabled={selectedTags.length >= maxTags}
                      borderRadius="md"
                      fontWeight="normal"
                    >
                      {tag}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent w="auto">
                    <PopoverArrow />
                    <PopoverBody>
                      <Text fontSize="xs">
                        Used in {count} prompt{count !== 1 ? 's' : ''}
                      </Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}

      {/* Helper Text */}
      <HStack justify="space-between" fontSize="xs" color={subtextColor}>
        <Text>
          Press Enter, comma, or space to add tags
        </Text>
        <Text>
          {selectedTags.length}/{maxTags} tags
        </Text>
      </HStack>
    </VStack>
  );
}
