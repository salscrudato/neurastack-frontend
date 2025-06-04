import { memo, useMemo, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, Flex } from '@chakra-ui/react';
import ChatMessage from './ChatMessage';
import type { Message } from '../store/useChatStore';

interface ChatListProps {
  messages: Message[];
  height?: number;
  highlightedMessageId?: string;
  onScrollToBottom?: () => void;
}

interface ItemData {
  messages: Message[];
  highlightedMessageId?: string;
}

// Simplified row component for virtual list
const MessageRow = memo<{
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}>(({ index, style, data }) => {
  const { messages, highlightedMessageId } = data;
  const message = messages[index];

  if (!message) return null;

  const isFirstAssistantMessage = message.role === 'assistant' &&
    messages.slice(0, index).every(prevMsg => prevMsg.role !== 'assistant');

  const isHighlighted = highlightedMessageId === message.id;

  return (
    <div style={style}>
      <Box px={4} py={2}>
        <ChatMessage
          message={message}
          isFirstAssistantMessage={isFirstAssistantMessage}
          isHighlighted={isHighlighted}
        />
      </Box>
    </div>
  );
});

MessageRow.displayName = 'MessageRow';

// Simplified chat list with conditional virtual scrolling
export const ChatList = memo<ChatListProps>(({
  messages,
  height = 400,
  highlightedMessageId,
  onScrollToBottom: _onScrollToBottom,
}) => {
  const listRef = useRef<List>(null);

  // Use virtual scrolling only for large message counts
  const shouldUseVirtualScrolling = messages.length > 100;

  // Simple average item height calculation
  const averageItemHeight = 120;

  const itemData: ItemData = useMemo(() => ({
    messages,
    highlightedMessageId,
  }), [messages, highlightedMessageId]);

  // Auto-scroll to bottom for virtual list
  useEffect(() => {
    if (shouldUseVirtualScrolling && listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length, shouldUseVirtualScrolling]);

  if (messages.length === 0) {
    return null;
  }

  // Simple rendering for smaller lists (most common case)
  if (!shouldUseVirtualScrolling) {
    return (
      <Flex direction="column" gap={4} px={4}>
        {messages.map((message, index) => {
          const isFirstAssistantMessage = message.role === 'assistant' &&
            messages.slice(0, index).every(prevMsg => prevMsg.role !== 'assistant');

          const isHighlighted = highlightedMessageId === message.id;

          return (
            <Box key={message.id} id={`message-${message.id}`}>
              <ChatMessage
                message={message}
                isFirstAssistantMessage={isFirstAssistantMessage}
                isHighlighted={isHighlighted}
              />
            </Box>
          );
        })}
      </Flex>
    );
  }

  // Virtual scrolling for large message counts (rare case)
  return (
    <Box height={height} width="100%">
      <List
        ref={listRef}
        height={height}
        width="100%"
        itemCount={messages.length}
        itemSize={averageItemHeight}
        itemData={itemData}
        overscanCount={3} // Reduced for simplicity
      >
        {MessageRow}
      </List>
    </Box>
  );
});

ChatList.displayName = 'ChatList';

// Legacy export for backward compatibility
export const VirtualChatList = ChatList;
