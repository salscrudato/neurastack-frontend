# Cache Management System

## Overview

This document describes the comprehensive cache management system implemented to ensure users always see the latest version of the NeuraStack application.

## Problem Solved

Previously, users with cached versions of the app would not see updates immediately, causing confusion and potential functionality issues.

## Solution Components

### 1. HTML Cache Control Headers

Added meta tags to `index.html`:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### 2. Comprehensive Cache Control Utility (`src/utils/cacheControl.ts`)

**Features:**
- Automatic version checking on app start and focus
- Comprehensive cache clearing (localStorage, sessionStorage, browser caches, IndexedDB)
- Cache-busting headers for API requests
- Periodic version checks every 5 minutes
- Global debugging functions

**Key Functions:**
- `clearAllAppCaches()` - Clears all application caches while preserving essential auth data
- `checkVersionAndClearCache()` - Checks version and clears cache if needed
- `forceRefreshApp()` - Forces complete app refresh with cache bypass
- `getCacheBustingHeaders()` - Returns headers to prevent API caching

### 3. Deployment Configuration

**Vercel (`vercel.json`):**
- HTML files: No caching
- Hashed assets (JS/CSS): Long-term caching (immutable)
- Images/icons: Medium-term caching (24 hours)

**Netlify (`public/_headers`):**
- Same caching strategy as Vercel
- Proper cache control for all asset types

### 4. API Request Cache Busting

**NeuraStack Client Integration:**
- All API requests include cache-busting headers
- URL parameters with timestamps and random values
- Comprehensive header merging

### 5. Version-Based Cache Management

**Build-time Version Generation:**
- Unique version numbers include build timestamp
- Version comparison triggers cache clearing
- Automatic cache invalidation on version changes

## Usage

### Automatic Operation

The system works automatically:
1. On app start, checks version and clears cache if needed
2. When app regains focus, rechecks version
3. Every 5 minutes, performs version check
4. All API requests include cache-busting headers

### Manual Cache Clearing

For debugging, use browser console:
```javascript
// Clear all caches
window.clearNeuraStackCaches()

// Force refresh app
window.forceRefreshNeuraStack()

// Check version
window.checkNeuraStackVersion()
```

### Development vs Production

**Development:**
- More verbose logging
- Debug functions available
- Shorter cache TTLs

**Production:**
- Optimized cache clearing
- Minimal logging
- Efficient version checking

## Benefits

1. **Immediate Updates**: Users see changes immediately after deployment
2. **No Cookie Prompts**: Removed cookie consent banner as requested
3. **Preserved Auth**: Essential authentication data is preserved during cache clearing
4. **Performance**: Hashed assets still benefit from long-term caching
5. **Reliability**: Multiple fallback mechanisms ensure cache clearing works

## Configuration

### Cache TTLs

- Application cache: 30 seconds (reduced from 5 minutes)
- Version checks: Every 5 minutes
- Force clear: After 1 hour (safety measure)

### Preserved Data

During cache clearing, these items are preserved:
- Firebase authentication tokens
- Essential auth user data

### Headers Added

All API requests include:
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Pragma: no-cache`
- `Expires: 0`
- `X-App-Version: [current version]`
- `X-Build-Time: [build timestamp]`
- `X-Cache-Bust: [current timestamp]`

## Monitoring

The system logs cache operations in development mode:
- Cache clearing events
- Version changes detected
- Force refresh triggers
- API cache-busting headers

## Troubleshooting

If users still see old versions:
1. Check browser developer tools for cache status
2. Use manual cache clearing functions
3. Verify deployment configuration
4. Check version numbers in localStorage

## Future Enhancements

- Service worker integration for more granular cache control
- User notification system for major updates
- Analytics for cache hit/miss rates
- Progressive cache warming for better performance
