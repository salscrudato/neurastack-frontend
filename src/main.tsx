import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';

// Import pages and auth guard
import { AuthGuard } from './components/AuthGuard';
import OptimizedChakraProvider from './components/OptimizedChakraProvider';
import { ChatPage } from './pages/ChatPage';
import { SplashPage } from './pages/SplashPage';
import { preloadCriticalServices } from './services/lazyFirebase';

const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));

// Router configuration using v7 standards
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
        ),
      },
      {
        path: 'chat',
        element: (
          <AuthGuard requireAuth={true}>
            <ChatPage />
          </AuthGuard>
        ),
      },
      {
        path: 'history',
        element: (
          <AuthGuard requireAuth={true}>
            <Suspense fallback={<PageLoader message="Loading History..." />}>
              <HistoryPage />
            </Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'subscription',
        element: (
          <AuthGuard requireAuth={true}>
            <Suspense fallback={<PageLoader message="Loading Subscription..." />}>
              <SubscriptionPage />
            </Suspense>
          </AuthGuard>
        ),
      },

    ],
  },
], {
  basename: '/', // Explicit for clarity; adjust if needed for deployment
});

// Enhanced route error boundary with better UX
function RouteErrorBoundary() {
  return (
    <div className="error-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong</h1>
      <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>We couldn't find the page you're looking for. Please try refreshing or navigating back.</p>
      <button onClick={() => window.location.href = '/'} style={{ padding: '0.5rem 1rem', background: '#4F9CF9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Go to Home
      </button>
    </div>
  );
}

// Async initialization with error handling
setTimeout(() => {
  preloadCriticalServices().catch(error => {
    console.warn('Service preload failed:', error);
    // Optional: Add analytics or user notification here
  });
}, 0);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <OptimizedChakraProvider>
        <RouterProvider router={router} fallbackElement={<PageLoader message="Loading..." />} />
      </OptimizedChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);