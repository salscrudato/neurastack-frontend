/**
 * Enhanced Mobile Optimizer
 * 
 * Advanced mobile experience optimization with intelligent adaptation,
 * gesture support, haptic feedback, and performance-aware scaling.
 * Targets best-in-class mobile UX with <1s Time to Interactive.
 */

import { useEffect, useMemo, useState } from 'react';
import { debounce, throttle } from '../utils/performanceOptimizer';

interface DeviceCapabilities {
    isMobile: boolean;
    isLowEndDevice: boolean;
    hasTouch: boolean;
    devicePixelRatio: number;
    screenSize: 'small' | 'medium' | 'large';
    connectionType: string;
    memoryInfo: any;
    batteryLevel?: number;
    isCharging?: boolean;
    reducedMotion: boolean;
    darkMode: boolean;
}

interface MobileOptimizations {
    animationDuration: number;
    imageQuality: number;
    enableHaptics: boolean;
    enableGestures: boolean;
    maxConcurrentRequests: number;
    cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
    renderStrategy: 'immediate' | 'lazy' | 'progressive';
}

export function useEnhancedMobileOptimizer() {
    const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
    const [optimizations, setOptimizations] = useState<MobileOptimizations | null>(null);
    const [performanceScore, setPerformanceScore] = useState(100);

    // Detect device capabilities
    const detectCapabilities = useMemo(() => debounce(async () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEndDevice = !!(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
        const hasTouch = 'ontouchstart' in window;
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Screen size detection
        const screenWidth = window.innerWidth;
        const screenSize = screenWidth < 480 ? 'small' : screenWidth < 768 ? 'medium' : 'large';
        
        // Connection type
        const connection = (navigator as any).connection;
        const connectionType = connection?.effectiveType || 'unknown';
        
        // Memory info
        const memoryInfo = (performance as any).memory || null;
        
        // Battery API (if available)
        let batteryLevel: number | undefined;
        let isCharging: boolean | undefined;
        try {
            const battery = await (navigator as any).getBattery?.();
            if (battery) {
                batteryLevel = battery.level;
                isCharging = battery.charging;
            }
        } catch (e) {
            // Battery API not supported
        }
        
        // Accessibility preferences
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const detectedCapabilities: DeviceCapabilities = {
            isMobile,
            isLowEndDevice,
            hasTouch,
            devicePixelRatio,
            screenSize,
            connectionType,
            memoryInfo,
            batteryLevel,
            isCharging,
            reducedMotion,
            darkMode
        };

        setCapabilities(detectedCapabilities);
        return detectedCapabilities;
    }, 100), []);

    // Calculate optimizations based on capabilities
    const calculateOptimizations = useMemo(() => (caps: DeviceCapabilities): MobileOptimizations => {
        let animationDuration = 250; // Default
        let imageQuality = 0.85; // Default
        let enableHaptics = caps.hasTouch && caps.isMobile;
        let enableGestures = caps.hasTouch;
        let maxConcurrentRequests = 6; // Default
        let cacheStrategy: MobileOptimizations['cacheStrategy'] = 'moderate';
        let renderStrategy: MobileOptimizations['renderStrategy'] = 'immediate';

        // Adjust for low-end devices
        if (caps.isLowEndDevice) {
            animationDuration = 150;
            imageQuality = 0.7;
            maxConcurrentRequests = 3;
            cacheStrategy = 'aggressive';
            renderStrategy = 'lazy';
        }

        // Adjust for slow connections
        if (caps.connectionType === 'slow-2g' || caps.connectionType === '2g') {
            imageQuality = 0.6;
            maxConcurrentRequests = 2;
            cacheStrategy = 'aggressive';
            renderStrategy = 'progressive';
        }

        // Adjust for battery level
        if (caps.batteryLevel && caps.batteryLevel < 0.2 && !caps.isCharging) {
            animationDuration = 100;
            enableHaptics = false;
            maxConcurrentRequests = 2;
            renderStrategy = 'lazy';
        }

        // Respect reduced motion preference
        if (caps.reducedMotion) {
            animationDuration = 0;
        }

        // Adjust for small screens
        if (caps.screenSize === 'small') {
            imageQuality = Math.min(imageQuality, 0.75);
        }

        return {
            animationDuration,
            imageQuality,
            enableHaptics,
            enableGestures,
            maxConcurrentRequests,
            cacheStrategy,
            renderStrategy
        };
    }, []);

    // Apply optimizations to the DOM
    const applyOptimizations = useMemo(() => throttle((opts: MobileOptimizations) => {
        const root = document.documentElement;
        
        // Set CSS custom properties
        root.style.setProperty('--animation-duration', `${opts.animationDuration}ms`);
        root.style.setProperty('--image-quality', opts.imageQuality.toString());
        
        // Apply performance hints
        if (opts.renderStrategy === 'lazy') {
            root.classList.add('lazy-rendering');
        } else {
            root.classList.remove('lazy-rendering');
        }
        
        // Configure intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                rootMargin: opts.renderStrategy === 'progressive' ? '50px' : '20px',
                threshold: opts.renderStrategy === 'lazy' ? 0.1 : 0.25
            };
            
            // Store options for components to use
            (window as any).__mobileOptimizations = {
                ...opts,
                observerOptions
            };
        }
    }, 100), []);

    // Haptic feedback utility
    const triggerHaptic = useMemo(() => (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (!optimizations?.enableHaptics) return;
        
        try {
            if ('vibrate' in navigator) {
                const patterns = {
                    light: [10],
                    medium: [20],
                    heavy: [30]
                };
                navigator.vibrate(patterns[type]);
            }
        } catch (e) {
            // Haptic feedback not supported
        }
    }, [optimizations]);

    // Gesture detection utility
    const setupGestureDetection = useMemo(() => () => {
        if (!optimizations?.enableGestures) return;
        
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        };
        
        const handleTouchEnd = (e: TouchEvent) => {
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Detect swipe gestures
            if (Math.abs(deltaX) > 50 && deltaTime < 300) {
                const direction = deltaX > 0 ? 'right' : 'left';
                const event = new CustomEvent('swipe', { 
                    detail: { direction, deltaX, deltaY, deltaTime } 
                });
                document.dispatchEvent(event);
                triggerHaptic('light');
            }
        };
        
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [optimizations, triggerHaptic]);

    // Performance monitoring
    const monitorPerformance = useMemo(() => throttle(() => {
        if (!capabilities) return;
        
        let score = 100;
        
        // Check memory usage
        if (capabilities.memoryInfo) {
            const memoryUsage = capabilities.memoryInfo.usedJSHeapSize / 1024 / 1024; // MB
            if (memoryUsage > 100) score -= 20;
            else if (memoryUsage > 50) score -= 10;
        }
        
        // Check battery level
        if (capabilities.batteryLevel && capabilities.batteryLevel < 0.2) {
            score -= 15;
        }
        
        // Check connection quality
        if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g') {
            score -= 25;
        } else if (capabilities.connectionType === '3g') {
            score -= 10;
        }
        
        setPerformanceScore(Math.max(0, score));
    }, 5000), [capabilities]);

    // Initialize on mount
    useEffect(() => {
        const initializeCapabilities = async () => {
            await detectCapabilities();
            if (capabilities) {
                const opts = calculateOptimizations(capabilities);
                setOptimizations(opts);
                applyOptimizations(opts);
            }
        };
        initializeCapabilities();
    }, [detectCapabilities, calculateOptimizations, applyOptimizations]);

    // Set up gesture detection
    useEffect(() => {
        if (optimizations?.enableGestures) {
            return setupGestureDetection();
        }
    }, [optimizations, setupGestureDetection]);

    // Monitor performance
    useEffect(() => {
        const interval = setInterval(monitorPerformance, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, [monitorPerformance]);

    return {
        capabilities,
        optimizations,
        performanceScore,
        triggerHaptic,
        detectCapabilities,
        isOptimized: !!optimizations
    };
}

// React component for mobile optimization status
export function MobileOptimizationStatus() {
    const { capabilities, performanceScore, isOptimized } = useEnhancedMobileOptimizer();
    
    if (!isOptimized || !capabilities) return null;
    
    // Only show in development
    if (import.meta.env.PROD) return null;
    
    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
            fontFamily: 'monospace'
        }}>
            <div>Mobile: {capabilities.isMobile ? '✓' : '✗'}</div>
            <div>Performance: {performanceScore}%</div>
            <div>Connection: {capabilities.connectionType}</div>
            {capabilities.batteryLevel && (
                <div>Battery: {Math.round(capabilities.batteryLevel * 100)}%</div>
            )}
        </div>
    );
}
