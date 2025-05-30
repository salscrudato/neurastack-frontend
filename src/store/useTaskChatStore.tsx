import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: string;
  text: string;
  description?: string;
  subtasks: string[];
  completed: string[];
}

interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text?: string;
  taskId?: string; // Reference to a task for AI messages
  timestamp: number;
}

interface TaskChatState {
  messages: ChatMessage[];
  tasks: Task[];
  pinnedTaskIds: string[];
  isLoading: boolean;
  
  // Message actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Task actions
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  togglePin: (taskId: string) => void;
  
  // Loading state
  setLoading: (loading: boolean) => void;
  
  // Getters
  getPinnedTasks: () => Task[];
  getTaskById: (taskId: string) => Task | undefined;
}

export const useTaskChatStore = create<TaskChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      tasks: [],
      pinnedTaskIds: [],
      isLoading: false,

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      clearMessages: () => {
        set({ messages: [], tasks: [], pinnedTaskIds: [] });
      },

      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
        
        // Add AI message referencing this task
        get().addMessage({
          from: 'ai',
          taskId: task.id,
        });
      },

      updateTask: (updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
          pinnedTaskIds: state.pinnedTaskIds.filter((id) => id !== taskId),
          messages: state.messages.filter((msg) => msg.taskId !== taskId),
        }));
      },

      togglePin: (taskId) => {
        set((state) => {
          const isPinned = state.pinnedTaskIds.includes(taskId);
          const newPinnedIds = isPinned
            ? state.pinnedTaskIds.filter((id) => id !== taskId)
            : [...state.pinnedTaskIds, taskId];
          
          // Limit to 5 pinned tasks
          const limitedPinnedIds = newPinnedIds.slice(-5);
          
          return {
            pinnedTaskIds: limitedPinnedIds,
          };
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      getPinnedTasks: () => {
        const state = get();
        return state.pinnedTaskIds
          .map((id) => state.tasks.find((task) => task.id === id))
          .filter((task): task is Task => task !== undefined);
      },

      getTaskById: (taskId) => {
        return get().tasks.find((task) => task.id === taskId);
      },
    }),
    {
      name: 'task-chat-storage',
      partialize: (state) => ({
        messages: state.messages,
        tasks: state.tasks,
        pinnedTaskIds: state.pinnedTaskIds,
      }),
    }
  )
);
