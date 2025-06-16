# NeuraStack API Integration - Latest Backend Version

## Overview

This document describes the updated NeuraStack frontend API integration that aligns with the latest backend specification. The integration includes enhanced features such as memory system support, session tracking, improved error handling, and full TypeScript type safety.

## Key Features

### ✨ **Enhanced API Client**
- **Full Type Safety**: Complete TypeScript definitions matching backend specification
- **Memory System Integration**: Support for user memory, session context, and memory metrics
- **Session & User Tracking**: Automatic session ID generation and user-scoped operations
- **Advanced Error Handling**: Structured error responses with retry logic
- **Request Optimization**: Built-in caching, timeout handling, and request deduplication

### 🔄 **Backward Compatibility**
- **Legacy API Support**: Existing `queryStack()` function continues to work
- **Gradual Migration**: Smooth transition path from old to new API
- **Type Conversion**: Automatic conversion between old and new response formats

### 🎯 **React Integration**
- **Custom Hooks**: Ready-to-use React hooks for common operations
- **State Management**: Built-in loading, error, and response state handling
- **Cancellation Support**: Request cancellation and cleanup

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                     │
├─────────────────────────────────────────────────────────────┤
│  React Components & Hooks                                   │
│  ├── useNeuraStackAI()                                     │
│  ├── useMemoryMetrics()                                    │
│  └── useSessionContext()                                   │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                  │
│  ├── NeuraStackClient (New)                               │
│  └── queryStack() (Legacy - Backward Compatible)          │
├─────────────────────────────────────────────────────────────┤
│  Type Definitions                                           │
│  ├── NeuraStackQueryRequest                               │
│  ├── NeuraStackQueryResponse                              │
│  ├── MemoryMetrics                                        │
│  └── SessionContext                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  NeuraStack Backend API                     │
│  ├── /api/query (Enhanced)                                │
│  ├── /api/memory/metrics                                  │
│  ├── /api/memory/context                                  │
│  └── /health                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Using the New API Client

```typescript
import { neuraStackClient } from '../lib/neurastack-client';

// Configure the client
neuraStackClient.configure({
  sessionId: 'your-session-id',
  userId: 'your-user-id',
  useEnsemble: true
});

// Make a query
const response = await neuraStackClient.queryAI('Your prompt here', {
  useEnsemble: true,
  temperature: 0.7
  // maxTokens is optional - backend controls limits based on tier
});

console.log(response.answer);
console.log(response.memoryContext);
console.log(response.tokenCount);
```

### 2. Using React Hooks

```typescript
import { useNeuraStackAI, useMemoryMetrics } from '../hooks/useNeuraStackAI';

function MyComponent() {
  const { queryAI, loading, error, response } = useNeuraStackAI();
  const { metrics, refresh } = useMemoryMetrics('user-123');

  const handleQuery = async () => {
    try {
      await queryAI('Tell me about quantum computing', {
        useEnsemble: true,
        temperature: 0.7
        // maxTokens removed - backend controls response length
      });
    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleQuery} disabled={loading}>
        {loading ? 'Querying...' : 'Ask AI'}
      </button>
      
      {error && <div>Error: {error}</div>}
      
      {response && (
        <div>
          <p>{response.answer}</p>
          <small>Tokens: {response.tokenCount}</small>
        </div>
      )}
    </div>
  );
}
```

### 3. Legacy API (Backward Compatible)

```typescript
import { queryStack } from '../lib/api';

// Existing code continues to work
const response = await queryStack('Your prompt', true);
console.log(response.answer);
```

## API Reference

### NeuraStackClient

#### Methods

- **`queryAI(prompt, options)`** - Query the AI with enhanced options
- **`getMemoryMetrics(userId)`** - Get memory metrics for a user
- **`getSessionContext(sessionId)`** - Get session context and memories
- **`healthCheck()`** - Check API health status
- **`configure(config)`** - Update client configuration

#### Configuration Options

```typescript
interface NeuraStackClientConfig {
  baseUrl?: string;           // API base URL
  sessionId?: string;         // Session ID for continuity
  userId?: string;            // User ID for memory scoping
  authToken?: string;         // Authentication token
  timeout?: number;           // Request timeout (ms)
  useEnsemble?: boolean;      // Default ensemble mode
}
```

