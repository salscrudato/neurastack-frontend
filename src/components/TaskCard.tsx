import { Box, Checkbox, Flex, IconButton, Text, Collapse } from '@chakra-ui/react';
import { PiPushPinSimpleThin } from 'react-icons/pi';
import { useState } from 'react';
import { type Task, useNeurataskStore } from '../store/useNeurataskStore';

export default function TaskCard({ task }: { task: Task }) {
  const [open,setOpen] = useState(false);
  const toggleStep = useNeurataskStore(s=>s.toggle);
  const pin        = useNeurataskStore(s=>s.pin);

  return (
    <Box bg="whiteAlpha.50" p={4} rounded="md" shadow="md">
      <Flex justify="space-between" align="center">
        <Text fontWeight="semibold">{task.title}</Text>
        <IconButton
          aria-label="Pin task"
          icon={<PiPushPinSimpleThin/>}
          size="sm"
          variant="ghost"
          onClick={()=>pin(task.id)}
        />
      </Flex>

      <Collapse in={open} animateOpacity>
        <Text mt={2} fontSize="sm">{task.body}</Text>
        {task.steps.map(st=>(
          <Checkbox
            key={st.id}
            isChecked={st.done}
            onChange={()=>toggleStep(task.id,st.id)}
            mt={1}
          >
            {st.text}
          </Checkbox>
        ))}
      </Collapse>

      <Text
        mt={2}
        fontSize="sm"
        color="blue.400"
        cursor="pointer"
        onClick={()=>setOpen(o=>!o)}
      >
        {open?'Hide':'Show'} details
      </Text>
    </Box>
  );
}
