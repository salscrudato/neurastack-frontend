/**
 * Lazy Analytics Components
 * 
 * Performance-optimized lazy loading for analytics components to achieve <1s TTI:
 * - Code splitting for analytics modals and complex visualizations
 * - Smart preloading based on user interaction patterns
 * - Efficient bundle optimization with dynamic imports
 * - Memory-conscious component lifecycle management
 */

import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import React, { lazy, Suspense } from 'react';

// Lazy load heavy analytics components
const EnhancedAnalyticsModal = lazy(() =>
  import('./EnhancedAnalyticsModal').then(module => ({
    default: module.EnhancedAnalyticsModal
  }))
);

const MetaVotingIntelligenceDashboard = lazy(() =>
  import('./MetaVotingIntelligenceDashboard').then(module => ({
    default: module.MetaVotingIntelligenceDashboard
  }))
);

const PredictiveInsightsEngine = lazy(() =>
  import('./PredictiveInsightsEngine').then(module => ({
    default: module.PredictiveInsightsEngine
  }))
);

const EnhancedEnsembleVisualization = lazy(() =>
  import('./EnhancedEnsembleVisualization').then(module => ({
    default: module.EnhancedEnsembleVisualization
  }))
);

const ResponseComparisonModal = lazy(() => 
  import('./ResponseComparisonModal').then(module => ({
    default: module.ResponseComparisonModal
  }))
);

const RealTimeEnsembleVisualization = lazy(() => 
  import('./RealTimeEnsembleVisualization').then(module => ({
    default: module.RealTimeEnsembleVisualization
  }))
);

// Optimized loading fallback component
const AnalyticsLoadingFallback = ({ 
  message = "Loading analytics...",
  minimal = false 
}: { 
  message?: string;
  minimal?: boolean;
}) => {
  if (minimal) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={2}>
        <Spinner size="sm" color="blue.500" />
      </Box>
    );
  }

  return (
    <VStack spacing={3} p={6} align="center" justify="center" minH="200px">
      <Spinner size="lg" color="blue.500" thickness="3px" />
      <Text fontSize="sm" color="gray.500" fontWeight="500">
        {message}
      </Text>
    </VStack>
  );
};

// Lazy wrapper components with optimized loading states
export const LazyEnhancedAnalyticsModal = (props: any) => (
  <Suspense fallback={<AnalyticsLoadingFallback message="Loading advanced analytics..." />}>
    <EnhancedAnalyticsModal {...props} />
  </Suspense>
);

export const LazyResponseComparisonModal = (props: any) => (
  <Suspense fallback={<AnalyticsLoadingFallback message="Loading response comparison..." />}>
    <ResponseComparisonModal {...props} />
  </Suspense>
);

export const LazyRealTimeEnsembleVisualization = (props: any) => (
  <Suspense fallback={<AnalyticsLoadingFallback message="Initializing ensemble visualization..." minimal />}>
    <RealTimeEnsembleVisualization {...props} />
  </Suspense>
);

export const LazyMetaVotingIntelligenceDashboard = (props: any) => (
  <Suspense fallback={<AnalyticsLoadingFallback message="Loading meta-voting intelligence..." />}>
    <MetaVotingIntelligenceDashboard {...props} />
  </Suspense>
);

export const LazyPredictiveInsightsEngine = (props: any) => (
  <Suspense fallback={<AnalyticsLoadingFallback message="Analyzing predictive insights..." />}>
    <PredictiveInsightsEngine {...props} />
  </Suspense>
);

export const LazyEnhancedEnsembleVisualization = (props: any) => (
  <Suspense fallback={<AnalyticsLoadingFallback message="Loading enhanced visualization..." />}>
    <EnhancedEnsembleVisualization {...props} />
  </Suspense>
);

// Preloader utility for smart preloading
export class AnalyticsPreloader {
  private static preloadedComponents = new Set<string>();
  
