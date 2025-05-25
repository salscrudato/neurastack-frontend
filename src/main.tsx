// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import theme from './theme/theme';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <App />          {/* <- your component tree starts here */}
        </AnimatePresence>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);

// Register service worker for PWA install prompt support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service worker registered:', reg.scope))
      .catch(err => console.error('Service worker registration failed:', err));
  });
}