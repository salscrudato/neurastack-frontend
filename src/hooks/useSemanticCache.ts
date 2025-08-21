/**
 * Semantic Cache Hook
 *
 * Intelligent response caching system with semantic similarity detection.
 * Dramatically improves response times for similar queries by leveraging
 * TF-IDF similarity scoring and intelligent cache management.
 */

import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import type { NeuraStackQueryResponse } from "../lib/types";

// Cache entry interface
interface CacheEntry {
  id: string;
  query: string;
  response: NeuraStackQueryResponse;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  similarity?: number; // For search results
  queryVector?: number[]; // TF-IDF vector for similarity calculation
}

// Cache configuration
const CACHE_CONFIG = {
  MAX_ENTRIES: 100,
  TTL: 30 * 60 * 1000, // 30 minutes
  SIMILARITY_THRESHOLD: 0.75, // 75% similarity threshold
  MIN_QUERY_LENGTH: 10, // Minimum query length to cache
  MAX_QUERY_LENGTH: 1000, // Maximum query length to process
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  PRELOAD_THRESHOLD: 0.85, // 85% similarity for preloading
} as const;

// Cache store interface
interface CacheStore {
  entries: Map<string, CacheEntry>;
  hitCount: number;
  missCount: number;
  totalQueries: number;
  lastCleanup: number;

  // Actions
  set: (key: string, entry: CacheEntry) => void;
  get: (key: string) => CacheEntry | undefined;
  delete: (key: string) => void;
  clear: () => void;
  cleanup: () => void;
  updateStats: (hit: boolean) => void;
  getStats: () => CacheStats;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalEntries: number;
  totalQueries: number;
  averageAge: number;
  memoryUsage: number;
}

// Zustand store for cache management
const useCacheStore = create<CacheStore>((set, get) => ({
  entries: new Map(),
  hitCount: 0,
  missCount: 0,
  totalQueries: 0,
  lastCleanup: Date.now(),

  set: (key: string, entry: CacheEntry) => {
    set((state) => {
      const newEntries = new Map(state.entries);

      // Remove oldest entries if cache is full
      if (newEntries.size >= CACHE_CONFIG.MAX_ENTRIES) {
        const sortedEntries = Array.from(newEntries.entries()).sort(
          ([, a], [, b]) => a.lastAccessed - b.lastAccessed
        );

        // Remove oldest 20% of entries
        const toRemove = Math.floor(CACHE_CONFIG.MAX_ENTRIES * 0.2);
        for (let i = 0; i < toRemove; i++) {
          newEntries.delete(sortedEntries[i][0]);
        }
      }

      newEntries.set(key, entry);
      return { entries: newEntries };
    });
  },

  get: (key: string) => {
    const entry = get().entries.get(key);
    if (entry) {
      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }
    return entry;
  },

  delete: (key: string) => {
    set((state) => {
      const newEntries = new Map(state.entries);
      newEntries.delete(key);
      return { entries: newEntries };
    });
  },

  clear: () => {
    set({ entries: new Map(), hitCount: 0, missCount: 0, totalQueries: 0 });
  },

  cleanup: () => {
    const now = Date.now();
    set((state) => {
      const newEntries = new Map();

      for (const [key, entry] of state.entries) {
        // Keep entries that are not expired
        if (now - entry.timestamp < CACHE_CONFIG.TTL) {
          newEntries.set(key, entry);
        }
      }

      return { entries: newEntries, lastCleanup: now };
    });
  },

  updateStats: (hit: boolean) => {
    set((state) => ({
      hitCount: state.hitCount + (hit ? 1 : 0),
      missCount: state.missCount + (hit ? 0 : 1),
      totalQueries: state.totalQueries + 1,
    }));
  },

  getStats: (): CacheStats => {
    const state = get();
    const totalQueries = state.totalQueries || 1; // Avoid division by zero
    const entries = Array.from(state.entries.values());
    const now = Date.now();

    return {
      hitRate: state.hitCount / totalQueries,
      missRate: state.missCount / totalQueries,
      totalEntries: state.entries.size,
      totalQueries: state.totalQueries,
      averageAge:
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) /
            entries.length
          : 0,
      memoryUsage: entries.reduce(
        (sum, entry) => sum + JSON.stringify(entry).length,
        0
      ),
    };
  },
}));

// TF-IDF implementation for semantic similarity
class TFIDFCalculator {
  private stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
  ]);

  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.stopWords.has(word));
  }

  calculateTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const totalTokens = tokens.length;

    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Normalize by total tokens
    for (const [token, count] of tf) {
      tf.set(token, count / totalTokens);
    }

    return tf;
  }

  calculateIDF(documents: string[][]): Map<string, number> {
    const idf = new Map<string, number>();
    const totalDocs = documents.length;
    const vocabulary = new Set<string>();

    // Build vocabulary
    for (const doc of documents) {
      for (const token of doc) {
        vocabulary.add(token);
      }
    }

    // Calculate IDF for each term
    for (const term of vocabulary) {
      const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;
      idf.set(term, Math.log(totalDocs / (docsWithTerm + 1))); // +1 for smoothing
    }

    return idf;
  }

  createVector(tokens: string[], idf: Map<string, number>): number[] {
    const tf = this.calculateTF(tokens);
    const vocabulary = Array.from(idf.keys()).sort();

    return vocabulary.map((term) => {
      const tfValue = tf.get(term) || 0;
      const idfValue = idf.get(term) || 0;
      return tfValue * idfValue;
    });
  }

  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

