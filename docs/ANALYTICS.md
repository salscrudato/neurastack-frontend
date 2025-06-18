# NeuraStack Analytics Implementation

This document describes the comprehensive analytics implementation for the NeuraStack frontend application using Firebase Analytics.

## 🎯 Overview

The analytics system provides:
- **User behavior tracking** - Page views, interactions, feature usage
- **Location analytics** - IP-based geolocation with privacy compliance
- **Usage frequency** - Session tracking, returning user analysis
- **Device information** - Browser, OS, device type, screen resolution
- **Performance metrics** - Load times, response times, error tracking
- **Privacy compliance** - GDPR/CCPA consent management

## 🏗️ Architecture

### Core Components

1. **Analytics Service** (`src/services/analyticsService.ts`)
   - Core Firebase Analytics integration
   - User location tracking via IP geolocation
   - Device information collection
   - Session management

2. **Analytics Hook** (`src/hooks/useAnalytics.tsx`)
   - React hook for easy integration
   - Automatic page tracking
   - Specialized hooks for chat and fitness features

3. **Privacy Consent** (`src/components/PrivacyConsent.tsx`)
   - GDPR/CCPA compliant consent banner
   - Granular privacy preferences
   - Only enables tracking after consent

## 🚀 Quick Start

### Basic Usage

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

function MyComponent() {
  const { trackCustomEvent, trackFeature } = useAnalytics();

  const handleButtonClick = () => {
    trackCustomEvent('button_clicked', {
      button_name: 'subscribe',
      page: 'landing'
    });
  };

  const handleFeatureUsage = () => {
    trackFeature('search', 'query_submitted', {
      query_length: 25,
      filters_applied: 3
    });
  };

  return (
    <button onClick={handleButtonClick}>
      Subscribe
    </button>
  );
}
```

### Chat Analytics

```typescript
import { useChatAnalytics } from '../hooks/useAnalytics';

function ChatComponent() {
  const { trackMessage, trackChatFeature } = useChatAnalytics();

  const handleMessageSent = (message: string, responseTime: number) => {
    trackMessage(
      message.length,
      responseTime,
      ['gpt-4', 'gemini-1.5'],
      'session-123'
    );
  };

  return <ChatInterface onMessageSent={handleMessageSent} />;
}
```

### Fitness Analytics

```typescript
import { useNeuraFitAnalytics } from '../hooks/useAnalytics';

function FitnessComponent() {
  const { trackGoalSelection, trackWorkoutGeneration } = useNeuraFitAnalytics();

  const handleGoalSelect = (goals: string[]) => {
    trackGoalSelection(goals, 'intermediate');
  };

  const handleWorkoutGenerated = (type: string, equipment: string[]) => {
    trackWorkoutGeneration(type, equipment, 45);
  };

  return <FitnessInterface />;
}
```

## 📊 Event Types

### Core Events

- `page_view` - Automatic page navigation tracking
- `user_authenticated` - User login/signup events
- `app_error` - Error tracking with context
- `performance_metric` - Performance measurements

### Chat Events

- `chat_interaction` - Message sent/received with AI models
- `chat_cleared` - Chat history cleared
- `session_start` - New chat session initiated

### Fitness Events

- `fitness_interaction` - Goal selection, workout generation
- `goal_selected` - Fitness goal selection/deselection
- `workout_generated` - AI workout creation
- `workout_completed` - Workout completion tracking

### Feature Events

- `feature_usage` - Generic feature interaction tracking
- `button_clicked` - UI interaction tracking
- `form_submitted` - Form completion tracking

## 🌍 Location & Privacy

### IP Geolocation

The system uses `ipapi.co` for IP-based location detection:

```typescript
// Automatic location tracking on app initialization
const location = await trackUserLocation();
// Returns: { country, region, city, timezone, ip }
```

### Privacy Compliance

- **Consent Required**: Analytics only enabled after user consent
- **Granular Controls**: Users can choose specific tracking types
- **Data Minimization**: Only essential data collected
- **Transparent**: Clear privacy policy and consent UI

### Consent Management

```typescript
import { hasAnalyticsConsent, getConsentPreferences } from '../components/PrivacyConsent';

