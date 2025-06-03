import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
  Badge,
  useColorModeValue,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
} from '@chakra-ui/react';
import {
  PiPlayBold,
  PiPencilBold,
  PiTrashBold,
  PiShareBold,
  PiBookmarkBold,
  PiDotsThreeBold,
  PiCopyBold,
  PiTrendUpBold,
  PiUserBold,
} from 'react-icons/pi';
import { useState, useRef } from 'react';
import type { PersonalPrompt, CommunityPrompt } from '../../services/promptsService';
import {
  deletePrompt,
  sharePrompt,
  unsharePrompt,
  saveToPersonal,
  recordPromptUsage
} from '../../services/promptsService';
import { usePromptOperations } from '../../hooks/usePrompts';
import { useChatStore } from '../../store/useChatStore';
import { useNavigate } from 'react-router-dom';
import PromptFormModal from './PromptFormModal';

interface PromptCardProps {
  prompt: PersonalPrompt | CommunityPrompt;
  type: 'personal' | 'community' | 'trending';
  onUpdated?: () => void;
  onShared?: () => void;
}

export default function PromptCard({
  prompt,
  type,
  onUpdated,
  onShared
}: PromptCardProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const { sendMessage } = useChatStore();
  const { executeOperation, loading } = usePromptOperations();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Type guards
  const isPersonalPrompt = (p: PersonalPrompt | CommunityPrompt): p is PersonalPrompt => {
    return 'shared' in p;
  };

  const isCommunityPrompt = (p: PersonalPrompt | CommunityPrompt): p is CommunityPrompt => {
    return 'authorId' in p;
  };

  // Handle using the prompt
  const handleUsePrompt = async () => {
    try {
      // Record usage for community prompts
      if (isCommunityPrompt(prompt) && prompt.id) {
        await recordPromptUsage(prompt.id);
      }

      // Send the prompt to chat
      await sendMessage(prompt.content);
      
      // Navigate to chat page
      navigate('/chat');
      
      toast({
        title: 'Prompt sent to chat',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error using prompt:', error);
      toast({
        title: 'Error using prompt',
        description: 'Failed to send prompt to chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle copying prompt to clipboard
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy prompt to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle sharing/unsharing prompt
  const handleShare = async () => {
    if (!prompt.id) return;

    try {
      if (isPersonalPrompt(prompt) && !prompt.shared) {
        await executeOperation(() => sharePrompt(prompt.id!));
        toast({
          title: 'Prompt shared',
          description: 'Your prompt is now available to the community',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onShared?.();
      } else if (isPersonalPrompt(prompt) && prompt.shared) {
        await executeOperation(() => unsharePrompt(prompt.id!));
        toast({
          title: 'Prompt unshared',
          description: 'Your prompt has been removed from the community',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        onShared?.();
      }
    } catch (error) {
      toast({
        title: 'Error sharing prompt',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle saving community prompt to personal
  const handleSaveToPersonal = async () => {
    if (!isCommunityPrompt(prompt)) return;

    try {
      await executeOperation(() => saveToPersonal(prompt));
      toast({
        title: 'Prompt saved',
        description: 'Added to your personal prompts',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving prompt',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle deleting prompt
  const handleDelete = async () => {
    if (!prompt.id) return;

    try {
      setIsDeleting(true);
      await executeOperation(() => deletePrompt(prompt.id!));
      toast({
        title: 'Prompt deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onUpdated?.();
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Error deleting prompt',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={4}
        transition="all 0.2s ease"
        _hover={{
          bg: hoverBg,
          transform: 'translateY(-2px)',
          boxShadow: useColorModeValue('lg', 'dark-lg'),
        }}
        h="100%"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <HStack justify="space-between" align="start" mb={3}>
          <VStack align="start" spacing={1} flex={1}>
            <Text
              fontSize="md"
              fontWeight="semibold"
              color={textColor}
              noOfLines={2}
              lineHeight="1.3"
            >
              {prompt.title}
            </Text>
            
            {/* Author info for community prompts */}
            {isCommunityPrompt(prompt) && (
              <HStack spacing={2} fontSize="xs" color={subtextColor}>
                <PiUserBold />
                <Text>{prompt.authorName}</Text>
                {type === 'trending' && (
                  <>
                    <Text>•</Text>
                    <HStack spacing={1}>
                      <PiTrendUpBold />
                      <Text>{prompt.weeklyUses} uses this week</Text>
                    </HStack>
                  </>
                )}
              </HStack>
            )}
          </VStack>

          <Menu>
            <MenuButton
              as={IconButton}
              icon={<PiDotsThreeBold />}
              variant="ghost"
              size="sm"
              aria-label="More options"
            />
            <MenuList>
              <MenuItem icon={<PiCopyBold />} onClick={handleCopyPrompt}>
                Copy Content
              </MenuItem>
              
              {type === 'personal' && (
                <>
                  <MenuItem icon={<PiPencilBold />} onClick={onEditOpen}>
                    Edit
                  </MenuItem>
                  <MenuItem
                    icon={<PiShareBold />}
                    onClick={handleShare}
                    isDisabled={loading}
                  >
                    {isPersonalPrompt(prompt) && prompt.shared ? 'Unshare' : 'Share'}
                  </MenuItem>
                  <MenuItem
                    icon={<PiTrashBold />}
                    onClick={onDeleteOpen}
                    color="red.500"
                  >
                    Delete
                  </MenuItem>
                </>
              )}
              
              {/* Pin/Save to Personal functionality hidden */}
              {false && type !== 'personal' && (
                <MenuItem
                  icon={<PiBookmarkBold />}
                  onClick={handleSaveToPersonal}
                  isDisabled={loading}
                >
                  Save to Personal
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </HStack>

        {/* Content */}
        <Text
          fontSize="sm"
          color={subtextColor}
          noOfLines={3}
          mb={4}
          flex={1}
          lineHeight="1.4"
        >
          {prompt.content}
        </Text>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <Wrap spacing={1} mb={4}>
            {prompt.tags.slice(0, 3).map((tag, index) => (
              <WrapItem key={index}>
                <Badge
                  size="sm"
                  variant="subtle"
                  colorScheme="blue"
                  borderRadius="md"
                >
                  {tag}
                </Badge>
              </WrapItem>
            ))}
            {prompt.tags.length > 3 && (
              <WrapItem>
                <Badge size="sm" variant="outline" borderRadius="md">
                  +{prompt.tags.length - 3}
                </Badge>
              </WrapItem>
            )}
          </Wrap>
        )}

        {/* Footer */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color={subtextColor}>
              {isPersonalPrompt(prompt) && formatDate(prompt.updatedAt)}
              {isCommunityPrompt(prompt) && formatDate(prompt.sharedAt)}
            </Text>
            
            {isPersonalPrompt(prompt) && prompt.shared && (
              <Badge size="xs" colorScheme="green" variant="subtle">
                Shared
              </Badge>
            )}
            
            {isCommunityPrompt(prompt) && prompt.usesCount > 0 && (
              <Text fontSize="xs" color={subtextColor}>
                {prompt.usesCount} uses
              </Text>
            )}
          </VStack>

          <Tooltip label="Use this prompt in chat" hasArrow>
            <Button
              leftIcon={<PiPlayBold />}
              size="sm"
              colorScheme="blue"
              onClick={handleUsePrompt}
            >
              Use
            </Button>
          </Tooltip>
        </HStack>
      </Box>

      {/* Edit Modal */}
      {type === 'personal' && (
        <PromptFormModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          onSave={() => {
            onUpdated?.();
            onEditClose();
          }}
          editPrompt={isPersonalPrompt(prompt) ? prompt : undefined}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Prompt
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{prompt.title}"? This action cannot be undone.
              {isPersonalPrompt(prompt) && prompt.shared && (
                <Text mt={2} fontSize="sm" color="orange.500">
                  This will also remove the prompt from the community.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