  static preloadEnhancedAnalytics() {
    if (!this.preloadedComponents.has('enhanced-analytics')) {
      import('./EnhancedAnalyticsModal');
      this.preloadedComponents.add('enhanced-analytics');
    }
  }
  
  static preloadResponseComparison() {
    if (!this.preloadedComponents.has('response-comparison')) {
      import('./ResponseComparisonModal');
      this.preloadedComponents.add('response-comparison');
    }
  }
  
  static preloadEnsembleVisualization() {
    if (!this.preloadedComponents.has('ensemble-visualization')) {
      import('./RealTimeEnsembleVisualization');
      this.preloadedComponents.add('ensemble-visualization');
    }
  }
  
  // Smart preloading based on user interaction patterns
  static preloadOnUserInteraction() {
    // Preload analytics when user hovers over analytics buttons
    const preloadOnHover = (selector: string, preloadFn: () => void) => {
      document.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(selector)) {
          preloadFn();
        }
      }, { once: true, passive: true });
    };
    
    preloadOnHover('[data-analytics-button]', this.preloadEnhancedAnalytics);
    preloadOnHover('[data-comparison-button]', this.preloadResponseComparison);
  }
  
  // Preload all analytics components after initial page load
  static preloadAllAfterIdle() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadEnhancedAnalytics();
        this.preloadResponseComparison();
        this.preloadEnsembleVisualization();
        this.preloadMetaVotingDashboard();
        this.preloadPredictiveInsights();
        this.preloadEnhancedVisualization();
      }, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadEnhancedAnalytics();
        this.preloadResponseComparison();
        this.preloadEnsembleVisualization();
        this.preloadMetaVotingDashboard();
        this.preloadPredictiveInsights();
        this.preloadEnhancedVisualization();
      }, 3000);
    }
  }

  // Preload new advanced components
  static preloadMetaVotingDashboard() {
    import('./MetaVotingIntelligenceDashboard').catch(() => {});
  }

  static preloadPredictiveInsights() {
    import('./PredictiveInsightsEngine').catch(() => {});
  }

  static preloadEnhancedVisualization() {
    import('./EnhancedEnsembleVisualization').catch(() => {});
  }
}

// Performance monitoring hook for analytics components
export const useAnalyticsPerformance = () => {
  const measureComponentLoad = (componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (import.meta.env.DEV) {
        console.log(`📊 Analytics Component Load Time: ${componentName} - ${loadTime.toFixed(2)}ms`);
      }
      
      // Report to performance monitoring service in production
      if (import.meta.env.PROD && 'gtag' in window) {
        (window as any).gtag('event', 'timing_complete', {
          name: `analytics_${componentName}_load`,
          value: Math.round(loadTime)
        });
      }
    };
  };
  
  return { measureComponentLoad };
};

// Memory-conscious component wrapper
export const withMemoryOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const { measureComponentLoad } = useAnalyticsPerformance();
    
    React.useEffect(() => {
      const endMeasurement = measureComponentLoad(componentName);
      return endMeasurement;
    }, []);
    
    return <Component {...props} />;
  });
};

// Bundle size optimization utilities
export const OptimizedAnalyticsBundle = {
  // Check if analytics features should be loaded based on user tier/preferences
  shouldLoadAdvancedAnalytics: () => {
    // In a real app, this would check user tier, preferences, etc.
    return true;
  },
  
  // Progressive enhancement - load basic features first, advanced later
  loadProgressively: () => {
    // Load basic components immediately
    import('./EnhancedConfidenceIndicator');
    
    // Load advanced components after a delay
    setTimeout(() => {
      if (OptimizedAnalyticsBundle.shouldLoadAdvancedAnalytics()) {
        AnalyticsPreloader.preloadAllAfterIdle();
      }
    }, 1000);
  }
};

// Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Set up smart preloading
  AnalyticsPreloader.preloadOnUserInteraction();
  
  // Progressive loading
  OptimizedAnalyticsBundle.loadProgressively();
  
  // Performance monitoring
  if (import.meta.env.DEV) {
    console.log('🚀 Analytics performance optimizations initialized');
  }
}