### Request Types

#### NeuraStackQueryRequest

```typescript
interface NeuraStackQueryRequest {
  prompt: string;             // User's question/prompt
  useEnsemble?: boolean;      // Use 4-AI ensemble
  models?: string[];          // Specific models to use
  maxTokens?: number;         // Maximum response tokens (optional - backend controls)
  temperature?: number;       // Creativity (0-1)
}
```

### Response Types

#### NeuraStackQueryResponse

```typescript
interface NeuraStackQueryResponse {
  answer: string;                    // Primary AI response
  ensembleMode: boolean;             // Whether ensemble was used
  modelsUsed: Record<string, boolean>; // Model success status
  executionTime: string;             // Total execution time
  memoryContext?: string;            // Memory context summary
  tokenCount: number;                // Response token count
  memoryTokensSaved?: number;        // Tokens saved via compression
  ensembleMetadata?: EnsembleMetadata; // Ensemble analysis
  fallbackReasons?: Record<string, string>; // Error reasons
}
```

#### Memory System Types

```typescript
interface MemoryMetrics {
  totalMemories: number;
  averageImportance: number;
  averageCompressionRatio: number;
  totalTokensSaved: number;
  memoryByType: Record<MemoryType, number>;
  retentionStats: {
    active: number;
    archived: number;
    expired: number;
  };
  accessPatterns: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
}
```

## Migration Guide

### From Legacy API to New Client

**Before:**
```typescript
import { queryStack } from '../lib/api';

const response = await queryStack('prompt', true);
```

**After:**
```typescript
import { neuraStackClient } from '../lib/neurastack-client';

const response = await neuraStackClient.queryAI('prompt', {
  useEnsemble: true
});
```

### Key Differences

1. **Enhanced Response**: New API includes memory context, token counts, and improved ensemble metadata
2. **Session Tracking**: Automatic session and user ID management
3. **Memory Integration**: Access to memory metrics and session context
4. **Better Error Handling**: Structured error responses with retry information
5. **Type Safety**: Full TypeScript support with comprehensive type definitions

## Error Handling

### Error Types

```typescript
class NeuraStackApiError extends Error {
  statusCode: number;         // HTTP status code
  timestamp: string;          // Error timestamp
  retryable: boolean;         // Whether error is retryable
}
```

### Common Error Scenarios

- **400 Bad Request**: Invalid prompt or parameters
- **401 Unauthorized**: Authentication failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Backend service error
- **408 Timeout**: Request timed out

## Performance Optimizations

### Built-in Features

1. **Request Caching**: 5-second deduplication cache
2. **Timeout Handling**: Configurable request timeouts
3. **Retry Logic**: Automatic retries for transient errors
4. **Memory Compression**: Token savings through memory system
5. **Efficient State Management**: Optimized React hook implementations

### Best Practices

1. **Use Ensemble Mode**: Better response quality with 4-AI ensemble
2. **Set Appropriate Timeouts**: Balance responsiveness with reliability
3. **Implement Error Boundaries**: Graceful error handling in React
4. **Cache Memory Metrics**: Avoid frequent memory metric requests
5. **Session Management**: Maintain consistent session IDs for context

## Testing

The integration includes comprehensive tests covering:

- ✅ API client functionality
- ✅ React hook behavior
- ✅ Error handling scenarios
- ✅ Backward compatibility
- ✅ Memory system integration
- ✅ Type safety validation

Run tests with:
```bash
npm test src/tests/neurastack-api.test.ts
```

## Demo Component

A complete demo component is available at `src/components/NeuraStackDemo.tsx` showcasing:

- Configuration management
- AI querying with all options
- Memory metrics display
- Error handling
- Real-time status updates

## Support

For issues or questions regarding the NeuraStack API integration:

1. Check the TypeScript definitions in `src/lib/types.ts`
2. Review the demo component for usage examples
3. Run the test suite to verify functionality
4. Consult the backend API documentation for server-side details

---

**Ready for Production!** 🚀

The NeuraStack frontend is now fully integrated with the latest backend API specification, providing enhanced functionality while maintaining backward compatibility.
