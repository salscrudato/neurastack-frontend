import { Box, Text, Spinner } from '@chakra-ui/react';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

/**
 * Mobile-first Pull-to-Refresh Component
 * 
 * Features:
 * - Smooth pull-to-refresh gesture
 * - Haptic feedback on mobile
 * - Visual feedback with loading states
 * - Customizable threshold and styling
 */
export const PullToRefresh = memo(({
  onRefresh,
  children,
  threshold = 80,
  disabled = false
}: PullToRefreshProps) => {
  const { isMobile, triggerHaptic } = useMobileOptimization();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const touchStartRef = useRef<{ y: number; time: number } | null>(null);
  const lastScrollTop = useRef(0);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only allow pull-to-refresh when at the top
    if (container.scrollTop > 10) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      y: touch.clientY,
      time: Date.now()
    };
    lastScrollTop.current = container.scrollTop;
  }, [isMobile, disabled, isRefreshing]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMobile || disabled || isRefreshing || !touchStartRef.current) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Only handle downward pulls when at the top
    if (deltaY > 0 && container.scrollTop === 0) {
      e.preventDefault();
      
      const distance = Math.min(deltaY * 0.5, threshold * 1.5);
      setPullDistance(distance);
      
      const shouldRefresh = distance >= threshold;
      if (shouldRefresh !== canRefresh) {
        setCanRefresh(shouldRefresh);
        if (shouldRefresh) {
          triggerHaptic('medium');
        }
      }
    }
  }, [isMobile, disabled, isRefreshing, threshold, canRefresh, triggerHaptic]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!isMobile || disabled || !touchStartRef.current) return;
    
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('success');
      
      try {
        await onRefresh();
      } catch (error) {
        triggerHaptic('error');
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Reset state
    setPullDistance(0);
    setCanRefresh(false);
    touchStartRef.current = null;
  }, [isMobile, disabled, canRefresh, isRefreshing, onRefresh, triggerHaptic]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isMobile]);

  // Calculate refresh indicator opacity and scale
  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorScale = Math.min(0.5 + (pullDistance / threshold) * 0.5, 1);

  return (
    <Box
      ref={containerRef}
      position="relative"
      height="100%"
      overflow="auto"
      sx={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
    >
      {/* Pull-to-refresh indicator */}
      {isMobile && (pullDistance > 0 || isRefreshing) && (
        <Box
          position="absolute"
          top={0}
          left="50%"
          transform={`translateX(-50%) translateY(${Math.min(pullDistance - 40, 20)}px) scale(${indicatorScale})`}
          zIndex={1000}
          opacity={isRefreshing ? 1 : indicatorOpacity}
          transition={isRefreshing ? 'none' : 'opacity 0.2s ease, transform 0.2s ease'}
        >
          <Box
            bg="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(12px)"
            borderRadius="full"
            p={3}
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
            border="1px solid rgba(79, 156, 249, 0.2)"
          >
            {isRefreshing ? (
              <Spinner size="sm" color="#4F9CF9" thickness="3px" />
            ) : (
              <Box
                w="24px"
                h="24px"
                borderRadius="full"
                bg={canRefresh ? "#4F9CF9" : "rgba(79, 156, 249, 0.3)"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="background-color 0.2s ease"
              >
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg="white"
                  transform={canRefresh ? 'scale(1)' : 'scale(0.6)'}
                  transition="transform 0.2s ease"
                />
              </Box>
            )}
          </Box>
          
          {/* Status text */}
          <Text
            fontSize="xs"
            color="#64748B"
            textAlign="center"
            mt={2}
            fontWeight="500"
          >
            {isRefreshing ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
          </Text>
        </Box>
      )}

      {/* Content with pull offset */}
      <Box
        transform={isMobile && pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.3, 30)}px)` : undefined}
        transition={pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'}
      >
        {children}
      </Box>
    </Box>
  );
});

PullToRefresh.displayName = 'PullToRefresh';
