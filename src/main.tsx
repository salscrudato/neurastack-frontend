import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Design‑system / providers
import OptimizedChakraProvider from './components/OptimizedChakraProvider';

// Core shell & utilities
import App from './App';
import { AuthGuard } from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';


// Pages (lazy‑loaded where appropriate)
import { SplashPage } from './pages/SplashPage';
import { preloadCriticalServices } from './services/lazyFirebase';

// Import test utilities in development mode
if (import.meta.env.DEV) {
  import('./utils/stripeTestUtils');
}

const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const PaymentSuccessPage = React.lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentErrorPage = React.lazy(() => import('./pages/PaymentErrorPage'));
// Lazy‑load named export `ChatPage` and expose it as default for React.lazy
const ChatPage = React.lazy(() =>
  import('./pages/ChatPage').then((m) => ({ default: m.ChatPage }))
);

// Router configuration (React Router v7)
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
            <Suspense fallback={<PageLoader message="Loading Chat..." />}>
              <ChatPage />
            </Suspense>
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
      {
        path: 'payment/success',
        element: (
          <AuthGuard requireAuth={true}>
            <Suspense fallback={<PageLoader message="Loading..." />}>
              <PaymentSuccessPage />
            </Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'payment/error',
        element: (
          <AuthGuard requireAuth={true}>
            <Suspense fallback={<PageLoader message="Loading..." />}>
              <PaymentErrorPage />
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
    <div className="error-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong</h1>
      <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>We couldn't find the page you're looking for. Please try refreshing or navigating back.</p>
      <button onClick={() => window.location.href = '/'} style={{ padding: '0.5rem 1rem', background: '#4F9CF9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Go to Home
      </button>
    </div>
  );
}

// Preload critical Firebase services in the background (non‑blocking)
void preloadCriticalServices().catch(err => {
  if (import.meta.env.DEV) {
    console.warn('Service preload failed:', err);
  }
  // In production, this would be sent to analytics service
});

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <OptimizedChakraProvider>
        <RouterProvider router={router} fallbackElement={<PageLoader message="Loading..." />} />
      </OptimizedChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);