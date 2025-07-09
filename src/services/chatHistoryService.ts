/**
 * src/services/chatHistoryService.ts
 * ---------------------------------------------------------------------------
 * Firebase service functions for chat history storage and retrieval
 * Handles saving and loading chat messages for authenticated users
 * ---------------------------------------------------------------------------
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
    type Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Message } from '../stores/useChatStore';

/**
 * Recursively remove undefined values from an object to prevent Firebase errors
 * Firebase doesn't allow undefined values in documents
 */
function sanitizeForFirebase(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirebase).filter(item => item !== null && item !== undefined);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedValue = sanitizeForFirebase(value);
      if (sanitizedValue !== null && sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    }
    return sanitized;
  }

  return obj;
}

// TypeScript interface for stored chat messages
export interface StoredMessage extends Omit<Message, 'timestamp'> {
  timestamp: Timestamp;
  userId: string;
}

/**
 * Save a message to Firebase for the current user
 */
export async function saveMessageToFirebase(message: Message): Promise<void> {
  if (!auth.currentUser) {
    console.warn('User not authenticated, skipping Firebase save');
    return; // Gracefully handle unauthenticated users
  }

  // Check if user is anonymous - skip Firebase save for anonymous users
  if (auth.currentUser.isAnonymous) {
    console.log('Anonymous user detected, skipping Firebase save');
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    const messagesRef = collection(db, 'users', userId, 'chatMessages');

    const messageData: Omit<StoredMessage, 'id'> = {
      role: message.role,
      text: message.text,
      timestamp: serverTimestamp() as Timestamp,
      userId,
      metadata: sanitizeForFirebase(message.metadata || {})
    };

    // Sanitize the entire message data to remove any undefined values
    const sanitizedMessageData = sanitizeForFirebase(messageData);

    await addDoc(messagesRef, sanitizedMessageData);
    if (import.meta.env.DEV) {
      console.log('✅ Message saved to Firebase successfully');
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Firebase save error:', error);
    }

    // Handle specific Firebase errors gracefully
    if (error instanceof Error) {
      if (error.message.includes('permission') || error.message.includes('insufficient')) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Firebase permissions issue - continuing with local storage only');
        }
        return; // Don't throw error, just log warning
      }
      if (error.message.includes('offline') || error.message.includes('network')) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Firebase offline - continuing with local storage only');
        }
        return; // Don't throw error for network issues
      }
    }

    // Only throw for unexpected errors
    if (import.meta.env.DEV) {
      console.error('❌ Unexpected Firebase error:', error);
    }
    throw new Error(`Failed to save message to Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load chat history from Firebase for the current user
 */
export async function loadChatHistoryFromFirebase(limitCount: number = 50): Promise<Message[]> {
  if (!auth.currentUser) {
    return [];
  }

  const userId = auth.currentUser.uid;
  const messagesRef = collection(db, 'users', userId, 'chatMessages');
  
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const messages: Message[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data() as StoredMessage;
    messages.push({
      id: doc.id,
      role: data.role,
      text: data.text,
      timestamp: data.timestamp.toMillis(),
      metadata: data.metadata
    });
  });

  // Reverse to get chronological order (oldest first)
  return messages.reverse();
}

/**
 * Clear all chat history for the current user
 */
export async function clearChatHistoryFromFirebase(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to clear messages');
  }

  const userId = auth.currentUser.uid;
  const messagesRef = collection(db, 'users', userId, 'chatMessages');
  
  const querySnapshot = await getDocs(messagesRef);
  
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

/**
 * Delete a specific message from Firebase
 */
export async function deleteMessageFromFirebase(messageId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to delete messages');
  }

  const userId = auth.currentUser.uid;
  const messageRef = doc(db, 'users', userId, 'chatMessages', messageId);
  
  await deleteDoc(messageRef);
}
