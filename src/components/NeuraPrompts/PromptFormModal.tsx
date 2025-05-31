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
  Textarea,
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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { savePrompt, updatePrompt, type PersonalPrompt, type PromptFormData } from '../../services/promptsService';
import { usePromptOperations } from '../../hooks/usePrompts';

interface PromptFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editPrompt?: PersonalPrompt;
}

export default function PromptFormModal({
  isOpen,
  onClose,
  onSave,
  editPrompt
}: PromptFormModalProps) {
  const toast = useToast();
  const { executeOperation, loading } = usePromptOperations();
  
  const [formData, setFormData] = useState<PromptFormData>({
    title: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens/closes or edit prompt changes
  useEffect(() => {
    if (isOpen) {
      if (editPrompt) {
        setFormData({
          title: editPrompt.title,
          content: editPrompt.content,
          tags: [...editPrompt.tags]
        });
      } else {
        setFormData({
          title: '',
          content: '',
          tags: []
        });
      }
      setTagInput('');
    }
  }, [isOpen, editPrompt]);

  const handleInputChange = (field: keyof PromptFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
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

      if (editPrompt?.id) {
        // Update existing prompt
        await executeOperation(() => updatePrompt(editPrompt.id!, trimmedData));
        toast({
          title: 'Prompt updated',
          description: 'Your prompt has been successfully updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new prompt
        await executeOperation(() => savePrompt(trimmedData));
        toast({
          title: 'Prompt saved',
          description: 'Your prompt has been successfully saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: editPrompt ? 'Error updating prompt' : 'Error saving prompt',
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editPrompt ? 'Edit Prompt' : 'Create New Prompt'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Title */}
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title for your prompt"
                maxLength={100}
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
                placeholder="Enter your prompt here..."
                rows={6}
                resize="vertical"
                maxLength={2000}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formData.content.length}/2000 characters
              </Text>
            </FormControl>

            {/* Tags */}
            <FormControl>
              <FormLabel>Tags</FormLabel>
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Add tags (press Enter or comma to add)"
                    size="sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    isDisabled={!tagInput.trim()}
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
              <Text fontSize="xs" color="gray.500" mt={1}>
                Tags help organize and find your prompts. Use keywords like "coding", "writing", "analysis", etc.
              </Text>
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
            loadingText={editPrompt ? 'Updating...' : 'Saving...'}
          >
            {editPrompt ? 'Update Prompt' : 'Save Prompt'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
