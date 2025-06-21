/**
 * Main Application Entry Point
 *
 * This file sets up the React application with routing, theming, and error handling.
 * It creates a single-page application (SPA) with multiple routes for different features.
 */

// Import React and core libraries for building the user interface
import { ChakraProvider } from '@chakra-ui/react';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import main app component and error handling
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';
import theme from './theme/theme';

// Import page components - some are loaded immediately, others are lazy-loaded for better performance
import { ChatPage } from './pages/ChatPage';  // Chat interface for AI conversations
import { SplashPage } from './pages/SplashPage';  // Welcome/landing page

// Lazy-loaded pages - these are loaded only when the user navigates to them
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));  // Chat history viewer
const NeuraFitPage = React.lazy(() => import('./pages/NeuraFitPage'));  // Fitness app interface
const AdminPage = React.lazy(() => import('./pages/AdminPage'));  // Admin dashboard

/**
 * Application Router Configuration
 *
 * Sets up all the routes (pages) that users can navigate to in the app.
 * Uses React Router for client-side navigation without page refreshes.
 */
const router = createBrowserRouter([
  {
    path: '/',  // Root path - the main app container
    element: <App />,  // Main app component that wraps all pages
    errorElement: <RouteErrorBoundary />,  // Shows error page if something goes wrong
    children: [
      {
        index: true,  // Default page when user visits the root URL
        element: <SplashPage />  // Welcome page with app introduction
      },
      {
        path: 'chat',  // /chat - AI conversation interface
        element: <ChatPage />
      },
      {
        path: 'history',  // /history - View past conversations
        element: (
          <Suspense fallback={<PageLoader message="Loading History..." />}>
            <HistoryPage />
          </Suspense>
        )
      },
      {
        path: 'neurafit',  // /neurafit - Fitness tracking and workout generation
        element: (
          <Suspense fallback={<PageLoader message="Loading NeuraFit..." />}>
            <NeuraFitPage />
          </Suspense>
        )
      },
      {
        path: 'admin',  // /admin - Administrative dashboard (restricted access)
        element: (
          <Suspense fallback={<PageLoader message="Loading Admin Dashboard..." />}>
            <AdminPage />
          </Suspense>
        )
      },
    ]
  }
], {
  // Future React Router features - enables new capabilities as they become stable
  future: {
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

/**
 * Error Boundary for Route-Level Errors
 *
 * This component catches errors that happen during navigation or page loading.
 * It shows a user-friendly error message instead of a blank screen.
 */
function RouteErrorBoundary() {
  return (
    <div className="error-container">
      <h1>Oops! Something went wrong</h1>
      <p>We couldn't find the page you're looking for.</p>
    </div>
  );
}

/**
 * Application Bootstrap
 *
 * This is where the React app actually starts running in the browser.
 * It sets up the component tree with all necessary providers and error handling.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Global error boundary catches any unhandled errors in the app */}
    <ErrorBoundary>
      {/* Chakra UI provider gives us access to the design system and theme */}
      <ChakraProvider theme={theme}>
        {/* Router provider enables navigation between different pages */}
        <RouterProvider router={router} />
      </ChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
