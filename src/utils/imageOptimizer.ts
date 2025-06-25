/**
 * Enhanced Image Optimization Utilities
 * 
 * Provides modern image loading, optimization, and responsive image handling
 * for better performance and user experience.
 */

import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// Image Loading Utilities
// ============================================================================

/**
 * Modern image loader with WebP support and fallbacks
 */
export class ImageLoader {
  private static cache = new Map<string, Promise<string>>();
  
  /**
   * Load image with modern format support
   */
  static async loadImage(
    src: string,
    options: {
      webpSrc?: string;
      avifSrc?: string;
      fallbackSrc?: string;
      timeout?: number;
    } = {}
  ): Promise<string> {
    const { webpSrc, avifSrc, fallbackSrc, timeout = 10000 } = options;
    
    // Check cache first
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }
    
    const loadPromise = this.loadWithFallbacks(src, {
      webpSrc,
      avifSrc,
      fallbackSrc,
      timeout,
    });
    
    this.cache.set(src, loadPromise);
    return loadPromise;
  }
  
  private static async loadWithFallbacks(
    src: string,
    options: {
      webpSrc?: string;
      avifSrc?: string;
      fallbackSrc?: string;
      timeout: number;
    }
  ): Promise<string> {
    const { webpSrc, avifSrc, fallbackSrc, timeout } = options;
    
    // Try modern formats first if supported
    const formats = [
      { src: avifSrc, type: 'image/avif' },
      { src: webpSrc, type: 'image/webp' },
      { src, type: 'image/jpeg' },
      { src: fallbackSrc, type: 'image/jpeg' },
    ].filter(format => format.src);
    
    for (const format of formats) {
      try {
        if (await this.canUseFormat(format.type)) {
          await this.loadSingleImage(format.src!, timeout);
          return format.src!;
        }
      } catch (error) {
        // Continue to next format
        continue;
      }
    }
    
    throw new Error(`Failed to load image: ${src}`);
  }
  
  private static async canUseFormat(type: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);
      img.src = `data:${type};base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=`;
    });
  }
  
  private static loadSingleImage(src: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`));
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }
  
  /**
   * Preload images for better UX
   */
  static preloadImages(sources: string[]): Promise<(string | void)[]> {
    return Promise.all(
      sources.map(src => this.loadImage(src).catch(() => {}))
    );
  }
  
  /**
   * Clear image cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// React Hooks for Image Optimization
// ============================================================================

/**
 * Hook for optimized image loading with progressive enhancement
 */
export function useOptimizedImage(
  src: string,
  options: {
    webpSrc?: string;
    avifSrc?: string;
    fallbackSrc?: string;
    placeholder?: string;
    lazy?: boolean;
    timeout?: number;
  } = {}
) {
  const {
    webpSrc,
    avifSrc,
    fallbackSrc,
    placeholder,
    lazy = true,
    timeout = 10000,
  } = options;
  
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInView, setIsInView] = useState(!lazy);
  
  const loadImage = useCallback(async () => {
    if (!src || !isInView) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const optimizedSrc = await ImageLoader.loadImage(src, {
        webpSrc,
        avifSrc,
        fallbackSrc,
        timeout,
      });
      
      setCurrentSrc(optimizedSrc);
    } catch (err) {
      setError(err as Error);
      // Fallback to original src
      setCurrentSrc(src);
    } finally {
      setIsLoading(false);
    }
  }, [src, webpSrc, avifSrc, fallbackSrc, timeout, isInView]);
  
  useEffect(() => {
    loadImage();
  }, [loadImage]);
  
  return {
    src: currentSrc,
    isLoading,
    error,
    setIsInView,
    retry: loadImage,
  };
}

/**
 * Hook for responsive image sources
 */
export function useResponsiveImage(
  sources: {
    mobile: string;
    tablet?: string;
    desktop: string;
    webp?: {
      mobile: string;
      tablet?: string;
      desktop: string;
    };
  }
) {
  const [currentSrc, setCurrentSrc] = useState(sources.mobile);
  
  useEffect(() => {
    const updateSource = () => {
      const width = window.innerWidth;
      
      if (width >= 1024) {
        setCurrentSrc(sources.webp?.desktop || sources.desktop);
      } else if (width >= 768) {
        setCurrentSrc(sources.webp?.tablet || sources.tablet || sources.desktop);
      } else {
        setCurrentSrc(sources.webp?.mobile || sources.mobile);
      }
    };
    
    updateSource();
    window.addEventListener('resize', updateSource);
    
    return () => window.removeEventListener('resize', updateSource);
  }, [sources]);
  
  return currentSrc;
}

// ============================================================================
// Image Optimization Utilities
// ============================================================================

/**
 * Generate responsive image URLs for different screen sizes
 */
export function generateResponsiveUrls(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): string[] {
  return sizes.map(size => `${baseUrl}?w=${size}&q=80&f=webp`);
}

/**
 * Create optimized image props for Chakra UI Image component
 */
export function createOptimizedImageProps(
  src: string,
  alt: string,
  options: {
    sizes?: string;
    loading?: 'lazy' | 'eager';
    priority?: boolean;
  } = {}
) {
  const { sizes = '100vw', loading = 'lazy', priority = false } = options;
  
  return {
    src,
    alt,
    loading: priority ? 'eager' : loading,
    sizes,
    decoding: 'async' as const,
    style: {
      contentVisibility: 'auto',
    },
  };
}

/**
 * Optimize image for different use cases
 */
export const ImageOptimizer = {
  // Avatar optimization
  avatar: (src: string, size: number = 40) => ({
    src: `${src}?w=${size * 2}&h=${size * 2}&fit=crop&f=webp&q=85`,
    width: size,
    height: size,
  }),
  
  // Hero image optimization
  hero: (src: string) => ({
    src: `${src}?w=1920&h=1080&fit=crop&f=webp&q=80`,
    sizes: '100vw',
  }),
  
  // Thumbnail optimization
  thumbnail: (src: string, size: number = 200) => ({
    src: `${src}?w=${size}&h=${size}&fit=crop&f=webp&q=85`,
    width: size,
    height: size,
  }),
  
  // Card image optimization
  card: (src: string) => ({
    src: `${src}?w=400&h=300&fit=crop&f=webp&q=80`,
    sizes: '(max-width: 768px) 100vw, 400px',
  }),
};
