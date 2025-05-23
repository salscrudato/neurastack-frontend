import { IconButton, Input, HStack, useColorModeValue } from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useState } from 'react';
import { useChatStore } from '../store/useChatStore';

export default function ChatInput() {
  const send   = useChatStore(s => s.sendMessage);
  const busy   = useChatStore(s => s.isLoading);
  const [txt, setTxt] = useState('');

  const handleSend = () => {
    if (busy) return;
    send(txt);
    setTxt('');
  };

  return (
    <HStack w="full" p={4} bg={useColorModeValue('white', 'gray.800')} spacing={3}>
      <Input
        flex={1}
        placeholder="Ask anything…"
        value={txt}
        onChange={e => setTxt(e.target.value)}
        onKeyDown={e => (e.key === 'Enter' && !e.shiftKey ? (e.preventDefault(), handleSend()) : undefined)}
        isDisabled={busy}
      />
      <IconButton
        aria-label="Send"
        icon={<FiSend />}
        onClick={handleSend}
        isLoading={busy}
        colorScheme="blue"
      />
    </HStack>
  );
}