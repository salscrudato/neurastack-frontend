import { Box, Image, Skeleton, useColorModeValue } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  sizes?: string;
  priority?: boolean;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string | number;
  fallbackSrc?: string;
}

interface ImageSource {
  srcSet: string;
  type: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  format = 'webp',
  sizes,
  priority = false,
  lazy = true,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  className,
  objectFit = 'cover',
  borderRadius,
  fallbackSrc
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const bgColor = useColorModeValue('gray.100', 'gray.700');

  // Generate optimized image sources
  const generateSources = useCallback((): ImageSource[] => {
    const sources: ImageSource[] = [];
    const baseUrl = src.split('?')[0];
    const params = new URLSearchParams();

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());

    // Generate different format sources
    const formats = ['avif', 'webp', 'jpg'];
    
    formats.forEach(fmt => {
      params.set('f', fmt);
      const srcSet = generateSrcSet(baseUrl, params);
      sources.push({
        srcSet,
        type: `image/${fmt === 'jpg' ? 'jpeg' : fmt}`
      });
    });

    return sources;
  }, [src, width, height, quality]);

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback((baseUrl: string, params: URLSearchParams): string => {
    const densities = [1, 2, 3];
    const originalWidth = width ? parseInt(width.toString()) : 800;

    return densities
      .map(density => {
        const scaledWidth = originalWidth * density;
        const scaledParams = new URLSearchParams(params);
        scaledParams.set('w', scaledWidth.toString());
        return `${baseUrl}?${scaledParams.toString()} ${density}x`;
      })
      .join(', ');
  }, [width]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback image if available
    if (fallbackSrc && imgRef.current && imgRef.current.src !== fallbackSrc) {
      imgRef.current.src = fallbackSrc;
      return;
    }
    
    onError?.(event.nativeEvent);
  }, [fallbackSrc, onError]);

  // Generate blur placeholder
  const generateBlurPlaceholder = useCallback((): string => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 10, 10);
    }
    
    return canvas.toDataURL();
  }, [blurDataURL, bgColor]);

  const sources = generateSources();

  // Don't render anything if not in view and lazy loading is enabled
  if (lazy && !priority && !isInView) {
    return (
      <Box
        ref={imgRef}
        width={width}
        height={height}
        bg={bgColor}
        borderRadius={borderRadius}
        className={className}
      />
    );
  }

  return (
    <Box
      position="relative"
      width={width}
      height={height}
      borderRadius={borderRadius}
      overflow="hidden"
      className={className}
    >
      {/* Loading skeleton */}
      {isLoading && placeholder === 'blur' && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          borderRadius={borderRadius}
        />
      )}

      {/* Blur placeholder */}
      {isLoading && placeholder === 'blur' && blurDataURL && (
        <Image
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          src={generateBlurPlaceholder()}
          alt=""
          objectFit={objectFit}
          filter="blur(10px)"
          transform="scale(1.1)" // Slightly scale to hide blur edges
          borderRadius={borderRadius}
        />
      )}

      {/* Main image with picture element for format optimization */}
      <picture>
        {sources.map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet}
            type={source.type}
            sizes={sizes}
          />
        ))}
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          width="100%"
          height="100%"
          objectFit={objectFit}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          borderRadius={borderRadius}
        />
      </picture>

      {/* Error state */}
      {hasError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bg={bgColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius={borderRadius}
        >
          <Box textAlign="center" color="gray.500">
            <Box fontSize="2xl" mb={2}>📷</Box>
            <Box fontSize="sm">Image not available</Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Hook for preloading images
export const useImagePreloader = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve();
        return;
      }

      if (loadingImages.has(src)) {
        // Already loading, wait for it
        const checkLoaded = () => {
          if (loadedImages.has(src)) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoadingImages(prev => new Set(prev).add(src));

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        resolve();
      };
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, [loadedImages, loadingImages]);

  const preloadImages = useCallback(async (sources: string[]): Promise<void> => {
    await Promise.allSettled(sources.map(preloadImage));
  }, [preloadImage]);

  const isImageLoaded = useCallback((src: string): boolean => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const isImageLoading = useCallback((src: string): boolean => {
    return loadingImages.has(src);
  }, [loadingImages]);

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageLoading,
    loadedCount: loadedImages.size,
    loadingCount: loadingImages.size
  };
};

// Progressive image component that loads low quality first
export const ProgressiveImage: React.FC<OptimizedImageProps & { 
  lowQualitySrc?: string;
  highQualitySrc?: string;
}> = ({
  lowQualitySrc,
  highQualitySrc,
  src,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    if (!highQualitySrc && !lowQualitySrc) return;

    const targetSrc = highQualitySrc || src;
    
    // Preload high quality image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(targetSrc);
      setIsHighQualityLoaded(true);
    };
    img.src = targetSrc;
  }, [src, lowQualitySrc, highQualitySrc]);

  return (
    <OptimizedImage
      {...props}
      src={currentSrc}
      className={props.className}
    />
  );
};

export default OptimizedImage;
