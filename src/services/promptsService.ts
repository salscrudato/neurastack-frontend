/**
 * src/services/promptsService.ts
 * ---------------------------------------------------------------------------
 * Firebase service functions for NeuraPrompts feature
 * Handles personal prompts, community prompts, and usage tracking
 * ---------------------------------------------------------------------------
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  increment,
  type Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// TypeScript interfaces for prompts
export interface PersonalPrompt {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  shared: boolean;
  communityId?: string | null;
}

export interface CommunityPrompt {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  sharedAt: Timestamp;
  usesCount: number;
  weeklyUses: number;
  lastUsed: Timestamp | null;
}

export interface PromptFormData {
  title: string;
  content: string;
  tags: string[];
}

/**
 * Save a personal prompt for the current user
 */
export async function savePrompt(promptData: PromptFormData): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to save prompts');
  }

  const userId = auth.currentUser.uid;
  const promptsRef = collection(db, 'users', userId, 'prompts');

  const docRef = await addDoc(promptsRef, {
    ...promptData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    shared: false,
    communityId: null
  });

  return docRef.id;
}

/**
 * Update an existing personal prompt
 */
export async function updatePrompt(promptId: string, promptData: Partial<PromptFormData>): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to update prompts');
  }

  const userId = auth.currentUser.uid;
  const promptRef = doc(db, 'users', userId, 'prompts', promptId);

  await updateDoc(promptRef, {
    ...promptData,
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete a personal prompt
 */
export async function deletePrompt(promptId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to delete prompts');
  }

  const userId = auth.currentUser.uid;
  const promptRef = doc(db, 'users', userId, 'prompts', promptId);

  // Get the prompt to check if it's shared
  const promptSnap = await getDoc(promptRef);
  if (promptSnap.exists()) {
    const promptData = promptSnap.data() as PersonalPrompt;

    // If shared, also delete from community
    if (promptData.shared && promptData.communityId) {
      const communityRef = doc(db, 'communityPrompts', promptData.communityId);
      await deleteDoc(communityRef);
    }
  }

  await deleteDoc(promptRef);
}

/**
 * Share a personal prompt to the community
 */
export async function sharePrompt(promptId: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to share prompts');
  }

  const userId = auth.currentUser.uid;
  const promptRef = doc(db, 'users', userId, 'prompts', promptId);
  const promptSnap = await getDoc(promptRef);

  if (!promptSnap.exists()) {
    throw new Error('Prompt not found');
  }

  const prompt = promptSnap.data() as PersonalPrompt;

  // Check if already shared
  if (prompt.shared) {
    throw new Error('Prompt is already shared');
  }

  // Add to community prompts
  const communityRef = await addDoc(collection(db, 'communityPrompts'), {
    title: prompt.title,
    content: prompt.content,
    tags: prompt.tags,
    authorId: userId,
    authorName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
    sharedAt: serverTimestamp(),
    usesCount: 0,
    weeklyUses: 0,
    lastUsed: null
  });

  // Update personal prompt to mark as shared
  await updateDoc(promptRef, {
    shared: true,
    communityId: communityRef.id,
    updatedAt: serverTimestamp()
  });

  return communityRef.id;
}

/**
 * Unshare a prompt from the community
 */
export async function unsharePrompt(promptId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to unshare prompts');
  }

  const userId = auth.currentUser.uid;
  const promptRef = doc(db, 'users', userId, 'prompts', promptId);
  const promptSnap = await getDoc(promptRef);

  if (!promptSnap.exists()) {
    throw new Error('Prompt not found');
  }

  const prompt = promptSnap.data() as PersonalPrompt;

  if (prompt.shared && prompt.communityId) {
    // Remove from community
    const communityRef = doc(db, 'communityPrompts', prompt.communityId);
    await deleteDoc(communityRef);

    // Update personal prompt
    await updateDoc(promptRef, {
      shared: false,
      communityId: null,
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Get all personal prompts for the current user
 */
export async function getPersonalPrompts(): Promise<PersonalPrompt[]> {
  if (!auth.currentUser) {
    return [];
  }

  const userId = auth.currentUser.uid;
  const promptsRef = collection(db, 'users', userId, 'prompts');
  const q = query(promptsRef, orderBy('updatedAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PersonalPrompt));
}

/**
 * Get community prompts with optional filtering
 */
export async function getCommunityPrompts(limitCount: number = 50): Promise<CommunityPrompt[]> {
  const promptsRef = collection(db, 'communityPrompts');
  const q = query(promptsRef, orderBy('sharedAt', 'desc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as CommunityPrompt));
}

/**
 * Get trending community prompts (top 10 by weekly usage)
 */
export async function getTrendingPrompts(): Promise<CommunityPrompt[]> {
  const promptsRef = collection(db, 'communityPrompts');
  const q = query(promptsRef, orderBy('weeklyUses', 'desc'), limit(10));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as CommunityPrompt));
}

/**
 * Search prompts by tags
 */
export async function searchPromptsByTags(tags: string[], isPersonal: boolean = false): Promise<(PersonalPrompt | CommunityPrompt)[]> {
  if (isPersonal) {
    if (!auth.currentUser) return [];

    const userId = auth.currentUser.uid;
    const promptsRef = collection(db, 'users', userId, 'prompts');
    const q = query(promptsRef, where('tags', 'array-contains-any', tags), orderBy('updatedAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PersonalPrompt));
  } else {
    const promptsRef = collection(db, 'communityPrompts');
    const q = query(promptsRef, where('tags', 'array-contains-any', tags), orderBy('sharedAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CommunityPrompt));
  }
}

/**
 * Record usage of a community prompt (increment counters)
 */
export async function recordPromptUsage(promptId: string): Promise<void> {
  const promptRef = doc(db, 'communityPrompts', promptId);

  await updateDoc(promptRef, {
    usesCount: increment(1),
    weeklyUses: increment(1),
    lastUsed: serverTimestamp()
  });
}

/**
 * Save a community prompt to personal collection
 */
export async function saveToPersonal(communityPrompt: CommunityPrompt): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to save prompts');
  }

  const promptData: PromptFormData = {
    title: communityPrompt.title,
    content: communityPrompt.content,
    tags: communityPrompt.tags
  };

  return await savePrompt(promptData);
}

/**
 * Get prompt statistics for the current user
 */
export async function getPromptStats(): Promise<{
  totalPersonal: number;
  totalShared: number;
  totalUses: number;
}> {
  if (!auth.currentUser) {
    return { totalPersonal: 0, totalShared: 0, totalUses: 0 };
  }

  const userId = auth.currentUser.uid;

  // Get personal prompts count
  const personalRef = collection(db, 'users', userId, 'prompts');
  const personalSnap = await getDocs(personalRef);
  const totalPersonal = personalSnap.size;

  // Count shared prompts
  const sharedPrompts = personalSnap.docs.filter(doc => doc.data().shared);
  const totalShared = sharedPrompts.length;

  // Get total uses of user's shared prompts
  const communityRef = collection(db, 'communityPrompts');
  const userCommunityQuery = query(communityRef, where('authorId', '==', userId));
  const communitySnap = await getDocs(userCommunityQuery);

  const totalUses = communitySnap.docs.reduce((sum, doc) => {
    return sum + (doc.data().usesCount || 0);
  }, 0);

  return { totalPersonal, totalShared, totalUses };
}
