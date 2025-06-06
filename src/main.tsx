// main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';

// Debug logging
console.log('🚀 NeuraStack starting...');
console.log('📦 Environment variables:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE,
  hasFirebaseConfig: !!(import.meta.env.VITE_FIREBASE_API_KEY)
});

// Import pages directly for debugging
import { SplashPage } from './pages/SplashPage';
import { ChatPage } from './pages/ChatPage';
const NeuraFitPage = React.lazy(() => import('./pages/NeuraFitPage'));

// Create router with streamlined routes - only Chat and NeuraFit
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <SplashPage />
      },
      {
        path: 'chat',
        element: <ChatPage />
      },
      {
        path: 'neurafit',
        element: (
          <Suspense fallback={<PageLoader message="Loading NeuraFit..." />}>
            <NeuraFitPage />
          </Suspense>
        )
      },
    ]
  }
], {
  future: {
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

// Route-specific error boundary component
function RouteErrorBoundary() {
  return (
    <div className="error-container">
      <h1>Oops! Something went wrong</h1>
      <p>We couldn't find the page you're looking for.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
