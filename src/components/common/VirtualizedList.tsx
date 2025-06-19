import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { FixedSizeList as List, VariableSizeList, ListChildComponentProps } from 'react-window';
import { Box, Spinner, Text, VStack, useColorModeValue } from '@chakra-ui/react';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number | ((index: number) => number);
  height: number;
  width?: string | number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  overscan?: number;
  className?: string;
}

interface ItemData<T> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
}

// Memoized item component to prevent unnecessary re-renders
const MemoizedItem = React.memo(<T,>({ 
  index, 
  style, 
  data 
}: ListChildComponentProps<ItemData<T>>) => {
  const { items, renderItem } = data;
  const item = items[index];
  
  if (!item) {
    return (
      <div style={style}>
        <Box p={4} textAlign="center">
          <Spinner size="sm" />
        </Box>
      </div>
    );
  }

  return (
    <div style={style}>
      {renderItem(item, index, style)}
    </div>
  );
});

MemoizedItem.displayName = 'MemoizedItem';

export function VirtualizedList<T>({
  items,
  itemHeight = 80,
  height,
  width = '100%',
  renderItem,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  loadingComponent,
  emptyComponent,
  overscan = 5,
  className
}: VirtualizedListProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listRef = useRef<List | VariableSizeList>(null);
  const bgColor = useColorModeValue('white', 'gray.800');

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    items,
    renderItem
  }), [items, renderItem]);

  // Handle infinite scrolling
  const handleItemsRendered = useCallback(({ visibleStopIndex }: { visibleStopIndex: number }) => {
    if (
      hasNextPage &&
      !isLoading &&
      !isLoadingMore &&
      onLoadMore &&
      visibleStopIndex >= items.length - 5 // Load more when 5 items from the end
    ) {
      setIsLoadingMore(true);
      onLoadMore();
    }
  }, [hasNextPage, isLoading, isLoadingMore, onLoadMore, items.length]);

  // Reset loading state when items change
  useEffect(() => {
    setIsLoadingMore(false);
  }, [items.length]);

  // Scroll to top method
  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToItem(0);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    listRef.current?.scrollToItem(index);
  }, []);

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <Box 
        height={height} 
        width={width} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg={bgColor}
        borderRadius="md"
        className={className}
      >
        {emptyComponent || (
          <VStack spacing={3}>
            <Text color="gray.500" fontSize="lg">
              No items to display
            </Text>
          </VStack>
        )}
      </Box>
    );
  }

  // Determine if we should use fixed or variable size list
  const isFixedSize = typeof itemHeight === 'number';

  const commonProps = {
    ref: listRef,
    height,
    width,
    itemCount: items.length + (hasNextPage ? 1 : 0), // Add one for loading indicator
    itemData,
    onItemsRendered: handleItemsRendered,
    overscanCount: overscan,
    className
  };

  return (
    <Box position="relative" height={height} width={width}>
      {isFixedSize ? (
        <List
          {...commonProps}
          itemSize={itemHeight as number}
        >
          {MemoizedItem}
        </List>
      ) : (
        <VariableSizeList
          {...commonProps}
          itemSize={itemHeight as (index: number) => number}
        >
          {MemoizedItem}
        </VariableSizeList>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255, 255, 255, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          {loadingComponent || <Spinner size="lg" />}
        </Box>
      )}

      {/* Load more indicator */}
      {isLoadingMore && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={4}
          textAlign="center"
          bg={bgColor}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          <Spinner size="sm" mr={2} />
          <Text as="span" fontSize="sm" color="gray.600">
            Loading more...
          </Text>
        </Box>
      )}
    </Box>
  );
}

// Hook for managing virtualized list state
export function useVirtualizedList<T>(
  initialItems: T[] = [],
  pageSize: number = 20
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = useCallback(async (
    loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>
  ) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await loadFunction(page, pageSize);
      setItems(prev => [...prev, ...result.items]);
      setHasNextPage(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, isLoading]);

  const reset = useCallback((newItems: T[] = []) => {
    setItems(newItems);
    setPage(0);
    setHasNextPage(true);
    setIsLoading(false);
  }, []);

  const addItems = useCallback((newItems: T[]) => {
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const updateItem = useCallback((index: number, updatedItem: T) => {
    setItems(prev => prev.map((item, i) => i === index ? updatedItem : item));
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    items,
    isLoading,
    hasNextPage,
    loadMore,
    reset,
    addItems,
    updateItem,
    removeItem
  };
}

// Performance monitoring hook for virtualized lists
export function useVirtualizedListPerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    scrollPerformance: 0,
    memoryUsage: 0
  });

  const measureRenderTime = useCallback((callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    setMetrics(prev => ({ ...prev, renderTime: end - start }));
  }, []);

  const measureScrollPerformance = useCallback(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        setMetrics(prev => ({ ...prev, scrollPerformance: fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, []);

  return {
    metrics,
    measureRenderTime,
    measureScrollPerformance,
    measureMemoryUsage
  };
}

export default VirtualizedList;
