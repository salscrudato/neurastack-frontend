// main.tsx
import { ChakraProvider } from '@chakra-ui/react';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';
import theme from './theme/theme';

// Import pages directly for debugging
import { ChatPage } from './pages/ChatPage';
import { SplashPage } from './pages/SplashPage';
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const NeuraFitPage = React.lazy(() => import('./pages/NeuraFitPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));

// Create router with Chat and History routes
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
        path: 'history',
        element: (
          <Suspense fallback={<PageLoader message="Loading History..." />}>
            <HistoryPage />
          </Suspense>
        )
      },
      {
        path: 'neurafit',
        element: (
          <Suspense fallback={<PageLoader message="Loading NeuraFit..." />}>
            <NeuraFitPage />
          </Suspense>
        )
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<PageLoader message="Loading Admin Dashboard..." />}>
            <AdminPage />
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Load API test utilities in development mode
if (import.meta.env.DEV) {
  import('./utils/api-test').then(() => {
    console.log('🔧 API test utilities loaded in development mode');
    console.log('Use window.apiTest.runAllAPITests("your-user-id") to test APIs');
  });
}
