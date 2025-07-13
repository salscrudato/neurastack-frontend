// main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';
import { setupCacheManagement } from './utils/cacheControl';
import { initializeResourcePreloading } from './utils/resourcePreloader';

// Import pages and auth guard
import { AuthGuard } from './components/AuthGuard';
import OptimizedChakraProvider from './components/OptimizedChakraProvider';
import { ChatPage } from './pages/ChatPage';
import { SplashPage } from './pages/SplashPage';
import { preloadCriticalServices } from './services/lazyFirebase';

const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));

// Create router with Chat and History routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <AuthGuard requireAuth={false}>
            <SplashPage />
          </AuthGuard>
        )
      },
      {
        path: 'chat',
        element: (
          <AuthGuard requireAuth={true}>
            <ChatPage />
          </AuthGuard>
        )
      },
      {
        path: 'history',
        element: (
          <AuthGuard requireAuth={true}>
            <Suspense fallback={<PageLoader message="Loading History..." />}>
              <HistoryPage />
            </Suspense>
          </AuthGuard>
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
    // v7_startTransition: true // Will be available in React Router v7
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

// Setup cache management before rendering
let cleanupCacheManagement: (() => void) | undefined;
try {
  cleanupCacheManagement = setupCacheManagement();
} catch (error) {
  console.warn('Cache management setup failed:', error);
}

// Initialize resource preloading for optimal performance (with error handling)
// Defer to avoid blocking main thread
setTimeout(() => {
  try {
    initializeResourcePreloading();
  } catch (error) {
    console.warn('Resource preloading failed:', error);
  }
}, 0);

// Preload critical Firebase services (with error handling)
// Defer to avoid blocking main thread
setTimeout(() => {
  try {
    preloadCriticalServices();
  } catch (error) {
    console.warn('Firebase preloading failed:', error);
  }
}, 100);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <OptimizedChakraProvider>
        <RouterProvider router={router} />
      </OptimizedChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Cleanup cache management on page unload
if (cleanupCacheManagement) {
  window.addEventListener('beforeunload', cleanupCacheManagement);
}

// Performance optimizations are handled by individual components
