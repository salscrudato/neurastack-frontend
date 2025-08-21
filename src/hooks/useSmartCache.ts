/**
 * Smart Caching System
 * 
 * Intelligent response caching with semantic similarity detection,
 * TTL management, and predictive prefetching for optimal user experience.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface CacheEntry<T> {
    key: string;
    data: T;
    timestamp: number;
    ttl: number;
    accessCount: number;
    lastAccessed: number;
    similarity?: number;
    metadata?: Record<string, any>;
}

interface CacheOptions {
    maxSize?: number;
    defaultTTL?: number; // Time to live in milliseconds
    enableSimilarity?: boolean;
    similarityThreshold?: number;
    enablePredictive?: boolean;
}

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
    memoryUsage: number;
}

/**
 * Smart cache hook with semantic similarity and predictive features
 */
export function useSmartCache<T>(options: CacheOptions = {}) {
    const {
        maxSize = 100,
        defaultTTL = 30 * 60 * 1000, // 30 minutes
        enableSimilarity = true,
        similarityThreshold = 0.8,
        enablePredictive = true
    } = options;

    const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
    const [stats, setStats] = useState<CacheStats>({
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
        memoryUsage: 0
    });

    // Calculate semantic similarity between two strings
    const calculateSimilarity = useCallback((str1: string, str2: string): number => {
        if (!enableSimilarity) return 0;
        
        // Simple Jaccard similarity for demonstration
        // In production, you might use more sophisticated NLP techniques
        const words1 = new Set(str1.toLowerCase().split(/\s+/));
        const words2 = new Set(str2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }, [enableSimilarity]);

    // Generate cache key with normalization
    const generateKey = useCallback((input: string): string => {
        return input.toLowerCase().trim().replace(/\s+/g, ' ');
    }, []);

    // Clean expired entries
    const cleanExpired = useCallback(() => {
        const now = Date.now();
        const toDelete: string[] = [];
        
        cache.current.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                toDelete.push(key);
            }
        });
        
        toDelete.forEach(key => cache.current.delete(key));
        
        return toDelete.length;
    }, []);

    // LRU eviction when cache is full
    const evictLRU = useCallback(() => {
        if (cache.current.size <= maxSize) return;
        
        let oldestKey = '';
        let oldestTime = Date.now();
        
        cache.current.forEach((entry, key) => {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        });
        
        if (oldestKey) {
            cache.current.delete(oldestKey);
        }
    }, [maxSize]);

    // Find similar cached entries
    const findSimilar = useCallback((input: string): CacheEntry<T> | null => {
        if (!enableSimilarity) return null;
        
        let bestMatch: CacheEntry<T> | null = null;
        let bestSimilarity = 0;
        
        cache.current.forEach((entry) => {
            const similarity = calculateSimilarity(input, entry.key);
            if (similarity > similarityThreshold && similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = { ...entry, similarity };
            }
        });
        
        return bestMatch;
    }, [enableSimilarity, similarityThreshold, calculateSimilarity]);

    // Get from cache
    const get = useCallback((input: string): T | null => {
        const key = generateKey(input);
        const now = Date.now();
        
        // Clean expired entries periodically
        if (Math.random() < 0.1) { // 10% chance
            cleanExpired();
        }
        
        // Direct hit
        const directEntry = cache.current.get(key);
        if (directEntry && now - directEntry.timestamp <= directEntry.ttl) {
            directEntry.accessCount++;
            directEntry.lastAccessed = now;
            
            setStats(prev => ({
                ...prev,
                hits: prev.hits + 1,
                hitRate: (prev.hits + 1) / (prev.hits + prev.misses + 1)
            }));
            
            return directEntry.data;
        }
        
        // Similarity search
        const similarEntry = findSimilar(input);
        if (similarEntry) {
            similarEntry.accessCount++;
            similarEntry.lastAccessed = now;
            
            setStats(prev => ({
                ...prev,
                hits: prev.hits + 1,
                hitRate: (prev.hits + 1) / (prev.hits + prev.misses + 1)
            }));
            
            return similarEntry.data;
        }
        
        // Cache miss
        setStats(prev => ({
            ...prev,
            misses: prev.misses + 1,
            hitRate: prev.hits / (prev.hits + prev.misses + 1)
        }));
        
        return null;
    }, [generateKey, cleanExpired, findSimilar]);

    // Set in cache
    const set = useCallback((input: string, data: T, customTTL?: number) => {
        const key = generateKey(input);
        const now = Date.now();
        
        const entry: CacheEntry<T> = {
            key,
            data,
            timestamp: now,
            ttl: customTTL || defaultTTL,
            accessCount: 1,
            lastAccessed: now,
            metadata: {
                size: JSON.stringify(data).length // Rough size estimate
            }
        };
        
        cache.current.set(key, entry);
        evictLRU();
        
        // Update stats
        setStats(prev => ({
            ...prev,
            size: cache.current.size,
            memoryUsage: prev.memoryUsage + (entry.metadata?.size || 0)
        }));
    }, [generateKey, defaultTTL, evictLRU]);

    // Predictive prefetching based on patterns
    const prefetch = useCallback(async (
        input: string, 
        fetchFn: (input: string) => Promise<T>
    ) => {
        if (!enablePredictive) return;
        
        const key = generateKey(input);
        if (cache.current.has(key)) return; // Already cached
        
        try {
            const data = await fetchFn(input);
            set(input, data, defaultTTL * 2); // Longer TTL for prefetched data
        } catch (error) {
            console.warn('Prefetch failed:', error);
        }
    }, [enablePredictive, generateKey, set, defaultTTL]);

    // Clear cache
    const clear = useCallback(() => {
        cache.current.clear();
        setStats({
            hits: 0,
            misses: 0,
            size: 0,
            hitRate: 0,
            memoryUsage: 0
        });
    }, []);

    // Get cache statistics
    const getStats = useCallback((): CacheStats => {
        const memoryUsage = Array.from(cache.current.values())
            .reduce((total, entry) => total + (entry.metadata?.size || 0), 0);
        
        return {
            ...stats,
            size: cache.current.size,
            memoryUsage
        };
    }, [stats]);

    // Periodic cleanup
    useEffect(() => {
        const interval = setInterval(() => {
            const cleaned = cleanExpired();
            if (cleaned > 0) {
                setStats(prev => ({
                    ...prev,
                    size: cache.current.size
                }));
            }
        }, 5 * 60 * 1000); // Every 5 minutes
        
        return () => clearInterval(interval);
    }, [cleanExpired]);

    return {
        get,
        set,
        clear,
        prefetch,
        stats: getStats(),
        cache: cache.current
    };
}

