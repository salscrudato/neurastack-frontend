import { memo, useMemo, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, Flex } from '@chakra-ui/react';
import { OptimizedChatMessage } from './OptimizedChatMessage';
import type { Message } from '../lib/types';

interface VirtualChatListProps {
  messages: Message[];
  height: number;
  highlightedMessageId?: string;
  onScrollToBottom?: () => void;
}

interface ItemData {
  messages: Message[];
  highlightedMessageId?: string;
}

// Memoized row component for virtual list
const MessageRow = memo<{
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}>(({ index, style, data }) => {
  const { messages, highlightedMessageId } = data;
  const message = messages[index];
  
  if (!message) return null;

  // Check if this is the first assistant message
  const isFirstAssistantMessage = message.role === 'assistant' &&
    messages.slice(0, index).every(prevMsg => prevMsg.role !== 'assistant');

  const isHighlighted = highlightedMessageId === message.id;

  return (
    <div style={style}>
      <Box px={4} py={2}>
        <OptimizedChatMessage
          message={message}
          isFirstAssistantMessage={isFirstAssistantMessage}
          isHighlighted={isHighlighted}
        />
      </Box>
    </div>
  );
});

MessageRow.displayName = 'MessageRow';

// Custom hook for calculating item sizes based on message content
const useItemSizes = (messages: Message[]) => {
  return useMemo(() => {
    return messages.map((message) => {
      // Base height for message bubble
      let height = 80;
      
      // Add height based on content length
      const contentLines = Math.ceil(message.text.length / 80);
      height += contentLines * 20;
      
      // Add extra height for first assistant message (badge)
      if (message.role === 'assistant') {
        const isFirst = messages.findIndex(m => m.role === 'assistant') === messages.indexOf(message);
        if (isFirst) height += 30;
      }
      
      // Cap maximum height
      return Math.min(height, 400);
    });
  }, [messages]);
};

export const VirtualChatList = memo<VirtualChatListProps>(({
  messages,
  height,
  highlightedMessageId,
  onScrollToBottom,
}) => {
  const listRef = useRef<List>(null);
  const itemSizes = useItemSizes(messages);
  
  // Calculate average item height for virtual list
  const averageItemHeight = useMemo(() => {
    if (itemSizes.length === 0) return 100;
    return itemSizes.reduce((sum, size) => sum + size, 0) / itemSizes.length;
  }, [itemSizes]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
      onScrollToBottom?.();
    }
  }, [messages.length, onScrollToBottom]);

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageId && listRef.current) {
      const messageIndex = messages.findIndex(m => m.id === highlightedMessageId);
      if (messageIndex !== -1) {
        listRef.current.scrollToItem(messageIndex, 'center');
      }
    }
  }, [highlightedMessageId, messages]);

  const itemData: ItemData = useMemo(() => ({
    messages,
    highlightedMessageId,
  }), [messages, highlightedMessageId]);

  // Handle scroll events
  const handleScroll = ({ scrollOffset, scrollDirection }: any) => {
    // If user scrolls to bottom, trigger callback
    const isAtBottom = scrollOffset >= (messages.length * averageItemHeight) - height - 100;
    if (isAtBottom && scrollDirection === 'forward') {
      onScrollToBottom?.();
    }
  };

  if (messages.length === 0) {
    return null;
  }

  // For small message counts, use regular rendering
  if (messages.length < 50) {
    return (
      <Flex direction="column" gap={4} px={4}>
        {messages.map((message, index) => {
          const isFirstAssistantMessage = message.role === 'assistant' &&
            messages.slice(0, index).every(prevMsg => prevMsg.role !== 'assistant');
          
          const isHighlighted = highlightedMessageId === message.id;

          return (
            <Box key={message.id} id={`message-${message.id}`}>
              <OptimizedChatMessage
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

  // Use virtual scrolling for large message counts
  return (
    <Box height={height} width="100%">
      <List
        ref={listRef}
        height={height}
        width="100%"
        itemCount={messages.length}
        itemSize={averageItemHeight}
        itemData={itemData}
        onScroll={handleScroll}
        overscanCount={5} // Render 5 extra items for smooth scrolling
      >
        {MessageRow}
      </List>
    </Box>
  );
});

VirtualChatList.displayName = 'VirtualChatList';
