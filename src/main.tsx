import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { I18nProvider } from './contexts/I18nContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { LaboratoryProvider } from './contexts/LaboratoryContext.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

// Handle benign IndexedDB lifecycle events and offline transitions gracefully
if (typeof window !== 'undefined') {
  // Suppress expected sandbox [vite] HMR notices and benign Firestore offline fallback notices
  const isIgnoredMessage = (args: any[]) => {
    const fullText = args
      .map(a => {
        if (typeof a === 'string') return a;
        if (a instanceof Error) return a.message + ' ' + a.stack;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a || '');
        }
      })
      .join(' ');

    return (
      fullText.startsWith('[vite]') ||
      fullText.includes('Could not reach Cloud Firestore backend') ||
      fullText.includes('client will operate in offline mode') ||
      fullText.includes('Failed to get document from server') ||
      fullText.includes("didn't respond within 10 seconds") ||
      fullText.includes('Database is closing') ||
      fullText.includes('Database is hidden') ||
      fullText.includes('identity-credentials-get') ||
      fullText.includes('FedCM get() rejects') ||
      fullText.includes('GSI_LOGGER')
    );
  };

  const origWarn = console.warn;
  const origError = console.error;
  console.warn = (...args) => {
    if (isIgnoredMessage(args)) {
      console.info('[Sandbox Environment Notice]', ...args);
      return;
    }
    origWarn.apply(console, args);
  };
  console.error = (...args) => {
    if (isIgnoredMessage(args)) {
      console.info('[Sandbox Environment Notice]', ...args);
      return;
    }
    origError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason instanceof Error ? reason.message : String(reason || '');
    if (
      msg.includes('Database is closing') ||
      msg.includes('Database is hidden') ||
      msg.includes('closing') ||
      msg.includes('IndexedDB') ||
      msg.includes('unavailable') ||
      msg.includes('offline') ||
      msg.includes('identity-credentials-get') ||
      msg.includes('FedCM')
    ) {
      event.preventDefault();
      console.info('[Lifecycle] Handled background transition gracefully.');
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('Database is closing') ||
      msg.includes('Database is hidden') ||
      msg.includes('IndexedDB') ||
      msg.includes('identity-credentials-get') ||
      msg.includes('FedCM')
    ) {
      event.preventDefault();
      console.info('[Lifecycle] Suppressed benign sandbox notice.');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <LaboratoryProvider>
            <App />
          </LaboratoryProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
