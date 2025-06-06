// main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';

// Lazy load pages for better performance - streamlined to only essential features
const SplashPage = React.lazy(() => import('./pages/SplashPage').then(m => ({ default: m.SplashPage })));
const ChatPage = React.lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
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
        element: (
          <Suspense fallback={<PageLoader message="Loading..." />}>
            <SplashPage />
          </Suspense>
        )
      },
      {
        path: 'chat',
        element: (
          <Suspense fallback={<PageLoader message="Loading chat..." />}>
            <ChatPage />
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
