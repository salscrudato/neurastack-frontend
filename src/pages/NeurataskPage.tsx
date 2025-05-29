import {
  Box,
  Button,
  Flex,
  IconButton,
  Textarea,
  Stack,
  Text,
  Spinner,
  SimpleGrid,
  useToast,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Checkbox,
  CheckboxGroup,
  VStack,
  Heading,
  Image,
} from '@chakra-ui/react';
import { AiFillPushpin, AiOutlinePushpin } from 'react-icons/ai';
import { PiArrowLeftLight } from 'react-icons/pi';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, CheckIcon, DeleteIcon } from '@chakra-ui/icons';
import Logo from '../assets/icons/logo.svg';

/* ------------------------------------------------------------------ */
/* 🛰️  neuratask – AI‑assisted to‑do generator (minimal v1)            */
/* ------------------------------------------------------------------ */

interface Task {
  id: string;
  text: string;
  description?: string;
  subtasks: string[];
  completed: string[];       // ids of completed subtasks
}

export default function NeurataskPage() {
  /* form state ------------------------------------------------------ */
  const [description, setDescription] = useState('');
  const toast             = useToast();
  const [loading, setLoading] = useState(false);

  /* tasks ----------------------------------------------------------- */
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [pinned, setPinned]   = useState<string[]>([]);

  /* modal ----------------------------------------------------------- */
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const navigate = useNavigate();

  /* helpers --------------------------------------------------------- */
  const togglePin = (id: string) => {
    setPinned(p =>
      p.includes(id)
        ? p.filter(t => t !== id)
        : p.length >= 3
            ? (toast({ title: 'You can pin up to 3 tasks.', status: 'info' }), p)
            : [...p, id]
    );
  };

  const openTask = (task: Task) => {
    setActiveTask(task);
    onOpen();
  };

  /* generate tasks via backend ------------------------------------- */
  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({ status: 'warning', title: 'Enter a description first.' });
      return;
    }
    setLoading(true);
    setTasks([]);
    setPinned([]);
    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${apiBase}/api/todo`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ prompt: description })
      });
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data = await res.json();

      const task: Task = {
        id: crypto.randomUUID(),
        text: data.title,
        description: data.description,
        subtasks: data.tasks,
        completed: []
      };

      setTasks([task]);
    } catch (err: any) {
      console.error(err);
      toast({ title:'Failed to generate', description:err.message, status:'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ui helpers ------------------------------------------------------ */
  const cardBg = useColorModeValue('whiteAlpha.600', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.900', 'whiteAlpha.900');
  const pinIcon = (id: string) =>
    pinned.includes(id) ? <AiFillPushpin /> : <AiOutlinePushpin />;

  /* ---------------------------------------------------------------- */

  return (
    <Flex direction="column" h="100vh" bg={useColorModeValue('gray.50','gray.900')}>
      {/* Local header ------------------------------------------------ */}
      <Flex
        align="center"
        px={2}
        py={1}
        bg={useColorModeValue('white','#2c2c2e')}
        borderBottomWidth="1px"
        borderColor={useColorModeValue('gray.200','whiteAlpha.200')}
        gap={2}
      >
        <IconButton
          aria-label="Back"
          icon={<PiArrowLeftLight size={20}/>}
          variant="ghost"
          onClick={() => navigate(-1)}
        />
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <Image src={Logo} alt="Logo" height="32px" width="auto" />
        </Box>
        <Box w="40px"/>
      </Flex>

      {/* body -------------------------------------------------------- */}
      <Flex direction="column" flex="1 1 0" px={4} py={6} gap={6} overflowY="auto">
        {/* input form ----------------------------------------------- */}
        <Stack spacing={3}>
          <Textarea
            variant="filled"
            placeholder="Describe what you need to do…"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            color={useColorModeValue('gray.800', 'whiteAlpha.900')}
          />
          <Button
            colorScheme="blue"
            onClick={handleGenerate}
            isDisabled={loading}
          >
            {loading ? <Spinner size="sm"/> : 'Generate a neuratask'}
          </Button>
        </Stack>

        {/* pinned ---------------------------------------------------- */}
        {pinned.length>0 && (
          <Box>
            <Heading size="sm" mb={2} color={useColorModeValue('gray.800', 'gray.100')}>📌 Pinned</Heading>
            <SimpleGrid columns={[1,2,3]} spacing={3}>
              {tasks.filter(t=>pinned.includes(t.id)).map(t=>(
                <TaskCard
                  key={t.id}
                  task={t}
                  bg={cardBg}
                  pin={() => togglePin(t.id)}
                  pinIcon={pinIcon(t.id)}
                  open={() => openTask(t)}
                  edit={() => toast({ title: 'Edit coming soon' })}
                  complete={() => toast({ title: 'Complete triggered' })}
                  remove={() => setTasks(ts => ts.filter(x => x.id !== t.id))}
                  textColor={textColor}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* list ------------------------------------------------------ */}
        {tasks.length>0 && (
          <Box>
            <Heading size="sm" mb={2} color={useColorModeValue('gray.800', 'gray.100')}>🔧 Task list</Heading>
            <SimpleGrid columns={[1,2]} spacing={3}>
              {tasks.length === 1 && !pinned.includes(tasks[0].id) && (
                <TaskCard
                  key={tasks[0].id}
                  task={tasks[0]}
                  bg={cardBg}
                  pin={() => togglePin(tasks[0].id)}
                  pinIcon={pinIcon(tasks[0].id)}
                  open={() => openTask(tasks[0])}
                  edit={() => toast({ title: 'Edit coming soon' })}
                  complete={() => toast({ title: 'Complete triggered' })}
                  remove={() => setTasks(ts => ts.filter(x => x.id !== tasks[0].id))}
                  textColor={textColor}
                />
              )}
            </SimpleGrid>
          </Box>
        )}
      </Flex>

      {/* modal ------------------------------------------------------ */}
      {activeTask && (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
          <ModalOverlay backdropFilter="blur(6px)" />
          <ModalContent>
            <ModalHeader px={6} pt={6} pb={0}>
              <Heading size="md" color={useColorModeValue('gray.900', 'whiteAlpha.900')}>
                {activeTask.text}
              </Heading>
            </ModalHeader>
            <ModalCloseButton color={useColorModeValue('gray.600', 'gray.400')} />
            <ModalBody pb={6}>
              <Stack spacing={4}>
                <Box>
                  {activeTask.description && (
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      {activeTask.description}
                    </Text>
                  )}
                </Box>

                {activeTask.subtasks.length === 0 ? (
                  <Text color={useColorModeValue('gray.600', 'gray.400')}>
                    No additional subtasks generated.
                  </Text>
                ) : (
                  <CheckboxGroup
                    value={activeTask.completed}
                    onChange={(v) => {
                      setTasks(ts => ts.map(t => t.id === activeTask.id
                        ? { ...t, completed: v as string[] }
                        : t));
                      setActiveTask(a => a && a.id === activeTask.id
                        ? { ...a, completed: v as string[] }
                        : a);
                    }}
                  >
                    <VStack align="stretch" spacing={3}>
                      {activeTask.subtasks.map((st, i) => (
                        <Checkbox
                          key={i}
                          value={String(i)}
                          colorScheme="blue"
                          px={2}
                          py={2}
                          borderRadius="md"
                          iconColor="white"
                          borderColor={useColorModeValue('gray.400', 'whiteAlpha.500')}
                          _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.100') }}
                          _checked={{
                            bg: useColorModeValue('blue.500', 'blue.400'),
                            borderColor: useColorModeValue('blue.600', 'blue.300'),
                          }}
                          transition="background 0.1s"
                        >
                          <Text color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
                            {st}
                          </Text>
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                )}
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Flex>
  );
}

/* ------------------------- helpers ------------------------------- */
interface TaskCardProps {
  task: Task;
  bg: string;
  pin: () => void;
  pinIcon: React.ReactElement;
  open: () => void;
  edit?: () => void;
  complete?: () => void;
  remove?: () => void;
  textColor: string;
}
function TaskCard({ task, bg, pin, pinIcon, open, edit, complete, remove, textColor }: TaskCardProps) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg={bg}
      cursor="pointer"
      _hover={{ shadow:'sm' }}
      position="relative"
      onClick={open}
    >
      <Text noOfLines={2} color={textColor} fontWeight={500}>
        {task.text}
      </Text>
      <IconButton
        aria-label="Pin/unpin"
        icon={pinIcon}
        size="sm"
        position="absolute"
        top="6px"
        right="6px"
        variant="ghost"
        onClick={(e)=>{e.stopPropagation(); pin();}}
      />
      <Flex justify="flex-end" mt={2} gap={2}>
        <IconButton
          aria-label="Edit task"
          icon={<EditIcon />}
          size="xs"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); if (edit) edit(); }}
        />
        <IconButton
          aria-label="Mark complete"
          icon={<CheckIcon />}
          size="xs"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); if (complete) complete(); }}
        />
        <IconButton
          aria-label="Delete task"
          icon={<DeleteIcon />}
          size="xs"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); if (remove) remove(); }}
        />
      </Flex>
    </Box>
  );
}
