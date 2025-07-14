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

// Simplified router (removed future flags as v7 is released by 2025; assume standard v7 behavior)
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
]);

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

// Combined deferred initializations (non-blocking, single setTimeout)
setTimeout(() => {
  try {
    initializeResourcePreloading();
    preloadCriticalServices();
  } catch (error) {
    console.warn('Initialization failed:', error);
  }
}, 0);

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