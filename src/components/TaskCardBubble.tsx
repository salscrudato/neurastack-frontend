import {
  Flex,
  Text,
  Checkbox,
  IconButton,
  Badge,
  useColorModeValue,
  HStack,
  VStack
} from '@chakra-ui/react';
import { PiArrowRightBold, PiPushPinSimpleThin } from 'react-icons/pi';
import { Message } from './Message';

interface Task {
  id: string;
  text: string;
  description?: string;
  subtasks: string[];
  completed: string[];
}

interface TaskCardBubbleProps {
  task: Task;
  onOpen: () => void;
  onPin?: () => void;
  isPinned?: boolean;
}

export function TaskCardBubble({ task, onOpen, onPin, isPinned = false }: TaskCardBubbleProps) {
  const completedCount = task.completed.length;
  const totalCount = task.subtasks.length;
  const isCompleted = completedCount === totalCount && totalCount > 0;

  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('whiteAlpha.300', 'whiteAlpha.100');

  return (
    <Message from="ai">
      <VStack spacing={{ base: 2, md: 3 }} align="stretch" w="full">
        {/* Header - Mobile optimized */}
        <Flex align="center" justify="space-between">
          <HStack spacing={{ base: 2, md: 2 }} flex={1} minW={0}>
            <Checkbox
              isChecked={isCompleted}
              colorScheme="green"
              size={{ base: "md", md: "md" }}
              isReadOnly
            />
            <Text
              fontWeight="600"
              fontSize={{ base: "sm", md: "md" }}
              textDecoration={isCompleted ? 'line-through' : 'none'}
              opacity={isCompleted ? 0.7 : 1}
              noOfLines={{ base: 3, md: 2 }}
              lineHeight="shorter"
            >
              {task.text}
            </Text>
          </HStack>

          {onPin && (
            <IconButton
              aria-label={isPinned ? "Unpin task" : "Pin task"}
              icon={<PiPushPinSimpleThin />}
              size={{ base: "sm", md: "sm" }}
              variant="ghost"
              color={isPinned ? 'blue.500' : mutedColor}
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              // Better touch target on mobile
              minW={{ base: "32px", md: "auto" }}
              minH={{ base: "32px", md: "auto" }}
            />
          )}
        </Flex>

        {/* Progress indicator - Mobile optimized */}
        {totalCount > 0 && (
          <VStack spacing={1} align="stretch">
            <HStack spacing={2}>
              <Badge
                colorScheme={isCompleted ? 'green' : 'blue'}
                variant="subtle"
                fontSize={{ base: "xs", md: "xs" }}
              >
                {completedCount}/{totalCount} completed
              </Badge>
            </HStack>
            {task.description && (
              <Text
                fontSize={{ base: "xs", md: "xs" }}
                color={mutedColor}
                noOfLines={{ base: 2, md: 1 }}
                lineHeight="shorter"
              >
                {task.description}
              </Text>
            )}
          </VStack>
        )}

        {/* Action button - Mobile optimized */}
        <Flex justify="flex-end">
          <IconButton
            aria-label="Open task details"
            icon={<PiArrowRightBold />}
            size={{ base: "sm", md: "sm" }}
            variant="ghost"
            colorScheme="blue"
            onClick={onOpen}
            _hover={{ bg: hoverBg }}
            // Better touch target on mobile
            minW={{ base: "32px", md: "auto" }}
            minH={{ base: "32px", md: "auto" }}
          />
        </Flex>
      </VStack>
    </Message>
  );
}