// Check if analytics is enabled
if (hasAnalyticsConsent()) {
  trackEvent('user_action', { action: 'click' });
}

// Get detailed preferences
const preferences = getConsentPreferences();
if (preferences?.analytics) {
  // Advanced analytics enabled
}
```

## 📱 Device & Session Tracking

### Device Information

Automatically collected:
- Device type (mobile/tablet/desktop)
- Browser name and version
- Operating system
- Screen resolution and viewport size
- Touch support detection
- Connection type (if available)

### Session Management

- **Session Duration**: Automatic tracking of user session length
- **Page Views**: Count of pages visited per session
- **Interactions**: Number of user interactions per session
- **Returning Users**: Detection and analysis of returning users

## 🔧 Configuration

### Firebase Setup

1. **Enable Google Analytics** in Firebase Console
2. **Link to Google Analytics** property
3. **Configure measurement ID** in `firebase.tsx`

### Environment Variables

```bash
# Firebase configuration (already set)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=neurastackai-frontend
VITE_FIREBASE_MEASUREMENT_ID=G-YP4HY7MFT2
```

### Analytics Initialization

```typescript
// Automatic initialization in App.tsx
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  useAnalytics(); // Initializes tracking
  return <AppContent />;
}
```

## 📈 Data Analysis

### Google Analytics Dashboard

Access real-time and historical data:
- **Real-time users** and activity
- **User demographics** and interests
- **Behavior flow** and user journeys
- **Conversion tracking** and goals

### Custom Reports

Create custom reports for:
- **Feature adoption** rates
- **User engagement** metrics
- **Performance bottlenecks**
- **Error frequency** and patterns

### BigQuery Export

For advanced analysis:
1. **Enable BigQuery export** in Google Analytics
2. **Query raw event data** with SQL
3. **Create custom dashboards** and reports
4. **Long-term data retention** and analysis

## 🛡️ Privacy & Security

### Data Protection

- **No PII collection** without explicit consent
- **IP anonymization** in Google Analytics
- **Secure data transmission** via HTTPS
- **Minimal data retention** policies

### Compliance Features

- **GDPR Article 7** compliant consent
- **CCPA compliance** with opt-out options
- **Cookie categorization** (essential, analytics, marketing)
- **Data subject rights** support

## 🚨 Error Handling

### Graceful Degradation

```typescript
// Analytics failures don't break app functionality
try {
  trackEvent('user_action', data);
} catch (error) {
  console.warn('Analytics tracking failed:', error);
  // App continues normally
}
```

### Error Tracking

```typescript
// Automatic error tracking
trackError({
  errorType: 'TypeError',
  errorMessage: 'Cannot read property of undefined',
  component: 'ChatInput',
  stackTrace: error.stack
});
```

## 📚 Best Practices

### Performance

- **Lazy loading** of analytics service
- **Debounced tracking** for high-frequency events
- **Minimal payload** sizes
- **Async initialization** to avoid blocking

### Privacy

- **Consent first** approach
- **Clear data usage** explanations
- **Easy opt-out** mechanisms
- **Regular consent renewal**

### Data Quality

- **Event validation** before sending
- **Consistent naming** conventions
- **Structured data** with proper types
- **Context preservation** across sessions

## 🔍 Debugging

### Development Mode

```typescript
// Enable debug logging
if (import.meta.env.DEV) {
  console.log('Analytics event:', eventName, parameters);
}
```

### Testing

```typescript
// Test analytics in development
import { trackEvent } from '../services/analyticsService';

// Test event tracking
trackEvent('test_event', {
  test_parameter: 'test_value',
  timestamp: Date.now()
});
```

## 📞 Support

For questions or issues:
1. Check the **console logs** for error messages
2. Verify **Firebase configuration** is correct
3. Ensure **user consent** is properly obtained
4. Review **Google Analytics** real-time reports

---

**Note**: This analytics implementation prioritizes user privacy and follows industry best practices for data collection and consent management.
