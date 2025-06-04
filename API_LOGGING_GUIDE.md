# API Response Logging Guide

## 🚀 Deployment Complete

**Live URL**: https://neurastackai-frontend.web.app

The application has been deployed to Firebase hosting with comprehensive API response logging enabled.

## 📊 Console Logging Features

### 1. **API Request Logging**
Every outgoing API request is logged with:
```
🚀 NeuraStack API Request
📤 Endpoint: https://neurastack-server-373148373738.us-central1.run.app/api/query
📋 Request Body: {
  "prompt": "Create a leg workout",
  "useEnsemble": true,
  "models": ["openai:gpt-4", "google:gemini-1.5-flash", "xai:grok-3-mini", "xai:grok-3-mini"],
  "maxTokens": 2000,
  "temperature": 0.7
}
🔧 Headers: { "Content-Type": "application/json" }
⚙️ Config: {
  "sessionId": "uuid-here",
  "userId": "user-id-here",
  "timeout": 30000
}
```

### 2. **API Response Logging**
Every API response is logged with:
```
📥 NeuraStack API Response
✅ Status: 200 OK
📊 Response Data: {
  "answer": "**Leg Workout Plan...**",
  "modelsUsed": { "openai:gpt-4": true, ... },
  "fallbackReasons": {},
  "executionTime": "13532ms",
  "ensembleMode": true,
  "ensembleMetadata": { ... }
}
⏱️ Response Headers: { "content-type": "application/json", ... }
```

### 3. **Error Logging**
API errors are logged with:
```
❌ NeuraStack API Error
🚫 Status: 500 Internal Server Error
📋 Error Data: { "error": "...", "message": "..." }
🔗 URL: https://neurastack-server-373148373738.us-central1.run.app/api/query
```

### 4. **Chat Store Processing**
Frontend processing is logged with:
```
🎯 Chat Store Processing
📝 Original Answer Length: 1234
✂️ Cleaned Answer Length: 1230
🔍 Answer Preview: **Leg Workout Plan: "Grounded Power"**...
📊 Metadata: {
  "ensembleMode": true,
  "modelsUsed": { ... },
  "executionTime": "13532ms",
  "tokenCount": 456
}
```

## 🔍 How to Use the Logging

### 1. **Open Developer Console**
- **Chrome/Edge**: F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- **Firefox**: F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)
- **Safari**: Cmd+Option+C

### 2. **Navigate to Console Tab**
Click on the "Console" tab in the developer tools

### 3. **Send a Chat Message**
Type any message in the chat interface and send it

### 4. **View the Logs**
You'll see a sequence of grouped logs:
1. 🚀 **Request Log** - What was sent to the API
2. 📥 **Response Log** - What was received from the API
3. 🎯 **Processing Log** - How the frontend processed it

## 🎯 Debugging Response Differences

### Compare Postman vs Frontend

**Step 1**: Send the same prompt in both Postman and the frontend

**Step 2**: Compare the request logs:
- Check if `sessionId` and `userId` are different
- Verify the `models` array is identical
- Confirm `useEnsemble` and other parameters match

**Step 3**: Compare the response logs:
- Look at the raw `answer` field in both responses
- Check if `ensembleMetadata` differs
- Verify `modelsUsed` and `fallbackReasons`

### Key Differences to Look For

1. **Session Context**: Frontend sends `sessionId` and `userId`
2. **Memory System**: Backend may use previous conversation context
3. **Model Array**: Frontend uses specific model configuration
4. **Request Headers**: May include additional authentication

## 🛠️ Technical Implementation

### Files Modified for Logging

1. **`src/lib/neurastack-client.ts`**
   - Added request logging before API calls
   - Added response logging after successful responses
   - Added error logging for failed requests

2. **`src/store/useChatStore.tsx`**
   - Added processing logging to show frontend transformations
   - Logs original vs cleaned answer lengths
   - Shows metadata processing

### Log Levels

- **🚀 Request**: Outgoing API calls
- **📥 Response**: Incoming API responses
- **❌ Error**: API errors and failures
- **🎯 Processing**: Frontend data processing

## 🔧 Production Considerations

The logging is currently enabled for all environments. To disable in production:

1. Wrap console logs in environment checks:
```typescript
if (import.meta.env.DEV) {
  console.group('🚀 NeuraStack API Request');
  // ... logging code
}
```

2. Or use a logging library with configurable levels

## 📱 Mobile Testing

The logging works on mobile devices too:
- **iOS Safari**: Settings > Safari > Advanced > Web Inspector
- **Android Chrome**: chrome://inspect on desktop Chrome
- **Remote debugging**: Use browser dev tools connected to mobile device

## 🎉 Ready for Testing

Your application is now live at **https://neurastackai-frontend.web.app** with comprehensive API logging. You can now:

1. Compare responses between Postman and the live frontend
2. See exactly what requests are being sent
3. View raw API responses before any processing
4. Debug any differences in real-time
