import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Clean up any legacy service worker caches and ensure fresh updates
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      if (name === 'netzero-v1') {
        caches.delete(name);
      }
    });
  });
}

// Register service worker for offline PWA functionality in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.update();
      })
      .catch((err) => {
        console.log('SW registration error:', err);
      });
  });
}