// Main hook
export const useSemanticCache = () => {
  const cacheStore = useCacheStore();
  const tfidfCalculator = useRef(new TFIDFCalculator());
  const idfCache = useRef<Map<string, number>>(new Map());

  // Cleanup interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - cacheStore.lastCleanup > CACHE_CONFIG.CLEANUP_INTERVAL) {
        cacheStore.cleanup();
      }
    }, CACHE_CONFIG.CLEANUP_INTERVAL);

    return () => clearInterval(interval);
  }, [cacheStore]);

  // Update IDF when cache changes
  const updateIDF = useCallback(() => {
    const entries = Array.from(cacheStore.entries.values());
    if (entries.length < 2) return;

    const documents = entries.map((entry) =>
      tfidfCalculator.current.tokenize(entry.query)
    );

    idfCache.current = tfidfCalculator.current.calculateIDF(documents);
  }, [cacheStore.entries]);

  // Find similar cached responses
  const findSimilar = useCallback(
    (query: string): CacheEntry | null => {
      if (
        query.length < CACHE_CONFIG.MIN_QUERY_LENGTH ||
        query.length > CACHE_CONFIG.MAX_QUERY_LENGTH
      ) {
        return null;
      }

      const queryTokens = tfidfCalculator.current.tokenize(query);
      if (queryTokens.length === 0) return null;

      const entries = Array.from(cacheStore.entries.values());
      if (entries.length === 0) return null;

      // Update IDF if needed
      if (idfCache.current.size === 0) {
        updateIDF();
      }

      const queryVector = tfidfCalculator.current.createVector(
        queryTokens,
        idfCache.current
      );
      let bestMatch: CacheEntry | null = null;
      let bestSimilarity = 0;

      for (const entry of entries) {
        // Skip expired entries
        if (Date.now() - entry.timestamp > CACHE_CONFIG.TTL) continue;

        if (!entry.queryVector) {
          const entryTokens = tfidfCalculator.current.tokenize(entry.query);
          entry.queryVector = tfidfCalculator.current.createVector(
            entryTokens,
            idfCache.current
          );
        }

        const similarity = tfidfCalculator.current.cosineSimilarity(
          queryVector,
          entry.queryVector
        );

        if (
          similarity > bestSimilarity &&
          similarity >= CACHE_CONFIG.SIMILARITY_THRESHOLD
        ) {
          bestSimilarity = similarity;
          bestMatch = { ...entry, similarity };
        }
      }

      if (bestMatch) {
        cacheStore.updateStats(true);
        return bestMatch;
      }

      cacheStore.updateStats(false);
      return null;
    },
    [cacheStore, updateIDF]
  );

  // Store response in cache
  const store = useCallback(
    (query: string, response: NeuraStackQueryResponse): void => {
      if (
        query.length < CACHE_CONFIG.MIN_QUERY_LENGTH ||
        query.length > CACHE_CONFIG.MAX_QUERY_LENGTH
      ) {
        return;
      }

      const entry: CacheEntry = {
        id: crypto.randomUUID(),
        query,
        response,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      const cacheKey = `query_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      cacheStore.set(cacheKey, entry);

      // Update IDF for future similarity calculations
      setTimeout(updateIDF, 100);
    },
    [cacheStore, updateIDF]
  );

  // Get cache statistics
  const getStats = useCallback((): CacheStats => {
    return cacheStore.getStats();
  }, [cacheStore]);

  // Clear cache
  const clear = useCallback((): void => {
    cacheStore.clear();
    idfCache.current.clear();
  }, [cacheStore]);

  // Preload similar queries (for future enhancement)
  const getPreloadCandidates = useCallback(
    (query: string): string[] => {
      const entries = Array.from(cacheStore.entries.values());
      const queryTokens = tfidfCalculator.current.tokenize(query);

      if (queryTokens.length === 0 || idfCache.current.size === 0) return [];

      const queryVector = tfidfCalculator.current.createVector(
        queryTokens,
        idfCache.current
      );
      const candidates: Array<{ query: string; similarity: number }> = [];

      for (const entry of entries) {
        if (!entry.queryVector) continue;

        const similarity = tfidfCalculator.current.cosineSimilarity(
          queryVector,
          entry.queryVector
        );
        if (similarity >= CACHE_CONFIG.PRELOAD_THRESHOLD) {
          candidates.push({ query: entry.query, similarity });
        }
      }

      return candidates
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
        .map((c) => c.query);
    },
    [cacheStore]
  );

  return {
    findSimilar,
    store,
    getStats,
    clear,
    getPreloadCandidates,
  };
};
