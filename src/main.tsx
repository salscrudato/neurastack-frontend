// main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';

// Lazy load pages for better performance
const SplashPage = React.lazy(() => import('./pages/SplashPage').then(m => ({ default: m.SplashPage })));
const ChatPage = React.lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const AppStorePage = React.lazy(() => import('./pages/AppStorePage'));
const NeurataskPage = React.lazy(() => import('./pages/NeurataskPage'));
const NeuraplannerPage = React.lazy(() => import('./pages/NeuraplannerPage'));
const NeuraPromptsPage = React.lazy(() => import('./pages/NeuraPromptsPage'));
const NeuraFitPage = React.lazy(() => import('./pages/NeuraFitPage'));
const AIResponseDemo = React.lazy(() => import('./components/AIResponseDemo').then(m => ({ default: m.AIResponseDemo })));

// Create router with proper nested routes
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
        path: 'apps',
        element: (
          <Suspense fallback={<PageLoader message="Loading apps..." />}>
            <AppStorePage />
          </Suspense>
        )
      },
      {
        path: 'apps/neuratask',
        element: (
          <Suspense fallback={<PageLoader message="Loading Neuratask..." />}>
            <NeurataskPage />
          </Suspense>
        )
      },
      {
        path: 'apps/neuraplanner',
        element: (
          <Suspense fallback={<PageLoader message="Loading Neuraplanner..." />}>
            <NeuraplannerPage />
          </Suspense>
        )
      },
      {
        path: 'apps/neuraprompts',
        element: (
          <Suspense fallback={<PageLoader message="Loading NeuraPrompts..." />}>
            <NeuraPromptsPage />
          </Suspense>
        )
      },
      {
        path: 'apps/neurafit',
        element: (
          <Suspense fallback={<PageLoader message="Loading NeuraFit..." />}>
            <NeuraFitPage />
          </Suspense>
        )
      },
      {
        path: 'demo/ai-response',
        element: (
          <Suspense fallback={<PageLoader message="Loading AI Response Demo..." />}>
            <AIResponseDemo />
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
