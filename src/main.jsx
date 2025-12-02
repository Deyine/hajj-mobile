import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import errorLogger from './services/errorLogger'

// Set up global error handler for uncaught errors
window.addEventListener('error', (event) => {
  errorLogger.logError(event.error || new Error(event.message), {
    type: 'uncaught_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Set up global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));

  errorLogger.logError(error, {
    type: 'unhandled_rejection',
    promise: 'Promise rejection'
  });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary name="Root">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
