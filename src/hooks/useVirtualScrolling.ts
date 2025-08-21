/**
 * Virtual Scrolling Hook
 *
 * Optimizes performance for large conversation histories by only rendering
 * visible messages and a buffer around the viewport.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside viewport
  enabled?: boolean;
}

interface VirtualScrollingResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    offsetTop: number;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  scrollToBottom: () => void;
  containerProps: {
    ref: React.RefObject<HTMLDivElement | null>;
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
  contentProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualScrolling<T>(
  items: T[],
  options: VirtualScrollingOptions
): VirtualScrollingResult<T> {
  const { itemHeight, containerHeight, overscan = 5, enabled = true } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!enabled || items.length === 0) {
      return {
        start: 0,
        end: items.length,
        startIndex: 0,
        endIndex: items.length - 1,
      };
    }

    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = start + visibleCount;

    const startIndex = Math.max(0, start - overscan);
    const endIndex = Math.min(items.length - 1, end + overscan);

    return {
      start: startIndex,
      end: endIndex + 1,
      startIndex,
      endIndex,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length, enabled]);

  // Create virtual items
  const virtualItems = useMemo(() => {
    if (!enabled) {
      return items.map((item, index) => ({
        index,
        item,
        offsetTop: index * itemHeight,
      }));
    }

    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (i < items.length) {
        result.push({
          index: i,
          item: items[i],
          offsetTop: i * itemHeight,
        });
      }
    }
    return result;
  }, [items, visibleRange, itemHeight, enabled]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Scroll handlers
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (containerRef.current) {
        const targetScrollTop = index * itemHeight;
        containerRef.current.scrollTop = targetScrollTop;
        setScrollTop(targetScrollTop);
      }
    },
    [itemHeight]
  );

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      const targetScrollTop = totalHeight - containerHeight;
      containerRef.current.scrollTop = Math.max(0, targetScrollTop);
      setScrollTop(Math.max(0, targetScrollTop));
    }
  }, [totalHeight, containerHeight]);

  // Auto-scroll to bottom when new items are added (chat behavior)
  const prevItemsLength = useRef(items.length);
  useEffect(() => {
    if (items.length > prevItemsLength.current) {
      // Check if user was near bottom before new message
      const wasNearBottom = containerRef.current
        ? containerRef.current.scrollTop + containerHeight + 100 >= totalHeight
        : true;

      if (wasNearBottom) {
        // Small delay to ensure DOM is updated
        setTimeout(() => scrollToBottom(), 50);
      }
    }
    prevItemsLength.current = items.length;
  }, [items.length, scrollToBottom, containerHeight, totalHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    scrollToBottom,
    containerProps: {
      ref: containerRef,
      style: {
        height: containerHeight,
        overflow: "auto",
        position: "relative",
      },
      onScroll: handleScroll,
    },
    contentProps: {
      style: {
        height: enabled ? totalHeight : "auto",
        position: "relative",
      },
    },
  };
}

/**
 * Performance monitoring hook for virtual scrolling
 */
export function useVirtualScrollingPerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    visibleItems: 0,
    totalItems: 0,
    memoryUsage: 0,
  });

  const measureRender = useCallback(
    (startTime: number, visibleCount: number, totalCount: number) => {
      const renderTime = performance.now() - startTime;

      // Estimate memory usage (rough calculation)
      const memoryUsage = visibleCount * 1024; // Assume 1KB per visible item

      setMetrics({
        renderTime,
        visibleItems: visibleCount,
        totalItems: totalCount,
        memoryUsage,
      });
    },
    []
  );

  return {
    metrics,
    measureRender,
  };
}

/**
 * Adaptive virtual scrolling that adjusts based on performance
 */
export function useAdaptiveVirtualScrolling<T>(
  items: T[],
  baseOptions: VirtualScrollingOptions
) {
  const [adaptiveOptions, setAdaptiveOptions] = useState(baseOptions);
  const { metrics, measureRender } = useVirtualScrollingPerformance();

  // Adjust overscan based on performance
  useEffect(() => {
    if (metrics.renderTime > 16) {
      // If render takes longer than 16ms (60fps)
      setAdaptiveOptions((prev) => ({
        ...prev,
        overscan: Math.max(1, prev.overscan! - 1),
      }));
    } else if (metrics.renderTime < 8 && adaptiveOptions.overscan! < 10) {
      setAdaptiveOptions((prev) => ({
        ...prev,
        overscan: prev.overscan! + 1,
      }));
    }
  }, [metrics.renderTime, adaptiveOptions.overscan]);

  const virtualScrolling = useVirtualScrolling(items, adaptiveOptions);

  // Measure render performance
  useEffect(() => {
    const startTime = performance.now();
    requestAnimationFrame(() => {
      measureRender(
        startTime,
        virtualScrolling.virtualItems.length,
        items.length
      );
    });
  }, [virtualScrolling.virtualItems.length, items.length, measureRender]);

  return {
    ...virtualScrolling,
    performanceMetrics: metrics,
    adaptiveOptions,
  };
}

/**
 * Hook for smooth scrolling animations
 */
export function useSmoothScrolling(containerRef: React.RefObject<HTMLElement>) {
  const scrollToPosition = useCallback(
    (targetPosition: number, duration: number = 300) => {
      if (!containerRef.current) return;

      const startPosition = containerRef.current.scrollTop;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        if (containerRef.current) {
          containerRef.current.scrollTop = startPosition + distance * easeOut;
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    },
    [containerRef]
  );

  const scrollToTop = useCallback(
    (duration?: number) => {
      scrollToPosition(0, duration);
    },
    [scrollToPosition]
  );

  const scrollToBottom = useCallback(
    (duration?: number) => {
      if (containerRef.current) {
        const maxScroll =
          containerRef.current.scrollHeight - containerRef.current.clientHeight;
        scrollToPosition(maxScroll, duration);
      }
    },
    [scrollToPosition, containerRef]
  );

  return {
    scrollToPosition,
    scrollToTop,
    scrollToBottom,
  };
}
