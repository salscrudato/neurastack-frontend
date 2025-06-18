/**
 * Advanced Analytics Service for NeuraStack
 * 
 * Comprehensive analytics implementation using Firebase Analytics
 * with user location, usage frequency, device details, and behavioral tracking.
 */

import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import { analytics, auth } from '../firebase';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UserLocation {
  country: string;
  region: string;
  city: string;
  ip: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  viewportSize: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  touchSupport: boolean;
  connectionType?: string;
}

export interface UsageMetrics {
  sessionStart: number;
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  lastVisit?: number;
  daysSinceLastVisit?: number;
  isReturningUser: boolean;
  totalSessions: number;
  averageSessionDuration: number;
}

// ============================================================================
// Core Analytics Functions
// ============================================================================

/**
 * Initialize analytics with user authentication state
 */
export function initializeAnalytics(): void {
  try {
    // Track authentication state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(analytics, user.uid);
        setUserProperties(analytics, {
          user_type: user.isAnonymous ? 'anonymous' : 'authenticated',
          sign_in_method: user.providerData[0]?.providerId || 'anonymous'
        });
        
        logEvent(analytics, 'user_authenticated', {
          user_id: user.uid,
          is_anonymous: user.isAnonymous,
          sign_in_method: user.providerData[0]?.providerId || 'anonymous'
        });
      }
    });

    // Track initial app load
    logEvent(analytics, 'app_initialized', {
      timestamp: Date.now(),
      user_agent: navigator.userAgent
    });

    console.log('✅ Analytics initialized successfully');
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

/**
 * Track page views with enhanced metadata
 */
export function trackPageView(page: string, additionalData?: Record<string, any>): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    logEvent(analytics, 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: page,
      device_type: deviceInfo.deviceType,
      screen_resolution: deviceInfo.screenResolution,
      viewport_size: deviceInfo.viewportSize,
      referrer: document.referrer || 'direct',
      timestamp: Date.now(),
      ...additionalData
    });

    // Update session metrics
    updateSessionMetrics('page_view');
  } catch (error) {
    console.warn('Page view tracking failed:', error);
  }
}

/**
 * Track custom events with comprehensive context
 */
export function trackEvent(
  eventName: string, 
  parameters?: Record<string, any>,
  includeDeviceInfo: boolean = true
): void {
  try {
    const eventData: Record<string, any> = {
      timestamp: Date.now(),
      user_id: auth.currentUser?.uid,
      ...parameters
    };

    if (includeDeviceInfo) {
      const deviceInfo = getDeviceInfo();
      eventData.device_type = deviceInfo.deviceType;
      eventData.platform = deviceInfo.platform;
      eventData.browser = deviceInfo.browserName;
    }

    logEvent(analytics, eventName, eventData);
    
    // Update interaction count
    updateSessionMetrics('interaction');
  } catch (error) {
    console.warn(`Event tracking failed for ${eventName}:`, error);
  }
}

/**
 * Collect and track user location using IP geolocation
 */
export async function trackUserLocation(): Promise<UserLocation | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const locationData = await response.json();
    
    const userLocation: UserLocation = {
      country: locationData.country_name || 'Unknown',
      region: locationData.region || 'Unknown',
      city: locationData.city || 'Unknown',
      ip: locationData.ip || 'Unknown',
      timezone: locationData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    };

    // Set user properties for segmentation
    setUserProperties(analytics, {
      user_country: userLocation.country,
      user_region: userLocation.region,
      user_city: userLocation.city,
      user_timezone: userLocation.timezone
    });

    // Log location event
    logEvent(analytics, 'user_location_detected', {
      country: userLocation.country,
      region: userLocation.region,
      city: userLocation.city,
      timezone: userLocation.timezone,
      has_coordinates: !!(userLocation.latitude && userLocation.longitude)
    });

    return userLocation;
  } catch (error) {
    console.warn('Location tracking failed:', error);
    
    // Fallback to timezone-based location
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fallbackLocation: UserLocation = {
      country: 'Unknown',
      region: 'Unknown', 
      city: 'Unknown',
      ip: 'Unknown',
      timezone
    };

    setUserProperties(analytics, {
      user_timezone: timezone
    });

    return fallbackLocation;
  }
}

