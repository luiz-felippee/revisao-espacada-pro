import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SyncQueueService } from './services/SyncQueueService'
import { initWebVitals } from './utils/webVitals'

// ⚠️ CRITICAL: Validate environment before anything else
import './config/env'

import { logger } from './utils/logger'
import { initSentry } from './lib/sentry'

// Initialize Error Tracking (Sentry)
// Will only activate if VITE_SENTRY_DSN is set in .env
initSentry();

// Initialize PWA
registerSW({
  immediate: true,
  onOfflineReady() {
    logger.info('App ready to work offline')
  },
})

// Initialize Sync Queue
SyncQueueService.loadQueue();
SyncQueueService.processQueue();

// Initialize web vitals tracking
initWebVitals();

// Global Error Trap


// PWA Disabled



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
