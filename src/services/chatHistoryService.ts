/**
 * src/services/chatHistoryService.ts
 * ---------------------------------------------------------------------------
 * Firebase service functions for chat history storage and retrieval
 * Handles saving and loading chat messages for authenticated users
 * ---------------------------------------------------------------------------
 */

import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Message } from '../store/useChatStore';

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
    throw new Error('User must be authenticated to save messages');
  }

  try {
    const userId = auth.currentUser.uid;
    const messagesRef = collection(db, 'users', userId, 'chatMessages');

    const messageData: Omit<StoredMessage, 'id'> = {
      role: message.role,
      text: message.text,
      timestamp: serverTimestamp() as Timestamp,
      userId,
      metadata: message.metadata
    };

    await addDoc(messagesRef, messageData);
  } catch (error) {
    console.error('Firebase save error:', error);
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to save message to Firebase: ${error.message}`);
    }
    throw new Error('Failed to save message to Firebase: Unknown error');
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