/**
 * Track usage frequency and returning user behavior
 */
export function trackUsageFrequency(): UsageMetrics {
  try {
    const now = Date.now();
    const lastVisit = localStorage.getItem('lastVisit');
    const sessionStart = parseInt(localStorage.getItem('sessionStart') || now.toString());
    const totalSessions = parseInt(localStorage.getItem('totalSessions') || '0') + 1;
    const sessionDurations = JSON.parse(localStorage.getItem('sessionDurations') || '[]');

    let daysSinceLastVisit = 0;
    let isReturningUser = false;

    if (lastVisit) {
      daysSinceLastVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
      isReturningUser = true;
      
      logEvent(analytics, 'returning_user', { 
        days_since_last_visit: Math.round(daysSinceLastVisit),
        total_sessions: totalSessions
      });
    } else {
      logEvent(analytics, 'new_user', {
        first_visit: now,
        total_sessions: 1
      });
    }

    // Calculate average session duration
    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((sum: number, duration: number) => sum + duration, 0) / sessionDurations.length
      : 0;

    const usageMetrics: UsageMetrics = {
      sessionStart,
      sessionDuration: now - sessionStart,
      pageViews: parseInt(localStorage.getItem('sessionPageViews') || '0'),
      interactions: parseInt(localStorage.getItem('sessionInteractions') || '0'),
      lastVisit: lastVisit ? parseInt(lastVisit) : undefined,
      daysSinceLastVisit: Math.round(daysSinceLastVisit),
      isReturningUser,
      totalSessions,
      averageSessionDuration: Math.round(averageSessionDuration)
    };

    // Update localStorage
    localStorage.setItem('lastVisit', now.toString());
    localStorage.setItem('totalSessions', totalSessions.toString());
    localStorage.setItem('sessionStart', sessionStart.toString());

    // Set user properties
    setUserProperties(analytics, {
      total_sessions: totalSessions,
      is_returning_user: isReturningUser,
      average_session_duration: Math.round(averageSessionDuration / 1000), // in seconds
      days_since_last_visit: Math.round(daysSinceLastVisit)
    });

    return usageMetrics;
  } catch (error) {
    console.warn('Usage frequency tracking failed:', error);
    return {
      sessionStart: Date.now(),
      sessionDuration: 0,
      pageViews: 0,
      interactions: 0,
      isReturningUser: false,
      totalSessions: 1,
      averageSessionDuration: 0
    };
  }
}

/**
 * Get comprehensive device information
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  const screenResolution = `${screen.width}x${screen.height}`;
  const viewportSize = `${window.innerWidth}x${window.innerHeight}`;
  
  // Detect device type
  const deviceType: 'mobile' | 'tablet' | 'desktop' = (() => {
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return /iPad|Android(?!.*Mobile)/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  })();

  // Extract browser info
  const browserInfo = getBrowserInfo(userAgent);
  const osInfo = getOperatingSystemInfo(userAgent);

  return {
    userAgent,
    platform,
    language,
    screenResolution,
    viewportSize,
    deviceType,
    browserName: browserInfo.name,
    browserVersion: browserInfo.version,
    operatingSystem: osInfo,
    touchSupport: 'ontouchstart' in window,
    connectionType: (navigator as any).connection?.effectiveType || undefined
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getBrowserInfo(userAgent: string): { name: string; version: string } {
  const browsers = [
    { name: 'Chrome', regex: /Chrome\/(\d+)/ },
    { name: 'Firefox', regex: /Firefox\/(\d+)/ },
    { name: 'Safari', regex: /Safari\/(\d+)/ },
    { name: 'Edge', regex: /Edge\/(\d+)/ },
    { name: 'Opera', regex: /Opera\/(\d+)/ }
  ];

  for (const browser of browsers) {
    const match = userAgent.match(browser.regex);
    if (match) {
      return { name: browser.name, version: match[1] };
    }
  }

  return { name: 'Unknown', version: 'Unknown' };
}

function getOperatingSystemInfo(userAgent: string): string {
  if (/Windows NT/i.test(userAgent)) return 'Windows';
  if (/Mac OS X/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

function updateSessionMetrics(type: 'page_view' | 'interaction'): void {
  try {
    const key = type === 'page_view' ? 'sessionPageViews' : 'sessionInteractions';
    const current = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (current + 1).toString());
  } catch (error) {
    console.warn('Session metrics update failed:', error);
  }
}

/**
 * End session and save duration
 */
