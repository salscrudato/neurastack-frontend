/**
 * Optimized Image Component
 * 
 * High-performance image component with lazy loading, WebP support,
 * and modern optimization techniques.
 */

import { Box, type BoxProps } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createLazyObserver, getDeviceCapabilities, lazyLoadImage } from '../../../utils/performance';

// ============================================================================
// Types
// ============================================================================

export interface OptimizedImageProps extends Omit<BoxProps, 'as'> {
  /** Image source URL */
  src: string;
  
  /** WebP source URL (optional) */
  webpSrc?: string;
  
  /** Alt text for accessibility */
  alt: string;
  
  /** Placeholder image or color */
  placeholder?: string;
  
  /** Enable lazy loading */
  lazy?: boolean;
  
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  
  /** Image sizes for responsive loading */
  sizes?: string;
  
  /** Srcset for responsive images */
  srcSet?: string;
  
  /** Callback when image loads */
  onLoad?: () => void;
  
  /** Callback when image fails to load */
  onError?: () => void;
  
  /** Enable blur-up effect */
  blurUp?: boolean;
  
  /** Custom aspect ratio */
  aspectRatio?: number;
  
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  
  /** Object position */
  objectPosition?: string;
}

// ============================================================================
// Component
// ============================================================================

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  webpSrc,
  alt,
  placeholder,
  lazy = true,
  loading = 'lazy',
  sizes,
  srcSet,
  onLoad,
  onError,
  blurUp = true,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  ...boxProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Get device capabilities
  const capabilities = getDeviceCapabilities();
  
  // Determine the best source to use
  const getBestSource = useCallback(() => {
    if (capabilities.supportsWebP && webpSrc) {
      return webpSrc;
    }
    return src;
  }, [src, webpSrc, capabilities.supportsWebP]);
  
  // Handle image loading
  const loadImage = useCallback(async () => {
    if (!imgRef.current) return;
    
    try {
      const bestSrc = getBestSource();
      await lazyLoadImage(imgRef.current, bestSrc, placeholder);
      setCurrentSrc(bestSrc);
      setIsLoaded(true);
      onLoad?.();
    } catch (error) {
      console.error('Failed to load image:', error);
      setIsError(true);
      onError?.();
    }
  }, [getBestSource, placeholder, onLoad, onError]);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current || !capabilities.supportsIntersectionObserver) {
      // Load immediately if not lazy or no intersection observer support
      loadImage();
      return;
    }
    
    observerRef.current = createLazyObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
    
    observerRef.current.observe(imgRef.current);
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, loadImage, capabilities.supportsIntersectionObserver]);
  
  // Fallback for browsers without intersection observer
  useEffect(() => {
    if (lazy && !capabilities.supportsIntersectionObserver) {
      const handleScroll = () => {
        if (!imgRef.current) return;
        
        const rect = imgRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight + 50 && rect.bottom > -50;
        
        if (isVisible) {
          loadImage();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Check initial visibility
      
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lazy, loadImage, capabilities.supportsIntersectionObserver]);
  
  return (
    <Box
      position="relative"
      overflow="hidden"
      {...boxProps}
      sx={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        ...boxProps.sx,
      }}
    >
      {/* Main Image */}
      <Box
        as="img"
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        sizes={sizes}
        srcSet={srcSet}
        loading={loading}
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        objectFit={objectFit}
        objectPosition={objectPosition}
        transition={blurUp ? 'all 0.3s ease-out' : 'opacity 0.3s ease-out'}
        opacity={isLoaded ? 1 : 0}
        filter={isLoaded ? 'none' : blurUp ? 'blur(10px)' : 'none'}
        transform={isLoaded ? 'scale(1)' : blurUp ? 'scale(1.05)' : 'scale(1)'}
        sx={{
          willChange: 'opacity, filter, transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />
      
      {/* Placeholder */}
      {placeholder && !isLoaded && !isError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg={placeholder.startsWith('#') || placeholder.startsWith('rgb') ? placeholder : 'gray.200'}
          backgroundImage={placeholder.startsWith('http') ? `url(${placeholder})` : undefined}
          backgroundSize="cover"
          backgroundPosition="center"
          filter={blurUp ? 'blur(5px)' : 'none'}
          sx={{
            willChange: 'opacity',
          }}
        />
      )}
      
      {/* Error State */}
      {isError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="gray.500"
          fontSize="sm"
          fontWeight="500"
        >
          Failed to load image
        </Box>
      )}
      
      {/* Loading Indicator */}
      {!isLoaded && !isError && !placeholder && (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            w="20px"
            h="20px"
            border="2px solid"
            borderColor="gray.300"
            borderTopColor="blue.500"
            borderRadius="50%"
            sx={{
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// Preset Components
// ============================================================================

export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'aspectRatio' | 'objectFit'>> = (props) => (
  <OptimizedImage
    aspectRatio={1}
    objectFit="cover"
    borderRadius="50%"
    {...props}
  />
);

export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    aspectRatio={16/9}
    objectFit="cover"
    blurUp
    {...props}
  />
);

export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    aspectRatio={4/3}
    objectFit="cover"
    lazy
    blurUp
    {...props}
  />
);

// ============================================================================
// Export
// ============================================================================

export default OptimizedImage;
