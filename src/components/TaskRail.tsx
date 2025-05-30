import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  Badge,
  useColorModeValue,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { PiCaretRightBold, PiCaretDownBold, PiPushPinSimpleThin, PiListBold } from 'react-icons/pi';
import { FixedSizeList as List } from 'react-window';

interface Task {
  id: string;
  text: string;
  description?: string;
  subtasks: string[];
  completed: string[];
}

interface TaskRailProps {
  tasks: Task[];
  pinnedTasks: Task[];
  onTaskClick: (task: Task) => void;
  onPinTask: (taskId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
}

interface TaskItemProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onPinTask: (taskId: string) => void;
  isPinned?: boolean;
}

function TaskItem({ task, onTaskClick, onPinTask, isPinned = false }: TaskItemProps) {
  const completedCount = task.completed.length;
  const totalCount = task.subtasks.length;
  const isCompleted = completedCount === totalCount && totalCount > 0;

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      p={{ base: 3, md: 3 }}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      cursor="pointer"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-1px)',
        boxShadow: 'md'
      }}
      onClick={() => onTaskClick(task)}
      position="relative"
      minH={{ base: "60px", md: "auto" }}
      transition="all 0.2s ease"
      bg={useColorModeValue('white', 'gray.700')}
    >
      <HStack spacing={{ base: 2, md: 2 }} align="flex-start">
        <Checkbox
          isChecked={isCompleted}
          colorScheme="green"
          size={{ base: "md", md: "sm" }}
          isReadOnly
          mt={0.5}
        />
        <VStack spacing={1} align="stretch" flex={1} minW={0}>
          <Text
            fontSize={{ base: "sm", md: "sm" }}
            fontWeight="medium"
            noOfLines={{ base: 3, md: 2 }}
            textDecoration={isCompleted ? 'line-through' : 'none'}
            opacity={isCompleted ? 0.7 : 1}
            lineHeight="shorter"
          >
            {task.text}
          </Text>
          {totalCount > 0 && (
            <Badge
              size="sm"
              colorScheme={isCompleted ? 'green' : 'blue'}
              variant="subtle"
              alignSelf="flex-start"
              fontSize={{ base: "xs", md: "xs" }}
            >
              {completedCount}/{totalCount}
            </Badge>
          )}
        </VStack>
        <IconButton
          aria-label={isPinned ? "Unpin task" : "Pin task"}
          icon={<PiPushPinSimpleThin />}
          size={{ base: "sm", md: "xs" }}
          variant="ghost"
          color={isPinned ? 'blue.500' : mutedColor}
          onClick={(e) => {
            e.stopPropagation();
            onPinTask(task.id);
          }}
          // Better touch target on mobile
          minW={{ base: "32px", md: "auto" }}
          minH={{ base: "32px", md: "auto" }}
        />
      </HStack>
    </Box>
  );
}

