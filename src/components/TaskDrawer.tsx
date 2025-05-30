import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  HStack,
  Checkbox,
  Textarea,
  Button,
  Text,
  Editable,
  EditableInput,
  EditablePreview,
  useColorModeValue,
  Divider,
  Badge,
  useToast,
  Box
} from '@chakra-ui/react';
import { PiSplitHorizontalBold, PiUniteSquareBold, PiPencilBold, PiTrashBold } from 'react-icons/pi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

interface Task {
  id: string;
  text: string;
  description?: string;
  subtasks: string[];
  completed: string[];
}

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onRefineTask: (taskId: string, action: 'split' | 'merge' | 'rewrite') => void;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function TaskDrawer({ isOpen, onClose, task, onUpdateTask, onDeleteTask, onRefineTask }: TaskDrawerProps) {
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const completedColor = useColorModeValue('green.500', 'green.300');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!task || !localTask) return null;

  const updateTitle = (newTitle: string) => {
    const updated = { ...localTask, text: newTitle };
    setLocalTask(updated);
    onUpdateTask(updated);
  };

  const updateDescription = (newDescription: string) => {
    const updated = { ...localTask, description: newDescription };
    setLocalTask(updated);
    onUpdateTask(updated);
  };

  const toggleSubtask = (index: number) => {
    const indexStr = String(index);
    const isCompleted = localTask.completed.includes(indexStr);
    const newCompleted = isCompleted
      ? localTask.completed.filter(id => id !== indexStr)
      : [...localTask.completed, indexStr];

    const updated = { ...localTask, completed: newCompleted };
    setLocalTask(updated);
    onUpdateTask(updated);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = localTask.subtasks.findIndex((_, i) => String(i) === active.id);
      const newIndex = localTask.subtasks.findIndex((_, i) => String(i) === over.id);

      const newSubtasks = arrayMove(localTask.subtasks, oldIndex, newIndex);
      const updated = { ...localTask, subtasks: newSubtasks };
      setLocalTask(updated);
      onUpdateTask(updated);
    }
  };

  const handleRefine = (action: 'split' | 'merge' | 'rewrite') => {
    onRefineTask(task.id, action);
    toast({
      title: `Task ${action} requested`,
      description: "AI is processing your request...",
      status: "info",
      duration: 2000,
    });
  };

  const completedCount = localTask.completed.length;
  const totalCount = localTask.subtasks.length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "md" }} // Full screen on mobile
      placement="right"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton size={{ base: "md", md: "md" }} />

        <DrawerHeader pb={{ base: 3, md: 2 }} pt={{ base: 4, md: 4 }}>
          <VStack spacing={{ base: 3, md: 2 }} align="stretch">
            <Editable
              defaultValue={localTask.text}
              onSubmit={updateTitle}
              isPreviewFocusable={false}
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              color={useColorModeValue('gray.800', 'gray.100')}
            >
              <EditablePreview
                _hover={{
                  bg: useColorModeValue('gray.50', 'gray.700'),
                  borderRadius: 'md'
                }}
                p={2}
                mx={-2}
                transition="all 0.2s ease"
              />
              <EditableInput
                _focus={{
                  borderColor: 'blue.400',
                  boxShadow: '0 0 0 1px blue.400'
                }}
              />
            </Editable>

            {totalCount > 0 && (
              <VStack spacing={2} align="stretch">
                <HStack spacing={{ base: 2, md: 2 }} flexWrap="wrap">
                  <Badge
                    colorScheme={completedCount === totalCount ? 'green' : 'blue'}
                    fontSize={{ base: "xs", md: "xs" }}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {completedCount}/{totalCount} completed
                  </Badge>
                  <Text fontSize={{ base: "xs", md: "sm" }} color={mutedColor} fontWeight="500">
                    {Math.round((completedCount / totalCount) * 100)}% done
                  </Text>
                </HStack>

                {/* Progress bar */}
                <Box
                  w="full"
                  h="2"
                  bg={useColorModeValue('gray.200', 'gray.700')}
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="full"
                    bg={completedCount === totalCount ? 'green.400' : 'blue.400'}
                    borderRadius="full"
                    transition="all 0.3s ease"
                    w={`${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`}
                  />
                </Box>
              </VStack>
            )}
          </VStack>
        </DrawerHeader>

        <DrawerBody px={{ base: 4, md: 6 }} py={{ base: 4, md: 4 }}>
          <VStack spacing={{ base: 4, md: 4 }} align="stretch">
            {/* Description - Mobile optimized */}
            <VStack spacing={2} align="stretch">
              <Text fontSize={{ base: "sm", md: "sm" }} fontWeight="medium" color={mutedColor}>
                Description
              </Text>
              <Textarea
                value={localTask.description || ''}
                onChange={(e) => updateDescription(e.target.value)}
                placeholder="Add a description..."
                size={{ base: "md", md: "sm" }}
                resize="vertical"
                minH={{ base: "80px", md: "60px" }}
                fontSize={{ base: "16px", md: "14px" }} // Prevent zoom on iOS
              />
            </VStack>

            <Divider />

            {/* AI Actions - Mobile optimized */}
            <VStack spacing={2} align="stretch">
              <Text fontSize={{ base: "sm", md: "sm" }} fontWeight="medium" color={mutedColor}>
                AI Actions
              </Text>
              <VStack spacing={2} align="stretch" display={{ base: "flex", md: "none" }}>
                {/* Mobile: Stack buttons vertically */}
                <Button
                  size="md"
                  variant="outline"
                  leftIcon={<PiSplitHorizontalBold />}
                  onClick={() => handleRefine('split')}
                  w="full"
                >
                  Split Task
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  leftIcon={<PiUniteSquareBold />}
                  onClick={() => handleRefine('merge')}
                  w="full"
                >
                  Merge Task
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  leftIcon={<PiPencilBold />}
                  onClick={() => handleRefine('rewrite')}
                  w="full"
                >
                  Rewrite Task
                </Button>
              </VStack>
              <HStack spacing={2} display={{ base: "none", md: "flex" }}>
                {/* Desktop: Horizontal layout */}
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<PiSplitHorizontalBold />}
                  onClick={() => handleRefine('split')}
                >
                  Split
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<PiUniteSquareBold />}
                  onClick={() => handleRefine('merge')}
                >
                  Merge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<PiPencilBold />}
                  onClick={() => handleRefine('rewrite')}
                >
                  Rewrite
                </Button>
              </HStack>
            </VStack>

            <Divider />

            {/* Subtasks */}
            <VStack spacing={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color={mutedColor}>
                Subtasks ({totalCount})
              </Text>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localTask.subtasks.map((_, i) => String(i))}
                  strategy={verticalListSortingStrategy}
                >
                  <VStack spacing={2} align="stretch">
                    {localTask.subtasks.map((subtask, index) => {
                      const isCompleted = localTask.completed.includes(String(index));
                      return (
                        <SortableItem key={index} id={String(index)}>
                          <HStack
                            p={{ base: 3, md: 2 }}
                            borderWidth="1px"
                            borderColor={borderColor}
                            borderRadius="md"
                            bg={isCompleted ? completedColor + '10' : 'transparent'}
                            cursor="grab"
                            _active={{ cursor: 'grabbing' }}
                            minH={{ base: "48px", md: "auto" }} // Better touch targets
                          >
                            <Checkbox
                              isChecked={isCompleted}
                              onChange={() => toggleSubtask(index)}
                              colorScheme="green"
                              size={{ base: "md", md: "md" }}
                            />
                            <Text
                              flex={1}
                              fontSize={{ base: "sm", md: "sm" }}
                              textDecoration={isCompleted ? 'line-through' : 'none'}
                              opacity={isCompleted ? 0.7 : 1}
                              lineHeight="shorter"
                            >
                              {subtask}
                            </Text>
                          </HStack>
                        </SortableItem>
                      );
                    })}
                  </VStack>
                </SortableContext>
              </DndContext>
            </VStack>

            <Divider />

            {/* Danger Zone - Mobile optimized */}
            <VStack spacing={2} align="stretch">
              <Text fontSize={{ base: "sm", md: "sm" }} fontWeight="medium" color="red.500">
                Danger Zone
              </Text>
              <Button
                size={{ base: "md", md: "sm" }}
                colorScheme="red"
                variant="outline"
                leftIcon={<PiTrashBold />}
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
                w={{ base: "full", md: "auto" }}
              >
                Delete Task
              </Button>
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