export function endSession(): void {
  try {
    const sessionStart = parseInt(localStorage.getItem('sessionStart') || Date.now().toString());
    const sessionDuration = Date.now() - sessionStart;

    // Save session duration
    const sessionDurations = JSON.parse(localStorage.getItem('sessionDurations') || '[]');
    sessionDurations.push(sessionDuration);

    // Keep only last 10 sessions
    if (sessionDurations.length > 10) {
      sessionDurations.shift();
    }

    localStorage.setItem('sessionDurations', JSON.stringify(sessionDurations));

    // Log session end
    logEvent(analytics, 'session_end', {
      session_duration: Math.round(sessionDuration / 1000), // in seconds
      page_views: parseInt(localStorage.getItem('sessionPageViews') || '0'),
      interactions: parseInt(localStorage.getItem('sessionInteractions') || '0')
    });

    // Clear session data
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('sessionPageViews');
    localStorage.removeItem('sessionInteractions');
  } catch (error) {
    console.warn('Session end tracking failed:', error);
  }
}

// ============================================================================
// Feature-Specific Analytics
// ============================================================================

/**
 * Track chat interactions and AI model usage
 */
export function trackChatInteraction(data: {
  messageLength: number;
  responseTime: number;
  modelsUsed: string[];
  sessionId?: string;
  messageType?: 'text' | 'image' | 'file';
}): void {
  trackEvent('chat_interaction', {
    message_length: data.messageLength,
    response_time_ms: data.responseTime,
    models_used: data.modelsUsed.join(','),
    model_count: data.modelsUsed.length,
    session_id: data.sessionId,
    message_type: data.messageType || 'text'
  });
}

/**
 * Track NeuraFit fitness interactions
 */
export function trackFitnessInteraction(data: {
  action: 'goal_selected' | 'workout_generated' | 'workout_completed' | 'profile_updated';
  fitnessLevel?: string;
  goals?: string[];
  equipment?: string[];
  workoutType?: string;
  duration?: number;
}): void {
  trackEvent('fitness_interaction', {
    fitness_action: data.action,
    fitness_level: data.fitnessLevel,
    goals_selected: data.goals?.join(','),
    goal_count: data.goals?.length || 0,
    equipment_available: data.equipment?.join(','),
    equipment_count: data.equipment?.length || 0,
    workout_type: data.workoutType,
    workout_duration: data.duration
  });
}

/**
 * Track user engagement and feature usage
 */
export function trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>): void {
  trackEvent('feature_usage', {
    feature_name: feature,
    feature_action: action,
    ...metadata
  });
}

/**
 * Track performance metrics
 */
export function trackPerformanceMetric(data: {
  metricName: string;
  value: number;
  unit: string;
  context?: string;
}): void {
  trackEvent('performance_metric', {
    metric_name: data.metricName,
    metric_value: data.value,
    metric_unit: data.unit,
    metric_context: data.context
  });
}

/**
 * Track errors and issues
 */
export function trackError(error: {
  errorType: string;
  errorMessage: string;
  component?: string;
  stackTrace?: string;
  userAgent?: string;
}): void {
  trackEvent('app_error', {
    error_type: error.errorType,
    error_message: error.errorMessage,
    error_component: error.component,
    has_stack_trace: !!error.stackTrace,
    user_agent: error.userAgent || navigator.userAgent
  }, false); // Don't include device info to avoid redundancy
}