function VirtualizedTaskList({ tasks, onTaskClick, onPinTask, pinnedTaskIds }: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onPinTask: (taskId: string) => void;
  pinnedTaskIds: Set<string>;
}) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const task = tasks[index];
    return (
      <div style={style}>
        <Box px={2} pb={2}>
          <TaskItem
            task={task}
            onTaskClick={onTaskClick}
            onPinTask={onPinTask}
            isPinned={pinnedTaskIds.has(task.id)}
          />
        </Box>
      </div>
    );
  };

  return (
    <List
      height={400}
      itemCount={tasks.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
}

export function TaskRail({
  tasks,
  pinnedTasks,
  onTaskClick,
  onPinTask,
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false
}: TaskRailProps) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const pinnedTaskIds = new Set(pinnedTasks.map(t => t.id));

  if (isCollapsed) {
    return (
      <Box
        position="fixed"
        right={{ base: 3, md: 4 }}
        top={{ base: "auto", md: "50%" }}
        bottom={{ base: "90px", md: "auto" }}
        transform={{ base: "none", md: "translateY(-50%)" }}
        zIndex={10}
      >
        <IconButton
          aria-label="Show tasks"
          icon={<PiListBold />}
          size={{ base: "md", md: "lg" }}
          colorScheme="blue"
          borderRadius="full"
          boxShadow="lg"
          onClick={onToggleCollapse}
        />
      </Box>
    );
  }

  // Mobile: Full screen overlay, Desktop: Side panel
  return (
    <Box
      // Mobile: Full screen overlay
      position={{ base: "fixed", md: "relative" }}
      top={{ base: 0, md: "auto" }}
      left={{ base: 0, md: "auto" }}
      right={{ base: 0, md: "auto" }}
      bottom={{ base: 0, md: "auto" }}
      zIndex={{ base: 20, md: "auto" }}

      // Desktop: Side panel
      w={{ base: "100vw", md: "320px" }}
      h="100%"

      borderLeftWidth={{ base: "0", md: "1px" }}
      borderColor={borderColor}
      bg={bgColor}
      display="flex"
      flexDirection="column"

      // Mobile overlay background
      {...(isMobile && {
        bg: useColorModeValue('white', 'gray.800'),
        boxShadow: 'xl'
      })}
    >
      {/* Header - Mobile optimized */}
      <HStack p={{ base: 3, md: 4 }} borderBottomWidth="1px" borderColor={borderColor}>
        <IconButton
          aria-label={isOpen ? "Collapse tasks" : "Expand tasks"}
          icon={isOpen ? <PiCaretDownBold /> : <PiCaretRightBold />}
          size="sm"
          variant="ghost"
          onClick={onToggle}
        />
        <Text fontWeight="semibold" flex={1} fontSize={{ base: "md", md: "md" }}>
          Tasks
        </Text>
        <Badge colorScheme="blue" variant="subtle" fontSize={{ base: "xs", md: "xs" }}>
          {tasks.length}
        </Badge>
        {onToggleCollapse && (
          <IconButton
            aria-label={isMobile ? "Close tasks" : "Hide tasks rail"}
            icon={<PiCaretRightBold />}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
          />
        )}
      </HStack>

      {/* Content */}
      <Collapse in={isOpen} animateOpacity>
        <Box flex={1} overflow="hidden">
          <Tabs size="sm" variant="enclosed">
            <TabList>
              <Tab>
                Pinned ({pinnedTasks.length})
              </Tab>
              <Tab>
                All ({tasks.length})
              </Tab>
            </TabList>

            <TabPanels>
              {/* Pinned Tasks - Mobile optimized */}
              <TabPanel p={0}>
                <VStack
                  spacing={2}
                  p={{ base: 3, md: 4 }}
                  align="stretch"
                  maxH={{ base: "60vh", md: "400px" }}
                  overflowY="auto"
                >
                  {pinnedTasks.length === 0 ? (
                    <Text fontSize="sm" color={mutedColor} textAlign="center" py={8}>
                      No pinned tasks yet
                    </Text>
                  ) : (
                    pinnedTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                        onPinTask={onPinTask}
                        isPinned={true}
                      />
                    ))
                  )}
                </VStack>
              </TabPanel>

              {/* All Tasks - Mobile optimized */}
              <TabPanel p={0}>
                {tasks.length === 0 ? (
                  <Text fontSize="sm" color={mutedColor} textAlign="center" py={8}>
                    No tasks yet
                  </Text>
                ) : tasks.length > 25 ? (
                  <Box p={{ base: 1, md: 2 }}>
                    <VirtualizedTaskList
                      tasks={tasks}
                      onTaskClick={onTaskClick}
                      onPinTask={onPinTask}
                      pinnedTaskIds={pinnedTaskIds}
                    />
                  </Box>
                ) : (
                  <VStack
                    spacing={2}
                    p={{ base: 3, md: 4 }}
                    align="stretch"
                    maxH={{ base: "60vh", md: "400px" }}
                    overflowY="auto"
                  >
                    {tasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                        onPinTask={onPinTask}
                        isPinned={pinnedTaskIds.has(task.id)}
                      />
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Collapse>
    </Box>
  );
}
