import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { queryStack } from '../lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  
  sendMessage: async (text: string) => {
    // Add user message
    const userMsg: Message = { id: nanoid(), role: 'user', text };
    set(state => ({ 
      messages: [...state.messages, userMsg],
      isLoading: true 
    }));
    
    try {
      // Create placeholder for assistant response
      const assistantId = nanoid();
      set(state => ({
        messages: [...state.messages, { id: assistantId, role: 'assistant', text: '' }]
      }));
      
      // Call API
      const response = await queryStack(text);
      
      // Update with actual response
      set(state => ({
        messages: state.messages.map(m => 
          m.id === assistantId 
            ? { ...m, text: response.answer } 
            : m
        ),
        isLoading: false
      }));
    } catch (error) {
      // Handle error
      set(state => ({
        messages: [...state.messages, { 
          id: nanoid(), 
          role: 'error', 
          text: error instanceof Error ? error.message : 'Unknown error' 
        }],
        isLoading: false
      }));
    }
  }
}));
