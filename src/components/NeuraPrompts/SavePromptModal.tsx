import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useToast,
  Text,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Textarea,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { savePrompt, type PromptFormData } from '../../services/promptsService';
import { usePromptOperations } from '../../hooks/usePrompts';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  initialContent?: string;
  initialTitle?: string;
}

export default function SavePromptModal({
  isOpen,
  onClose,
  onSave,
  initialContent = '',
  initialTitle = ''
}: SavePromptModalProps) {
  const toast = useToast();
  const { executeOperation, loading } = usePromptOperations();
  
  const [formData, setFormData] = useState<PromptFormData>({
    title: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialTitle,
        content: initialContent,
        tags: []
      });
      setTagInput('');
    }
  }, [isOpen, initialContent, initialTitle]);

  const handleInputChange = (field: keyof PromptFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your prompt',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter the prompt content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const trimmedData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
      };

      await executeOperation(() => savePrompt(trimmedData));
      
      toast({
        title: 'Prompt saved!',
        description: 'Your prompt has been added to your library',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSave?.();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error saving prompt',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setFormData({ title: '', content: '', tags: [] });
    setTagInput('');
    onClose();
  };

  // Auto-generate title suggestion based on content
  const generateTitleSuggestion = () => {
    if (!formData.content.trim()) return;
    
    const words = formData.content.trim().split(' ').slice(0, 6);
    const suggestion = words.join(' ') + (formData.content.split(' ').length > 6 ? '...' : '');
    
    if (suggestion.length > 50) {
      setFormData(prev => ({ ...prev, title: suggestion.substring(0, 47) + '...' }));
    } else {
      setFormData(prev => ({ ...prev, title: suggestion }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Save Prompt to Library</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Title */}
            <FormControl isRequired>
              <HStack justify="space-between" align="center">
                <FormLabel mb={0}>Title</FormLabel>
                {!formData.title && formData.content && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={generateTitleSuggestion}
                    color="blue.500"
                  >
                    Auto-generate
                  </Button>
                )}
              </HStack>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title"
                maxLength={100}
                mt={2}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formData.title.length}/100 characters
              </Text>
            </FormControl>

            {/* Content */}
            <FormControl isRequired>
              <FormLabel>Prompt Content</FormLabel>
              <Textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Your prompt content will appear here..."
                rows={4}
                resize="vertical"
                maxLength={2000}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formData.content.length}/2000 characters
              </Text>
            </FormControl>

            {/* Quick Tags */}
            <FormControl>
              <FormLabel>Tags (Optional)</FormLabel>
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Add tags to organize your prompt"
                    size="sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    isDisabled={!tagInput.trim() || formData.tags.length >= 10}
                  >
                    Add
                  </Button>
                </HStack>
                
                {formData.tags.length > 0 && (
                  <Box>
                    <Wrap spacing={2}>
                      {formData.tags.map((tag, index) => (
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
                  </Box>
                )}
              </VStack>
              
              {/* Quick tag suggestions */}
              <Box mt={2}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Quick tags:
                </Text>
                <Wrap spacing={1}>
                  {['coding', 'writing', 'analysis', 'creative', 'business', 'research'].map((tag) => (
                    <WrapItem key={tag}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          if (!formData.tags.includes(tag) && formData.tags.length < 10) {
                            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                          }
                        }}
                        isDisabled={formData.tags.includes(tag) || formData.tags.length >= 10}
                      >
                        {tag}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Saving..."
          >
            Save Prompt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
