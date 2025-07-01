# CORS Fix for Cache-Busting Headers

## Problem

After implementing comprehensive cache management, API requests were failing with CORS errors:

```
Access to fetch at 'https://neurastack-backend-*.run.app/default-ensemble' 
from origin 'https://neurastack.ai' has been blocked by CORS policy: 
Request header field pragma is not allowed by Access-Control-Allow-Headers in preflight response.
```

## Root Cause

The cache-busting headers we added (`Cache-Control`, `Pragma`, `Expires`) are not "simple headers" and trigger CORS preflight requests. The backend's CORS configuration doesn't allow these headers.

## Solution

### 1. Removed Problematic Headers

**Before:**
```typescript
export function getCacheBustingHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-App-Version': APP_VERSION,
    'X-Build-Time': BUILD_TIME,
    'X-Cache-Bust': Date.now().toString(),
  };
}
```

**After:**
```typescript
export function getCacheBustingHeaders(): Record<string, string> {
  return {
    // Only include CORS-safe headers that don't require preflight
    'X-App-Version': APP_VERSION,
    'X-Build-Time': BUILD_TIME,
    'X-Cache-Bust': Date.now().toString(),
    'X-Request-Time': new Date().toISOString(),
  };
}
```

### 2. Enhanced URL-Based Cache Busting

**Before:**
```typescript
finalEndpoint = `${endpoint}${separator}_t=${timestamp}&_r=${random}`;
```

**After:**
```typescript
const appVersion = (__APP_VERSION__ || '3.0.0').replace(/\./g, '');
const buildTime = (__BUILD_TIME__ || Date.now().toString()).substr(-8);
finalEndpoint = `${endpoint}${separator}_t=${timestamp}&_r=${random}&_v=${appVersion}&_b=${buildTime}`;
```

### 3. Browser-Level Cache Control

Added `cache: 'no-store'` to fetch options:
```typescript
const response = await fetch(`${this.config.baseUrl}${finalEndpoint}`, {
  ...options,
  headers: mergedHeaders,
  signal: options.signal || controller.signal,
  cache: 'no-store' // Browser-level cache control
});
```

## CORS-Safe Headers

Headers that don't trigger preflight (safe to use):
- `X-*` custom headers (our cache-busting headers)
- `Content-Type` (for application/json)
- Standard headers like `Accept`, `Accept-Language`, etc.

Headers that trigger preflight (avoid):
- `Cache-Control`
- `Pragma` 
- `Expires`
- `Authorization` (unless specifically allowed)

## Benefits of This Approach

1. **No CORS Issues**: Only uses headers that don't require preflight
2. **Effective Cache Busting**: URL parameters + browser cache control
3. **Backend Compatibility**: Works with existing CORS configuration
4. **Performance**: Avoids unnecessary preflight requests

## Testing

After deployment, verify:
1. No CORS errors in browser console
2. API requests succeed
3. Cache busting still works (check Network tab for unique URLs)
4. App updates are still delivered immediately

## Future Considerations

If more aggressive header-based cache control is needed:
1. Update backend CORS configuration to allow additional headers
2. Or continue relying on URL parameters and browser cache options
3. Consider service worker for more granular cache control

This solution maintains effective cache management while ensuring CORS compatibility.
