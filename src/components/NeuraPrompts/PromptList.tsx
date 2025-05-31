import {
  VStack,
  Text,
  useColorModeValue,
  SimpleGrid,
  Box,
  Icon,
  Button,
} from '@chakra-ui/react';
import { PiPlusBold, PiMagnifyingGlassBold } from 'react-icons/pi';
import { PersonalPrompt, CommunityPrompt } from '../../services/promptsService';
import PromptCard from './PromptCard';

interface PromptListProps {
  prompts: (PersonalPrompt | CommunityPrompt)[];
  type: 'personal' | 'community' | 'trending';
  onPromptUpdated?: () => void;
  onPromptShared?: () => void;
}

export default function PromptList({
  prompts,
  type,
  onPromptUpdated,
  onPromptShared
}: PromptListProps) {
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  if (prompts.length === 0) {
    return (
      <Box
        textAlign="center"
        py={12}
        px={6}
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <VStack spacing={4}>
          <Box
            p={4}
            borderRadius="full"
            bg={useColorModeValue('blue.50', 'blue.900')}
          >
            <Icon
              as={type === 'personal' ? PiPlusBold : PiMagnifyingGlassBold}
              boxSize={8}
              color="blue.500"
            />
          </Box>
          
          <VStack spacing={2}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              {type === 'personal' && 'No personal prompts yet'}
              {type === 'community' && 'No community prompts found'}
              {type === 'trending' && 'No trending prompts available'}
            </Text>
            
            <Text fontSize="sm" color={subtextColor} maxW="md">
              {type === 'personal' && 'Create your first prompt to get started. Save frequently used prompts for quick access.'}
              {type === 'community' && 'Be the first to share a prompt with the community! Your contributions help everyone.'}
              {type === 'trending' && 'Check back later to see which prompts are gaining popularity in the community.'}
            </Text>
          </VStack>

          {type === 'personal' && (
            <Button
              leftIcon={<PiPlusBold />}
              colorScheme="blue"
              size="sm"
              onClick={() => {
                // This would trigger the parent to open the form modal
                // For now, we'll just show a placeholder
              }}
            >
              Create Your First Prompt
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 3 }}
      spacing={{ base: 4, md: 6 }}
      w="100%"
    >
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          type={type}
          onUpdated={onPromptUpdated}
          onShared={onPromptShared}
        />
      ))}
    </SimpleGrid>
  );
}
