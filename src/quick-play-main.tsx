import React from 'react';
import ReactDOM from 'react-dom/client';
import { QuickPlayEventView } from './components/event/QuickPlayEventView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Register service worker for PWA - using vite-plugin-pwa virtual module
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onNeedRefresh() {
    console.warn('New content available, please refresh.');
  },
  onOfflineReady() {
    console.warn('App ready to work offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QuickPlayEventView />
    </ErrorBoundary>
  </React.StrictMode>
);
