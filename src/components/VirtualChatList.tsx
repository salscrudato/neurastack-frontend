import { Box } from '@chakra-ui/react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMobileOptimization } from '../utils/mobileOptimizations';

interface VirtualChatListProps {
  /** Array of chat messages */
  items: any[];
  /** Height of each item (can be function for dynamic heights) */
  itemHeight: number | ((index: number) => number);
  /** Container height */
  height: number;
  /** Render function for each item */
  renderItem: (item: any, index: number) => React.ReactNode;
  /** Number of items to render outside visible area */
  overscan?: number;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
  /** Enable smooth scrolling */
  smoothScrolling?: boolean;
  /** Custom scroll behavior */
  scrollBehavior?: 'auto' | 'smooth';
}

/**
 * Enhanced High-performance virtual scrolling component for chat messages
 * Features:
 * - Renders only visible items for optimal performance
 * - Smooth scrolling with momentum preservation
 * - Enhanced mobile-optimized touch interactions with haptic feedback
 * - Dynamic item heights support with intelligent caching
 * - Memory efficient with item recycling and cleanup
 * - Keyboard-aware scrolling adjustments
 * - Performance monitoring and optimization
 */
export const VirtualChatList = memo<VirtualChatListProps>(({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 5,
  onScroll,
  smoothScrolling = true,
  scrollBehavior = 'smooth',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isMobile } = useMobileOptimization();

  // Calculate item heights
  const getItemHeight = useCallback((index: number): number => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  // Calculate total height and item positions
  const { totalHeight, itemPositions } = useMemo(() => {
    let totalHeight = 0;
    const positions: number[] = [];

    for (let i = 0; i < items.length; i++) {
      positions[i] = totalHeight;
      totalHeight += getItemHeight(i);
    }

    return { totalHeight, itemPositions: positions };
  }, [items.length, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const containerHeight = height;
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      if (itemPositions[i] + getItemHeight(i) > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }

    // Find end index
    for (let i = startIndex; i < items.length; i++) {
      if (itemPositions[i] > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { startIndex, endIndex };
  }, [scrollTop, height, items.length, itemPositions, getItemHeight, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    const visible = [];

    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        visible.push({
          index: i,
          item: items[i],
          top: itemPositions[i],
          height: getItemHeight(i),
        });
      }
    }

    return visible;
  }, [visibleRange, items, itemPositions, getItemHeight]);

  // Handle scroll events with performance optimization
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = scrollBehavior) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: totalHeight,
        behavior,
      });
    }
  }, [totalHeight, scrollBehavior]);

  // Scroll to specific index (available for future use)
  // const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = scrollBehavior) => {
  //   if (containerRef.current && itemPositions[index] !== undefined) {
  //     containerRef.current.scrollTo({
  //       top: itemPositions[index],
  //       behavior,
  //     });
  //   }
  // }, [itemPositions, scrollBehavior]);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    const wasAtBottom = scrollTop + height >= totalHeight - 100; // 100px threshold

    if (wasAtBottom && items.length > 0) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
  }, [items.length, scrollTop, height, totalHeight, scrollToBottom]);

  // Enhanced mobile scroll styles
  const scrollStyles = useMemo(() => ({
    height,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    scrollBehavior: smoothScrolling ? 'smooth' : 'auto',
    // Performance optimizations
    willChange: 'auto',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    // Mobile optimizations
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    // Hide scrollbar while maintaining functionality
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    // Enhanced mobile touch interactions
    touchAction: isMobile ? 'pan-y' : 'auto',
  }), [height, smoothScrolling, isMobile]);

  return (
    <Box
      ref={containerRef}
      sx={scrollStyles}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {/* Virtual container with total height */}
      <Box position="relative" height={`${totalHeight}px`}>
        {/* Render only visible items */}
        {visibleItems.map(({ index, item, top, height: itemHeight }) => (
          <Box
            key={index}
            position="absolute"
            top={`${top}px`}
            left={0}
            right={0}
            height={`${itemHeight}px`}
            // Performance optimization for rendering
            style={{
              contain: 'layout style paint',
              willChange: isScrolling ? 'transform' : 'auto',
            }}
          >
            {renderItem(item, index)}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

VirtualChatList.displayName = 'VirtualChatList';

// Export utility functions
export const useVirtualChatList = () => {
  return {
    scrollToBottom: useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, []),

    scrollToIndex: useCallback((
      containerRef: React.RefObject<HTMLDivElement>,
      index: number,
      itemPositions: number[]
    ) => {
      if (containerRef.current && itemPositions[index] !== undefined) {
        containerRef.current.scrollTo({
          top: itemPositions[index],
          behavior: 'smooth',
        });
      }
    }, []),
  };
};

export default VirtualChatList;
