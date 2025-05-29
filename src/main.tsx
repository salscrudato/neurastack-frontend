// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';
import App from './App';
import { SplashPage } from './pages/SplashPage';
import { ChatPage } from './pages/ChatPage';
import AppStorePage from './pages/AppStorePage';
import NeurataskPage from './pages/NeurataskPage';

// Create router with proper nested routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <SplashPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'apps', element: <AppStorePage /> },
      { path: 'apps/neuratask', element: <NeurataskPage /> },
    ]
  }
], {
  future: {
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true
  }
});

// Basic error boundary component
function ErrorBoundary() {
  return (
    <div className="error-container">
      <h1>Oops! Something went wrong</h1>
      <p>We couldn't find the page you're looking for.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);

// Register service worker for PWA install prompt support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use the correct path to the service worker file
    // In development with Vite, we need to use the dev-sw.js file
    const swPath = import.meta.env.DEV ? '/dev-sw.js' : '/sw.js';
    
    navigator.serviceWorker
      .register(swPath)
      .then(reg => console.log('Service worker registered:', reg.scope))
      .catch(err => console.error('Service worker registration failed:', err));
  });
}
