import {
  Box,
  Button,
  Flex,
  IconButton,
  Textarea,
  Stack,
  Heading,
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
} from '@chakra-ui/react';
import { AiFillPushpin, AiOutlinePushpin } from 'react-icons/ai';
import { PiArrowLeftLight } from 'react-icons/pi';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* 🛰️  neuratask – AI‑assisted to‑do generator (minimal v1)            */
/* ------------------------------------------------------------------ */

interface Task {
  id: string;
  text: string;
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
      const res = await fetch(`${apiBase}/api/query`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({
          prompt : `Break the following request into a concise to‑do list based on the description:\n\n${description}`,
          models : ['openai:gpt-4','google:gemini-1.5-flash','xai:grok-3-mini']
        })
      });
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data   = await res.json();
      const answer = (data.answer as string | undefined) ?? '';

      /* naive parse – 1 task / line -------------------------------- */
      const parsed: Task[] = answer
        .split(/\r?\n/)
        .map(l => l.replace(/^\s*[-\d\.\)]\s*/,'').trim())
        .filter(Boolean)
        .map(line => {
          /* split into subtasks by ';' for now */
          const parts = line.split(';').map(s=>s.trim()).filter(Boolean);
          return {
            id: crypto.randomUUID(),
            text: parts[0],
            subtasks: parts.slice(1),
            completed: []
          };
        });

      setTasks(parsed);
    } catch (err: any) {
      console.error(err);
      toast({ title:'Failed to generate', description:err.message, status:'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ui helpers ------------------------------------------------------ */
  const cardBg  = useColorModeValue('whiteAlpha.600','whiteAlpha.100');
  const pinIcon = (id:string) =>
    pinned.includes(id) ? <AiFillPushpin/> : <AiOutlinePushpin/>;

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
        <Heading size="md" flex={1} textAlign="center" color={useColorModeValue('gray.700','gray.200')}>
          <span style={{fontStyle:'italic'}}>neura</span><span style={{fontWeight:600}}>task</span>
        </Heading>
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
            onChange={e=>setDescription(e.target.value)}
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
            <Heading size="sm" mb={2}>📌 Pinned</Heading>
            <SimpleGrid columns={[1,2,3]} spacing={3}>
              {tasks.filter(t=>pinned.includes(t.id)).map(t=>(
                <TaskCard
                  key={t.id}
                  task={t}
                  bg={cardBg}
                  pin={() => togglePin(t.id)}
                  pinIcon={pinIcon(t.id)}
                  open={() => openTask(t)}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* list ------------------------------------------------------ */}
        {tasks.length>0 && (
          <Box>
            <Heading size="sm" mb={2}>🔧 Task list</Heading>
            <SimpleGrid columns={[1,2]} spacing={3}>
              {tasks.filter(t=>!pinned.includes(t.id)).map(t=>(
                <TaskCard
                  key={t.id}
                  task={t}
                  bg={cardBg}
                  pin={() => togglePin(t.id)}
                  pinIcon={pinIcon(t.id)}
                  open={() => openTask(t)}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Flex>

      {/* modal ------------------------------------------------------ */}
      {activeTask && (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{activeTask.text}</ModalHeader>
            <ModalCloseButton/>
            <ModalBody pb={6}>
              {activeTask.subtasks.length===0 ? (
                <Text color="gray.500">No additional subtasks generated.</Text>
              ) : (
                <CheckboxGroup
                  value={activeTask.completed}
                  onChange={(v)=>setTasks(ts=>ts.map(t=>t.id===activeTask.id
                    ? {...t, completed:v as string[]}
                    : t))}
                >
                  <VStack align="stretch">
                    {activeTask.subtasks.map((st,i)=>(
                      <Checkbox key={i} value={String(i)}>
                        {st}
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              )}
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
}
function TaskCard({ task, bg, pin, pinIcon, open }: TaskCardProps) {
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
      <Text noOfLines={2}>{task.text}</Text>
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
    </Box>
  );
}
