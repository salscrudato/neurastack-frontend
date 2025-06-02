import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  bundleSize: number;
  loadTime: number;
  interactionDelay: number;
  cacheHitRate: number;
  errorRate: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
}

interface PerformanceConfig {
  enableFPSMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  enableRenderTimeMonitoring: boolean;
  enableNetworkMonitoring: boolean;
  alertThresholds: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    interactionDelay: number;
    errorRate: number;
  };
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableFPSMonitoring: true,
  enableMemoryMonitoring: true,
  enableRenderTimeMonitoring: true,
  enableNetworkMonitoring: true,
  alertThresholds: {
    fps: 30, // Alert if FPS drops below 30
    memoryUsage: 100, // Alert if memory usage exceeds 100MB
    renderTime: 16, // Alert if render time exceeds 16ms (60fps)
    interactionDelay: 100, // Alert if interaction delay exceeds 100ms
    errorRate: 5, // Alert if error rate exceeds 5%
  },
};

export const useAdvancedPerformanceMonitor = (config: Partial<PerformanceConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const toast = useToast();
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    bundleSize: 0,
    loadTime: 0,
    interactionDelay: 0,
    cacheHitRate: 0,
    errorRate: 0,
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Refs for tracking
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderTimes = useRef<number[]>([]);
  const errorCount = useRef(0);
  const totalRequests = useRef(0);
  const cacheHits = useRef(0);
  const animationFrameId = useRef<number | undefined>(undefined);

  // FPS Monitoring
  const measureFPS = useCallback(() => {
    if (!fullConfig.enableFPSMonitoring) return;
    
    const now = performance.now();
    frameCount.current++;
    
    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      
      setMetrics(prev => ({ ...prev, fps }));
      
      if (fps < fullConfig.alertThresholds.fps) {
        const alert: PerformanceAlert = {
          type: 'warning',
          message: `Low FPS detected: ${fps}fps`,
          metric: 'fps',
          value: fps,
          threshold: fullConfig.alertThresholds.fps,
        };
        setAlerts(prev => [...prev.slice(-4), alert]);
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }
    
    animationFrameId.current = requestAnimationFrame(measureFPS);
  }, [fullConfig.enableFPSMonitoring, fullConfig.alertThresholds.fps]);

  // Memory Usage Monitoring
  const measureMemoryUsage = useCallback(() => {
    if (!fullConfig.enableMemoryMonitoring || !('memory' in performance)) return;
    
    const memory = (performance as any).memory;
    const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    
    setMetrics(prev => ({ ...prev, memoryUsage }));
    
    if (memoryUsage > fullConfig.alertThresholds.memoryUsage) {
      const alert: PerformanceAlert = {
        type: 'warning',
        message: `High memory usage: ${memoryUsage}MB`,
        metric: 'memoryUsage',
        value: memoryUsage,
        threshold: fullConfig.alertThresholds.memoryUsage,
      };
      setAlerts(prev => [...prev.slice(-4), alert]);
    }
  }, [fullConfig.enableMemoryMonitoring, fullConfig.alertThresholds.memoryUsage]);

  // Render Time Monitoring
  const measureRenderTime = useCallback((renderTime: number) => {
    if (!fullConfig.enableRenderTimeMonitoring) return;
    
    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > 100) {
      renderTimes.current.shift();
    }
    
    const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    
    setMetrics(prev => ({ ...prev, renderTime: Math.round(avgRenderTime * 100) / 100 }));
    
    if (avgRenderTime > fullConfig.alertThresholds.renderTime) {
      const alert: PerformanceAlert = {
        type: 'warning',
        message: `Slow render time: ${avgRenderTime.toFixed(2)}ms`,
        metric: 'renderTime',
        value: avgRenderTime,
        threshold: fullConfig.alertThresholds.renderTime,
      };
      setAlerts(prev => [...prev.slice(-4), alert]);
    }
  }, [fullConfig.enableRenderTimeMonitoring, fullConfig.alertThresholds.renderTime]);

  // Network Performance Monitoring
  const trackNetworkRequest = useCallback((success: boolean, fromCache: boolean = false) => {
    if (!fullConfig.enableNetworkMonitoring) return;
    
    totalRequests.current++;
    if (fromCache) cacheHits.current++;
    if (!success) errorCount.current++;
    
    const cacheHitRate = (cacheHits.current / totalRequests.current) * 100;
    const errorRate = (errorCount.current / totalRequests.current) * 100;
    
    setMetrics(prev => ({ 
      ...prev, 
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
    }));
    
    if (errorRate > fullConfig.alertThresholds.errorRate) {
      const alert: PerformanceAlert = {
        type: 'error',
        message: `High error rate: ${errorRate.toFixed(1)}%`,
        metric: 'errorRate',
        value: errorRate,
        threshold: fullConfig.alertThresholds.errorRate,
      };
      setAlerts(prev => [...prev.slice(-4), alert]);
    }
  }, [fullConfig.enableNetworkMonitoring, fullConfig.alertThresholds.errorRate]);

  // Bundle Size Analysis
  const analyzeBundleSize = useCallback(async () => {
    try {
      const response = await fetch('/stats.html');
      if (response.ok) {
        const text = await response.text();
        // Extract bundle size from stats HTML (simplified)
        const sizeMatch = text.match(/Total.*?(\d+(?:\.\d+)?)\s*MB/i);
        if (sizeMatch) {
          const bundleSize = parseFloat(sizeMatch[1]);
          setMetrics(prev => ({ ...prev, bundleSize }));
        }
      }
    } catch (error) {
      console.warn('Could not analyze bundle size:', error);
    }
  }, []);

  // Load Time Measurement
  const measureLoadTime = useCallback(() => {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    }
  }, []);

  // Start/Stop Monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    measureFPS();
    
    const memoryInterval = setInterval(measureMemoryUsage, 5000);
    const loadTimeTimeout = setTimeout(measureLoadTime, 1000);
    
    analyzeBundleSize();
    
    return () => {
      setIsMonitoring(false);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearInterval(memoryInterval);
      clearTimeout(loadTimeTimeout);
    };
  }, [measureFPS, measureMemoryUsage, measureLoadTime, analyzeBundleSize]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  // Show performance alerts as toasts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.type === 'error') {
        toast({
          title: 'Performance Alert',
          description: alert.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (alert.type === 'warning') {
        toast({
          title: 'Performance Warning',
          description: alert.message,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    });
  }, [alerts, toast]);

  // Auto-start monitoring
  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureRenderTime,
    trackNetworkRequest,
    clearAlerts: () => setAlerts([]),
  };
};

// Performance monitoring context for global access
export const PerformanceContext = React.createContext<ReturnType<typeof useAdvancedPerformanceMonitor> | null>(null);

export const usePerformanceContext = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
};
