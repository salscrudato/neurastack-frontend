/**
 * src/hooks/usePrompts.ts
 * ---------------------------------------------------------------------------
 * Custom hooks for NeuraPrompts data fetching and state management
 * ---------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  getPersonalPrompts,
  getCommunityPrompts,
  getTrendingPrompts,
  searchPromptsByTags,
  getPromptStats,
  type PersonalPrompt,
  type CommunityPrompt
} from '../services/promptsService';

/**
 * Hook for managing personal prompts
 */
export function usePersonalPrompts() {
  const [prompts, setPrompts] = useState<PersonalPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchPrompts = useCallback(async () => {
    if (!user) {
      setPrompts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const personalPrompts = await getPersonalPrompts();
      setPrompts(personalPrompts);
    } catch (err) {
      console.error('Error fetching personal prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const refetch = useCallback(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for managing community prompts
 */
export function useCommunityPrompts(limitCount: number = 50) {
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const communityPrompts = await getCommunityPrompts(limitCount);
      setPrompts(communityPrompts);
    } catch (err) {
      console.error('Error fetching community prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch community prompts');
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const refetch = useCallback(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for trending prompts
 */
export function useTrendingPrompts() {
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const trendingPrompts = await getTrendingPrompts();
      setPrompts(trendingPrompts);
    } catch (err) {
      console.error('Error fetching trending prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const refetch = useCallback(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    prompts,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for searching prompts by tags
 */
export function usePromptSearch() {
  const [results, setResults] = useState<(PersonalPrompt | CommunityPrompt)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByTags = useCallback(async (tags: string[], isPersonal: boolean = false) => {
    if (tags.length === 0) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchPromptsByTags(tags, isPersonal);
      setResults(searchResults);
    } catch (err) {
      console.error('Error searching prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to search prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchByTags,
    clearResults
  };
}

/**
 * Hook for prompt statistics
 */
export function usePromptStats() {
  const [stats, setStats] = useState({
    totalPersonal: 0,
    totalShared: 0,
    totalUses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats({ totalPersonal: 0, totalShared: 0, totalUses: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const promptStats = await getPromptStats();
      setStats(promptStats);
    } catch (err) {
      console.error('Error fetching prompt stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for managing prompt operations (save, update, delete, share)
 */
export function usePromptOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = useCallback(async (operation: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      console.error('Prompt operation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeOperation,
    clearError
  };
}

/**
 * Hook for managing popular tags
 */
export function usePopularTags() {
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { prompts: communityPrompts } = useCommunityPrompts();
  const { prompts: personalPrompts } = usePersonalPrompts();

  useEffect(() => {
    setLoading(true);
    
    // Combine all prompts and count tag frequency
    const allPrompts = [...communityPrompts, ...personalPrompts];
    const tagCounts: Record<string, number> = {};

    allPrompts.forEach(prompt => {
      prompt.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 tags

    setTags(sortedTags);
    setLoading(false);
  }, [communityPrompts, personalPrompts]);

  return {
    tags,
    loading
  };
}
