/**
 * Lazy Markdown Component
 * 
 * Lazy loads react-markdown and remark-gfm to reduce initial bundle size.
 * Only loads when markdown content is actually needed.
 */

import { Box, Skeleton, Text } from '@chakra-ui/react';
import { lazy, memo, Suspense } from 'react';

// Lazy load markdown components
const ReactMarkdown = lazy(() => import('react-markdown'));

interface LazyMarkdownProps {
  children: string;
  className?: string;
  components?: Record<string, any>;
}

/**
 * Markdown loading skeleton
 */
const MarkdownSkeleton = memo(function MarkdownSkeleton() {
  return (
    <Box>
      <Skeleton height="20px" mb={2} />
      <Skeleton height="16px" mb={2} width="80%" />
      <Skeleton height="16px" mb={4} width="60%" />
      <Skeleton height="20px" mb={2} />
      <Skeleton height="16px" width="90%" />
    </Box>
  );
});

/**
 * Fallback component for markdown loading errors
 */
const MarkdownFallback = memo(function MarkdownFallback({ children }: { children: string }) {
  return (
    <Box
      p={4}
      bg="gray.50"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <Text fontSize="sm" color="gray.600" mb={2}>
        Markdown rendering unavailable
      </Text>
      <Text whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm">
        {children}
      </Text>
    </Box>
  );
});

/**
 * Lazy-loaded markdown component with optimized loading
 */
export const LazyMarkdown = memo(function LazyMarkdown({
  children,
  className,
  components
}: LazyMarkdownProps) {
  // Don't render anything if no content
  if (!children || children.trim().length === 0) {
    return null;
  }

  return (
    <Suspense fallback={<MarkdownSkeleton />}>
      <LazyMarkdownRenderer 
        content={children}
        className={className}
        components={components}
      />
    </Suspense>
  );
});

/**
 * Internal markdown renderer component
 */
const LazyMarkdownRenderer = memo(function LazyMarkdownRenderer({
  content,
  className,
  components
}: {
  content: string;
  className?: string;
  components?: Record<string, any>;
}) {
  try {
    return (
      <Suspense fallback={<MarkdownSkeleton />}>
        <Box className={className}>
          <ReactMarkdown components={components}>
            {content}
          </ReactMarkdown>
        </Box>
      </Suspense>
    );
  } catch (error) {
    console.warn('Markdown rendering failed:', error);
    return <MarkdownFallback>{content}</MarkdownFallback>;
  }
});

export default LazyMarkdown;