/**
 * Specialized cache for AI responses with query pattern analysis
 */
export function useAIResponseCache() {
    const cache = useSmartCache<any>({
        maxSize: 50,
        defaultTTL: 60 * 60 * 1000, // 1 hour
        enableSimilarity: true,
        similarityThreshold: 0.85,
        enablePredictive: true
    });

    const [queryPatterns, setQueryPatterns] = useState<Map<string, number>>(new Map());

    // Analyze query patterns for better caching
    const analyzeQuery = useCallback((query: string) => {
        const words = query.toLowerCase().split(/\s+/);
        const patterns = words.filter(word => word.length > 3); // Focus on meaningful words
        
        setQueryPatterns(prev => {
            const newPatterns = new Map(prev);
            patterns.forEach(pattern => {
                newPatterns.set(pattern, (newPatterns.get(pattern) || 0) + 1);
            });
            return newPatterns;
        });
        
        return patterns;
    }, []);

    // Get response with pattern analysis
    const getResponse = useCallback((query: string) => {
        analyzeQuery(query);
        return cache.get(query);
    }, [cache, analyzeQuery]);

    // Set response with enhanced metadata
    const setResponse = useCallback((query: string, response: any) => {
        const patterns = analyzeQuery(query);
        const enhancedResponse = {
            ...response,
            _cacheMetadata: {
                patterns,
                timestamp: Date.now(),
                queryLength: query.length
            }
        };
        
        cache.set(query, enhancedResponse);
    }, [cache, analyzeQuery]);

    // Get popular query patterns
    const getPopularPatterns = useCallback(() => {
        return Array.from(queryPatterns.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);
    }, [queryPatterns]);

    return {
        ...cache,
        get: getResponse,
        set: setResponse,
        getPopularPatterns,
        queryPatterns: Array.from(queryPatterns.entries())
    };
}
