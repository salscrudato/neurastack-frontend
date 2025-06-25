import { Box, Image, Skeleton } from '@chakra-ui/react';
import React, { memo } from 'react';
import { useOptimizedImage } from '../../utils/imageOptimizer';
import { useIntersectionObserver } from '../../utils/performanceOptimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  webpSrc?: string;
  avifSrc?: string;
  fallbackSrc?: string;
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  lazy?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  sizes?: string;
  className?: string;
}

/**
 * Optimized Image component with modern format support, lazy loading,
 * and progressive enhancement
 */
export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  webpSrc,
  avifSrc,
  fallbackSrc,
  placeholder,
  width,
  height,
  borderRadius = '0',
  objectFit = 'cover',
  lazy = true,
  priority = false,
  onLoad,
  onError,
  sizes = '100vw',
  className,
}) => {
  const [setRef, entry] = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '50px',
  });

  const isIntersecting = entry?.isIntersecting || !lazy || priority;

  const {
    src: optimizedSrc,
    isLoading,
    error,
    setIsInView,
  } = useOptimizedImage(src, {
    webpSrc,
    avifSrc,
    fallbackSrc,
    placeholder,
    lazy: lazy && !priority,
  });

  // Update intersection status
  React.useEffect(() => {
    if (isIntersecting) {
      setIsInView(true);
    }
  }, [isIntersecting, setIsInView]);

  // Handle load and error events
  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    if (error) {
      onError?.(error);
    }
  };

  if (lazy && !priority && !isIntersecting) {
    return (
      <Box
        ref={setRef}
        width={width}
        height={height}
        borderRadius={borderRadius}
        className={className}
      >
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          startColor="gray.100"
          endColor="gray.200"
        />
      </Box>
    );
  }

  return (
    <Box
      width={width}
      height={height}
      borderRadius={borderRadius}
      overflow="hidden"
      position="relative"
      className={className}
    >
      {isLoading && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          startColor="gray.100"
          endColor="gray.200"
        />
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        width="100%"
        height="100%"
        objectFit={objectFit}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          contentVisibility: 'auto',
        }}
      />
    </Box>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
