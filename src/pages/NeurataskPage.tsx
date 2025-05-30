import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  useToast,
  useDisclosure,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { PiListBold } from 'react-icons/pi';
import { useState, useRef, useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { Message } from '../components/Message';
import { TaskCardBubble } from '../components/TaskCardBubble';
import { TaskDrawer } from '../components/TaskDrawer';
import { TaskRail } from '../components/TaskRail';
import { useTaskChatStore } from '../store/useTaskChatStore';
import TaskChatInput from '../components/TaskChatInput';

/* ------------------------------------------------------------------ */
/* 🛰️  neuratask – AI‑assisted task coach (chat-style v2)             */
/* ------------------------------------------------------------------ */

interface Task {
  id: string;
  text: string;
  description?: string;
  subtasks: string[];
  completed: string[];
}

export default function NeurataskPage() {
  const toast = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Task chat store
  const {
    messages,
    tasks,
    isLoading,
    addMessage,
    addTask,
    updateTask,
    deleteTask,
    togglePin,
    setLoading,
    getPinnedTasks,
    getTaskById,
  } = useTaskChatStore();

  // UI state - mobile-first approach
  const [showTaskRail, setShowTaskRail] = useState(false); // Hidden by default on mobile
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // Auto-hide task rail on mobile, show on desktop
      if (mobile) {
        setShowTaskRail(false);
      } else {
        setShowTaskRail(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Color tokens (matching ChatPage)
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const heroTextColor = useColorModeValue('gray.600', 'gray.200');
  const heroSubTextColor = useColorModeValue('gray.600', 'gray.300');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle task selection for drawer
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onDrawerOpen();
  };

  // Handle task refinement actions
  const handleRefineTask = async (taskId: string, action: 'split' | 'merge' | 'rewrite') => {
    const task = getTaskById(taskId);
    if (!task) return;

    setLoading(true);
    addMessage({ from: 'user', text: `${action} this task: "${task.text}"` });

    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${apiBase}/api/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
        },
        body: JSON.stringify({
          prompt: `${action} this task: "${task.text}". Description: ${task.description || 'None'}. Subtasks: ${task.subtasks.join(', ')}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTask: Task = {
          id: crypto.randomUUID(),
          text: data.title,
          description: data.description || '',
          subtasks: data.tasks,
          completed: [],
        };
        addTask(newTask);
      }
    } catch (error) {
      toast({
        title: 'Failed to refine task',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sending messages (chat input)
  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Add user message
    addMessage({ from: 'user', text: prompt });

    // Check for network connectivity
    if (!navigator.onLine) {
      toast({
        status: 'error',
        title: 'No internet connection',
        description: 'Please check your network and try again.',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${apiBase}/api/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();

      if (!data.title || !Array.isArray(data.tasks)) {
        throw new Error('Invalid response format from server');
      }

      const newTask: Task = {
        id: crypto.randomUUID(),
        text: data.title,
        description: data.description || '',
        subtasks: data.tasks,
        completed: [],
      };

      addTask(newTask);

      toast({
        status: 'success',
        title: 'Task created!',
        description: `"${newTask.text}" with ${newTask.subtasks.length} subtasks`,
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error generating task:', error);

      let errorMessage = 'Failed to generate task';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        status: 'error',
        title: 'Generation failed',
        description: errorMessage,
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const pinnedTasks = getPinnedTasks();

  return (
    <AppShell>
      <Flex h="100%" bg={bgColor}>
        {/* Main Chat Area */}
        <Flex direction="column" flex="1" overflow="hidden">
          {/* Messages Container */}
          <Box
            flex="1"
            overflowY="auto"
            px={{ base: 2, md: 3 }}
            py={{ base: 2, md: 3 }}
            pb={{ base: 4, md: 3 }} // Extra bottom padding on mobile for better input spacing
          >
            {messages.length === 0 ? (
              // Enhanced Hero section - mobile optimized
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="100%"
                textAlign="center"
                px={{ base: 4, md: 8 }}
                py={{ base: 8, md: 0 }}
              >
                <Box
                  p={6}
                  borderRadius="2xl"
                  bg={useColorModeValue('whiteAlpha.700', 'whiteAlpha.100')}
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={useColorModeValue('whiteAlpha.300', 'whiteAlpha.200')}
                  maxW="md"
                  w="full"
                >
                  <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="700"
                    mb={3}
                    color={heroTextColor}
                    lineHeight="shorter"
                  >
                    🛰️ Neuratask
                  </Text>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    color={heroSubTextColor}
                    mb={6}
                    lineHeight="relaxed"
                  >
                    Your AI-powered task coach. Describe what you need to do, and I'll break it down into actionable steps.
                  </Text>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                  >
                    <Text
                      fontSize="sm"
                      color={useColorModeValue('blue.700', 'blue.200')}
                      fontWeight="500"
                    >
                      💡 Try: "Plan a trip to Rome" or "Organize my home office"
                    </Text>
                  </Box>
                </Box>
              </Flex>
            ) : (
              // Messages list - mobile optimized spacing
              <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                {messages.map((message) => {
                  if (message.taskId) {
                    const task = getTaskById(message.taskId);
                    if (task) {
                      return (
                        <TaskCardBubble
                          key={message.id}
                          task={task}
                          onOpen={() => handleTaskClick(task)}
                          onPin={() => togglePin(task.id)}
                          isPinned={pinnedTasks.some(p => p.id === task.id)}
                        />
                      );
                    }
                  }

                  return (
                    <Message key={message.id} from={message.from}>
                      <Text fontSize={{ base: "sm", md: "md" }}>{message.text}</Text>
                    </Message>
                  );
                })}
              </VStack>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Chat Input */}
          <TaskChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="Describe what you need to do..."
          />
        </Flex>

        {/* Task Rail - Desktop only or mobile overlay */}
        {showTaskRail && (
          <TaskRail
            tasks={tasks}
            pinnedTasks={pinnedTasks}
            onTaskClick={handleTaskClick}
            onPinTask={togglePin}
            onToggleCollapse={() => setShowTaskRail(false)}
            isMobile={isMobile}
          />
        )}

        {/* Enhanced Floating Task Button - Mobile optimized */}
        {!showTaskRail && (
          <Box
            position="fixed"
            right={{ base: 3, md: 4 }}
            bottom={{ base: "90px", md: "50%" }}
            transform={{ base: "none", md: "translateY(-50%)" }}
            zIndex={10}
          >
            <IconButton
              aria-label="Show tasks"
              icon={<PiListBold />}
              size={{ base: "lg", md: "lg" }}
              bg={useColorModeValue('white', 'gray.800')}
              color={useColorModeValue('blue.600', 'blue.300')}
              borderRadius="full"
              boxShadow="xl"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
              _hover={{
                bg: useColorModeValue('blue.50', 'blue.900'),
                transform: 'scale(1.05)',
                boxShadow: '2xl'
              }}
              _active={{
                transform: 'scale(0.95)'
              }}
              transition="all 0.2s ease"
              onClick={() => setShowTaskRail(true)}
            />
          </Box>
        )}

        {/* Task Drawer */}
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={onDrawerClose}
          task={selectedTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onRefineTask={handleRefineTask}
        />
      </Flex>
    </AppShell>
  );
}
