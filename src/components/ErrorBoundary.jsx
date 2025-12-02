import { Component } from 'react';
import errorLogger from '../services/errorLogger';

/**
 * ErrorBoundary Component
 * Catches React errors and logs them to backend
 * Does NOT show error UI - just logs silently
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Don't update state - we won't show error UI
    return { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the backend
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown'
    });

    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    // Always render children - no error UI
    return this.props.children;
  }
}

export default ErrorBoundary;
