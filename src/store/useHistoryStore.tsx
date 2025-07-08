/**
 * History Store - Chat Session Management
 * 
 * Manages saved chat sessions with Firebase integration for persistence.
 * Provides functionality to save, load, edit, and delete chat sessions.
 */

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    type Timestamp
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { auth, db } from '../firebase';
import { handleSilentError } from '../utils/errorHandler';
import type { Message } from './useChatStore';

// Safe UUID generation helper
const generateSafeUUID = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
};

// ============================================================================
// Types
// ============================================================================

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

interface StoredSession {
  id: string;
  title: string;
  messages: Message[];
  messageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

interface HistoryState {
  sessions: ChatSession[];
  isLoading: boolean;
  
  // Actions
  saveSession: (messages: Message[], customTitle?: string) => Promise<string>;
  loadSession: (sessionId: string) => Promise<{ success: boolean; session: any }>;
  updateSessionTitle: (sessionId: string, newTitle: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadAllSessions: () => Promise<void>;
  clearSessions: () => void;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a title from the first user message
 */
function generateTitleFromMessages(messages: Message[]): string {
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  // Take first line and limit to 50 characters
  const firstLine = firstUserMessage.text.split('\n')[0];
  return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
}

/**
 * Sanitize data for Firebase storage
 */
function sanitizeForFirebase(obj: any): any {
  if (obj === null || obj === undefined) return null;
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirebase);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirebase(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      isLoading: false,

      saveSession: async (messages: Message[], customTitle?: string) => {
        if (messages.length === 0) {
          throw new Error('Cannot save empty session');
        }

        const sessionId = nanoid();
        const title = customTitle || generateTitleFromMessages(messages);
        const now = Date.now();

        const session: ChatSession = {
          id: sessionId,
          title,
          messages,
          messageCount: messages.length,
          createdAt: now,
          updatedAt: now,
          userId: auth.currentUser?.uid
        };

        // Add to local state immediately
        set(state => ({
          sessions: [session, ...state.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
        }));

        // Save to Firebase if user is authenticated (non-anonymous)
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          try {
            const userId = auth.currentUser.uid;
            const sessionsRef = collection(db, 'users', userId, 'chatSessions');

            const sessionData: Omit<StoredSession, 'id'> = {
              title,
              messages: sanitizeForFirebase(messages),
              messageCount: messages.length,
              createdAt: serverTimestamp() as Timestamp,
              updatedAt: serverTimestamp() as Timestamp,
              userId
            };

            await addDoc(sessionsRef, sessionData);
            
            if (import.meta.env.DEV) {
              console.log('✅ Session saved to Firebase successfully');
            }
          } catch (error) {
            handleSilentError(error, {
              component: 'useHistoryStore',
              action: 'saveSession',
              userId: auth.currentUser?.uid
            });
          }
        }

        return sessionId;
      },

      loadSession: async (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.find(s => s.id === sessionId);

        if (!session) {
          throw new Error('Session not found');
        }

        // Return session data for external handling to avoid circular dependency
        // The calling component should handle loading into chat store
        return {
          success: true,
          session: {
            ...session,
            newSessionId: generateSafeUUID() // Generate new session ID for loaded chat
          }
        };
      },

      updateSessionTitle: async (sessionId: string, newTitle: string) => {
        if (!newTitle.trim()) {
          throw new Error('Title cannot be empty');
        }

        // Update local state
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title: newTitle.trim(), updatedAt: Date.now() }
              : session
          )
        }));

        // Update in Firebase if user is authenticated
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          try {
            const userId = auth.currentUser.uid;
            const sessionRef = doc(db, 'users', userId, 'chatSessions', sessionId);
            
            await updateDoc(sessionRef, {
              title: newTitle.trim(),
              updatedAt: serverTimestamp()
            });
            
            if (import.meta.env.DEV) {
              console.log('✅ Session title updated in Firebase');
            }
          } catch (error) {
            handleSilentError(error, {
              component: 'useHistoryStore',
              action: 'updateSessionTitle',
              userId: auth.currentUser?.uid
            });
          }
        }
      },

      deleteSession: async (sessionId: string) => {
        // Remove from local state
        set(state => ({
          sessions: state.sessions.filter(session => session.id !== sessionId)
        }));

        // Delete from Firebase if user is authenticated
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          try {
            const userId = auth.currentUser.uid;
            const sessionRef = doc(db, 'users', userId, 'chatSessions', sessionId);
            
            await deleteDoc(sessionRef);
            
            if (import.meta.env.DEV) {
              console.log('✅ Session deleted from Firebase');
            }
          } catch (error) {
            handleSilentError(error, {
              component: 'useHistoryStore',
              action: 'deleteSession',
              userId: auth.currentUser?.uid
            });
          }
        }
      },

      loadAllSessions: async () => {
        if (!auth.currentUser || auth.currentUser.isAnonymous) {
          return;
        }

        set({ isLoading: true });

        try {
          const userId = auth.currentUser.uid;
          const sessionsRef = collection(db, 'users', userId, 'chatSessions');
          const q = query(
            sessionsRef,
            orderBy('updatedAt', 'desc'),
            limit(50) // Limit to last 50 sessions
          );

          const querySnapshot = await getDocs(q);
          const sessions: ChatSession[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data() as StoredSession;
            sessions.push({
              id: doc.id,
              title: data.title,
              messages: data.messages,
              messageCount: data.messageCount,
              createdAt: data.createdAt.toMillis(),
              updatedAt: data.updatedAt.toMillis(),
              userId: data.userId
            });
          });

          set({ sessions, isLoading: false });
          
          if (import.meta.env.DEV) {
            console.log(`✅ Loaded ${sessions.length} sessions from Firebase`);
          }
        } catch (error) {
          console.warn('Failed to load sessions from Firebase:', error);
          set({ isLoading: false });
        }
      },

      clearSessions: () => {
        set({ sessions: [] });
      }
    }),
    {
      name: 'neurastack-history-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 20) // Keep only last 20 sessions in localStorage
      }),
    }
  )
);
