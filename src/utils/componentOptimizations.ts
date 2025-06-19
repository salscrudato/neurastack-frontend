/**
 * React Component Optimization Utilities
 * 
 * Provides comprehensive React component optimization tools with human-readable
 * naming conventions, type safety, and performance best practices.
 */

import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import type { IComponentProps } from '../types/common';

// ============================================================================
// Component Memoization Utilities
// ============================================================================

/**
 * Create a memoized component with custom comparison function
 * Uses human-readable naming for better code comprehension
 */
export function createMemoizedComponent<TComponentProps extends IComponentProps>(
  ComponentToMemoize: React.ComponentType<TComponentProps>,
  customComparisonFunction?: (
    previousProps: TComponentProps,
    nextProps: TComponentProps
  ) => boolean
): React.MemoExoticComponent<React.ComponentType<TComponentProps>> {
  return memo(ComponentToMemoize, customComparisonFunction);
}

/**
 * Shallow comparison function for component props
 * Optimized for performance with descriptive variable names
 */
export function performShallowPropsComparison<TProps extends Record<string, unknown>>(
  previousComponentProps: TProps,
  nextComponentProps: TProps
): boolean {
  const previousPropsKeys = Object.keys(previousComponentProps);
  const nextPropsKeys = Object.keys(nextComponentProps);

  // Quick check: different number of props
  if (previousPropsKeys.length !== nextPropsKeys.length) {
    return false;
  }

  // Deep check: compare each prop value
  for (const propKey of previousPropsKeys) {
    if (previousComponentProps[propKey] !== nextComponentProps[propKey]) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// Hook Optimization Utilities
// ============================================================================

/**
 * Create an optimized callback with dependency tracking
 * Provides enhanced debugging and performance monitoring
 */
export function createOptimizedCallback<TCallbackArgs extends unknown[], TCallbackReturn>(
  callbackFunction: (...args: TCallbackArgs) => TCallbackReturn,
  dependencyArray: React.DependencyList,
  debugLabel?: string
): (...args: TCallbackArgs) => TCallbackReturn {
  // Development-only dependency change tracking
  const previousDependencies = useRef<React.DependencyList>();
  
  if (import.meta.env.DEV && debugLabel) {
    useEffect(() => {
      if (previousDependencies.current) {
        const changedDependencies = dependencyArray.filter(
          (dependency, index) => dependency !== previousDependencies.current?.[index]
        );
        
        if (changedDependencies.length > 0) {
          console.log(`🔄 Callback "${debugLabel}" dependencies changed:`, changedDependencies);
        }
      }
      previousDependencies.current = dependencyArray;
    });
  }

  return useCallback(callbackFunction, dependencyArray);
}

/**
 * Create an optimized memoized value with performance tracking
 * Includes development-only performance monitoring
 */
export function createOptimizedMemoizedValue<TMemoizedValue>(
  valueFactory: () => TMemoizedValue,
  dependencyArray: React.DependencyList,
  debugLabel?: string
): TMemoizedValue {
  // Development-only performance tracking
  const computationStartTime = useRef<number>();
  
  if (import.meta.env.DEV && debugLabel) {
    computationStartTime.current = performance.now();
  }

  const memoizedValue = useMemo(() => {
    const computedValue = valueFactory();
    
    if (import.meta.env.DEV && debugLabel && computationStartTime.current) {
      const computationDuration = performance.now() - computationStartTime.current;
      if (computationDuration > 5) { // Log if computation takes more than 5ms
        console.log(`⏱️ Memoized value "${debugLabel}" computed in ${computationDuration.toFixed(2)}ms`);
      }
    }
    
    return computedValue;
  }, dependencyArray);

  return memoizedValue;
}

// ============================================================================
// Render Optimization Utilities
// ============================================================================

/**
 * Create a render-optimized component wrapper
 * Prevents unnecessary re-renders with comprehensive optimization
 */
export function createRenderOptimizedWrapper<TWrappedComponentProps extends IComponentProps>(
  WrappedComponent: React.ComponentType<TWrappedComponentProps>,
  optimizationOptions: {
    shouldMemoize?: boolean;
    shouldTrackRenders?: boolean;
    debugLabel?: string;
    customComparison?: (prev: TWrappedComponentProps, next: TWrappedComponentProps) => boolean;
  } = {}
): React.ComponentType<TWrappedComponentProps> {
  const {
    shouldMemoize = true,
    shouldTrackRenders = import.meta.env.DEV,
    debugLabel = WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent',
    customComparison
  } = optimizationOptions;

  const OptimizedComponent: React.FC<TWrappedComponentProps> = (props) => {
    // Development-only render tracking
    const renderCount = useRef(0);
    
    if (shouldTrackRenders) {
      renderCount.current += 1;
      
      useEffect(() => {
        console.log(`🎨 Component "${debugLabel}" rendered ${renderCount.current} times`);
      });
    }

    return <WrappedComponent {...props} />;
  };

  OptimizedComponent.displayName = `OptimizedWrapper(${debugLabel})`;

  // Apply memoization if requested
  if (shouldMemoize) {
    return memo(OptimizedComponent, customComparison);
  }

  return OptimizedComponent;
}

// ============================================================================
// Performance Monitoring Hooks
// ============================================================================

/**
 * Hook to monitor component render performance
 * Provides detailed performance metrics in development
 */
export function useComponentPerformanceMonitoring(
  componentName: string,
  shouldMonitor: boolean = import.meta.env.DEV
) {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);
  const totalRenderTime = useRef(0);

  if (shouldMonitor) {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    useEffect(() => {
      if (renderStartTime.current) {
        const renderDuration = performance.now() - renderStartTime.current;
        totalRenderTime.current += renderDuration;
        
        const averageRenderTime = totalRenderTime.current / renderCount.current;
        
        // Log performance warnings for slow renders
        if (renderDuration > 16) { // 16ms = 60fps threshold
          console.warn(
            `⚠️ Slow render detected in "${componentName}": ${renderDuration.toFixed(2)}ms ` +
            `(Average: ${averageRenderTime.toFixed(2)}ms, Count: ${renderCount.current})`
          );
        }
      }
    });
  }

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0
  };
}

/**
 * Hook to detect unnecessary re-renders
 * Helps identify performance bottlenecks in development
 */
export function useRenderCauseDetection<TProps extends Record<string, unknown>>(
  componentProps: TProps,
  componentName: string,
  shouldDetect: boolean = import.meta.env.DEV
) {
  const previousProps = useRef<TProps>();

  if (shouldDetect) {
    useEffect(() => {
      if (previousProps.current) {
        const changedProps = Object.keys(componentProps).filter(
          propKey => componentProps[propKey] !== previousProps.current?.[propKey]
        );

        if (changedProps.length > 0) {
          console.log(`🔍 "${componentName}" re-rendered due to props:`, changedProps);
        }
      }
      
      previousProps.current = componentProps;
    });
  }
}

// ============================================================================
// Export Optimization Utilities
// ============================================================================

export const ComponentOptimizations = {
  createMemoizedComponent,
  performShallowPropsComparison,
  createOptimizedCallback,
  createOptimizedMemoizedValue,
  createRenderOptimizedWrapper,
  useComponentPerformanceMonitoring,
  useRenderCauseDetection,
};

export default ComponentOptimizations;
