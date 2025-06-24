# 🚀 Deployment Guide for neuraplanner

## Overview

This guide covers deploying the neurastack-frontend application with the integrated neuraplanner to various platforms, with a focus on production-ready configurations for the NYC market launch.

## Pre-Deployment Checklist

### 1. API Keys & Environment Variables

- [ ] Skyscanner API key obtained and tested
- [ ] OpenTable API credentials configured
- [ ] Affiliate IDs set up for commission tracking
- [ ] Firebase configuration (if using)
- [ ] Backend API URL configured

### 2. Performance Optimization

- [ ] Bundle size analysis completed
- [ ] Image optimization implemented
- [ ] Service worker configured for offline support
- [ ] CDN configuration for static assets

### 3. Testing

- [ ] All travel search flows tested
- [ ] Mobile responsiveness verified
- [ ] Booking affiliate links validated
- [ ] Error handling tested
- [ ] Performance benchmarks met

## Deployment Platforms

### Option 1: Vercel (Recommended)

#### Why Vercel?

- Excellent React/Vite support
- Global CDN with edge functions
- Automatic HTTPS and custom domains
- Built-in analytics and performance monitoring
- Easy environment variable management

#### Setup Steps

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Configure Environment Variables**
   Create `vercel.json`:

```json
{
  "env": {
    "VITE_SKYSCANNER_API_KEY": "@skyscanner-api-key",
    "VITE_OPENTABLE_API_KEY": "@opentable-api-key",
    "VITE_AFFILIATE_ID": "@affiliate-id",
    "VITE_BACKEND_URL": "https://neurastack-server-373148373738.us-central1.run.app"
  },
  "build": {
    "env": {
      "VITE_SKYSCANNER_API_KEY": "@skyscanner-api-key",
      "VITE_OPENTABLE_API_KEY": "@opentable-api-key",
      "VITE_AFFILIATE_ID": "@affiliate-id"
    }
  }
}
```

3. **Add Environment Secrets**

```bash
vercel env add VITE_SKYSCANNER_API_KEY
vercel env add VITE_OPENTABLE_API_KEY
vercel env add VITE_AFFILIATE_ID
```

4. **Deploy**

```bash
vercel --prod
```

#### Custom Domain Setup

```bash
vercel domains add neuraplanner.com
vercel domains add www.neuraplanner.com
```

### Option 2: Netlify

#### Setup Steps

1. **Build Configuration**
   Create `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

2. **Environment Variables**
   Set in Netlify dashboard:

- `VITE_SKYSCANNER_API_KEY`
- `VITE_OPENTABLE_API_KEY`
- `VITE_AFFILIATE_ID`
- `VITE_BACKEND_URL`

3. **Deploy**

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Firebase Hosting

#### Setup Steps

1. **Install Firebase CLI**

```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize Firebase**

```bash
firebase init hosting
```

3. **Configure `firebase.json`**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

4. **Deploy**

```bash
npm run build
firebase deploy
```

## Production Configuration

### 1. Environment Variables

#### Required Variables

```bash
# Travel API Keys
VITE_SKYSCANNER_API_KEY=your_production_key
VITE_OPENTABLE_API_KEY=your_production_key
VITE_AFFILIATE_ID=neuraplanner_prod

# Backend Configuration
VITE_BACKEND_URL=https://your-backend-api.com

# Analytics & Monitoring
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=your_sentry_dsn
```

#### Optional Variables

```bash
# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true

# Performance
VITE_CDN_URL=https://cdn.neuraplanner.com
VITE_API_TIMEOUT=30000
```

### 2. Build Optimization

#### Vite Configuration

Update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          chakra: ["@chakra-ui/react"],
          travel: ["./src/lib/travelApi", "./src/store/useTravelStore"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 3. Performance Monitoring

#### Analytics Setup

```typescript
// src/lib/analytics.ts
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const trackTravelSearch = (searchType: string, destination: string) => {
  logEvent(analytics, "travel_search", {
    search_type: searchType,
    destination: destination,
  });
};

export const trackBookingClick = (type: string, price: number) => {
  logEvent(analytics, "booking_click", {
    booking_type: type,
    value: price,
    currency: "USD",
  });
};
```

## Domain & SSL Configuration

### Custom Domain Setup

1. **Purchase Domain**

   - Recommended: `neuraplanner.com`
   - Alternative: `neuraplanner.app`

2. **DNS Configuration**

```
Type    Name    Value
A       @       76.76.19.61 (Vercel)
CNAME   www     neuraplanner.com
```

3. **SSL Certificate**
   - Automatic with Vercel/Netlify
   - Let's Encrypt for custom setups

## Monitoring & Maintenance

### 1. Performance Monitoring

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: < 500KB gzipped
- **API Response Times**: < 2s average

### 2. Error Monitoring

```typescript
// src/lib/monitoring.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### 3. Health Checks

```typescript
// src/lib/healthCheck.ts
export const performHealthCheck = async () => {
  const checks = {
    api: await checkBackendAPI(),
    skyscanner: await checkSkyscannerAPI(),
    opentable: await checkOpenTableAPI(),
  };

  return checks;
};
```

## Security Considerations

### 1. API Key Security

- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Implement rate limiting on backend
- Monitor API usage for anomalies

### 2. Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
               connect-src 'self' https://api.skyscanner.net https://platform.otrestaurants.com;
               img-src 'self' data: https:;"
/>
```

### 3. HTTPS Enforcement

- Force HTTPS redirects
- HSTS headers
- Secure cookie settings

## Launch Checklist

### Pre-Launch

- [ ] All API integrations tested in production
- [ ] Performance benchmarks met
- [ ] Mobile optimization verified
- [ ] SEO optimization completed
- [ ] Analytics tracking implemented
- [ ] Error monitoring configured

### Launch Day

- [ ] DNS propagation verified
- [ ] SSL certificate active
- [ ] All affiliate links working
- [ ] Monitoring dashboards active
- [ ] Support channels ready

### Post-Launch

- [ ] Performance monitoring active
- [ ] User feedback collection
- [ ] Conversion rate tracking
- [ ] Revenue attribution working
- [ ] Regular health checks scheduled

## Rollback Plan

### Emergency Rollback

```bash
# Vercel
vercel rollback [deployment-url]

# Netlify
netlify api rollbackSiteDeploy --site-id [site-id] --deploy-id [deploy-id]

# Firebase
firebase hosting:clone [source-site-id]:[source-version] [target-site-id]
```

### Monitoring Triggers

- Error rate > 5%
- Response time > 5s
- Conversion rate drop > 20%
- API failure rate > 10%
