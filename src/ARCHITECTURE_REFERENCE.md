# NeuraStack Frontend - Architecture Reference
*Comprehensive guide for Augment AI to understand and maintain the codebase*

## 📁 File Structure (Simplified)

### Core Application Files
```
src/
├── App.tsx                 # Root component with routing
├── main.tsx               # Application entry point
├── firebase.tsx           # Firebase configuration
├── vite-env.d.ts         # TypeScript environment definitions

├── pages/                 # Main application pages
│   ├── SplashPage.tsx    # Landing/authentication page
│   ├── ChatPage.tsx      # Main chat interface
│   └── HistoryPage.tsx   # Saved chat sessions

├── components/           # Reusable UI components
│   ├── Header.tsx        # Navigation header
│   ├── ChatInput.tsx     # Message input component
│   ├── ChatMessage.tsx   # Message display component
│   ├── LoadingSpinner.tsx # Simple loading states
│   ├── BrandLogo.tsx     # Logo component
│   └── ErrorBoundary.tsx # Error handling wrapper

├── store/               # State management (Zustand)
│   ├── useAuthStore.tsx  # Authentication state
│   ├── useChatStore.tsx  # Chat messages and session
│   └── useHistoryStore.tsx # Chat history management

├── lib/                 # Core business logic
│   ├── neurastack-client.ts # API client for NeuraStack
│   └── types.ts         # TypeScript type definitions

├── services/            # External service integrations
│   └── chatHistoryService.ts # Firebase Firestore operations

├── utils/               # Utility functions (minimal)
│   ├── authUtils.ts     # Authentication helpers
│   └── securityUtils.ts # Input sanitization

├── styles/              # Global styling
│   ├── global.css       # Global styles and resets
│   └── utilities.css    # Utility classes

└── theme/               # UI theme configuration
    └── unified-theme.ts # Chakra UI theme customization
```

## 🔄 Data Flow Architecture

### 1. Authentication Flow
```
SplashPage → Firebase Auth → useAuthStore → App Router → ChatPage
```

### 2. Chat Message Flow
```
User Input → ChatInput → useChatStore.sendMessage → neurastack-client → API
API Response → useChatStore → ChatMessage → UI Update
```

### 3. History Management Flow
```
Chat Session → useHistoryStore.saveSession → Firebase Firestore
History Page → useHistoryStore.loadSessions → Firebase Firestore → UI
```

## 🏪 State Management (Zustand)

### useAuthStore.tsx
**Purpose**: Manage user authentication state
**State**: `{ user: FirebaseUser | null }`
**Actions**: `setUser(user)`

### useChatStore.tsx
**Purpose**: Handle chat messages and session management
**Key State**:
- `messages: Message[]` - Current chat messages
- `isLoading: boolean` - API request state
- `sessionId: string` - Current session identifier
- `error: string | null` - Error state

**Key Actions**:
- `sendMessage(text: string)` - Send message to AI
- `clearMessages()` - Clear current chat
- `addMessage(message: Message)` - Add message to chat

### useHistoryStore.tsx
**Purpose**: Manage saved chat sessions
**Key State**:
- `sessions: ChatSession[]` - Saved chat sessions
- `isLoading: boolean` - Loading state

**Key Actions**:
- `saveSession(messages, title?)` - Save current chat
- `loadSession(sessionId)` - Load saved session
- `deleteSession(sessionId)` - Delete saved session

## 🔌 API Integration

### neurastack-client.ts
**Purpose**: Handle all communication with NeuraStack API
**Key Methods**:
- `configure(options)` - Set up client configuration
- `queryAI(prompt, options)` - Send message to AI ensemble
- `validateResponse(response)` - Validate API responses

**Configuration**:
- Session management for conversation context
- Error handling with retry logic
- Response parsing and validation

## 🎨 UI Components

### Core Component Patterns

#### ChatMessage.tsx
**Purpose**: Display individual chat messages
**Props**: `{ message: Message, isFirstAssistantMessage?: boolean }`
**Features**:
- User vs AI message styling
- Ensemble metadata display
- Copy functionality
- Error state handling

#### ChatInput.tsx
**Purpose**: Handle user message input
**Features**:
- Auto-resize textarea
- Send button integration
- Mobile keyboard optimization
- Input validation

#### Header.tsx
**Purpose**: Navigation and user menu
**Features**:
- Brand logo display
- Mobile navigation drawer
- User authentication status
- Page navigation

## 🎯 Design System

### Color Palette
```css
Primary Background: #FFFFFF
Secondary Background: #FAFBFC
Primary Blue: #007BFF
Text Primary: #1A202C
Text Secondary: #718096
Border Color: #E2E8F0
```

### Typography
- **Font Family**: Inter
- **Sizes**: 14px (small), 16px (base), 18px (large)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)

### Spacing System
- **Base Unit**: 8px
- **Common Spacing**: 8px, 16px, 24px, 32px, 48px
- **Border Radius**: 8px (standard), 12px (large), 16px (xl)

### Mobile Optimization
- **Touch Targets**: Minimum 44px
- **Breakpoints**: 768px (tablet), 1200px (desktop)
- **Safe Areas**: iOS notch and home indicator support

## 🔒 Security Implementation

### Input Sanitization
- All user inputs sanitized before API calls
- XSS prevention through proper escaping
- SQL injection prevention (though using NoSQL)

### Firebase Security
- Firestore rules restrict access to user's own data
- Authentication required for sensitive operations
- Environment variables for sensitive configuration

### Error Handling
- Graceful degradation for API failures
- User-friendly error messages
- Secure error logging (no sensitive data)

## 📱 Mobile Considerations

### Performance Targets
- **Time to Interactive**: <1s on 3G
- **Bundle Size**: <500KB gzipped
- **Lighthouse Score**: >90 performance

### Touch Optimization
- Minimum 44px touch targets
- Proper touch feedback
- Gesture-friendly interactions
- Keyboard-aware input positioning

### Accessibility
- WCAG AA compliance
- Screen reader support
- Focus management
- High contrast support

## 🧪 Testing Strategy

### Critical User Flows
1. **Authentication**: Login/logout functionality
2. **Chat Interaction**: Send message, receive response
3. **Session Management**: Save/load chat sessions
4. **Mobile Experience**: Touch interactions, keyboard handling

### Testing Files
- `src/tests/` - Component and integration tests
- Focus on user-facing functionality
- Mock external dependencies (Firebase, API)

## 🚀 Deployment

### Build Process
- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Preview**: `npm run preview`

### Environment Configuration
- **Development**: Local Firebase emulators
- **Production**: Firebase Hosting + Firestore
- **Environment Variables**: Managed through `.env` files

---

*This reference is maintained alongside code changes to ensure AI understanding*
*Last Updated: 2025-07-14 - Version 4.0.0*
