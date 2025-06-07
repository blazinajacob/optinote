import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { registerSW, cachePageContent } from './pwa';

// Register service worker for PWA
if (import.meta.env.PROD) {
  registerSW();
}

// Initialize the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Cache current page for offline use
window.addEventListener('load', () => {
  if (import.meta.env.PROD) {
    cachePageContent();
  }
});