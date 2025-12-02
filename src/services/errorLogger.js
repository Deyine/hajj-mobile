import api from './api';

/**
 * Error Logger Service
 * Sends JavaScript errors to the backend for centralized logging
 */

class ErrorLogger {
  constructor() {
    this.enabled = true;
    this.maxRetries = 2;
  }

  /**
   * Log an error to the backend
   * @param {Error} error - The error object
   * @param {Object} additionalInfo - Additional context information
   */
  async logError(error, additionalInfo = {}) {
    if (!this.enabled) {
      console.warn('Error logging is disabled');
      return;
    }

    try {
      const errorData = {
        message: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace available',
        component_stack: additionalInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...additionalInfo
      };

      // Send to backend (don't await to avoid blocking)
      this.sendToBackend(errorData);

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.error('Error logged:', errorData);
      }
    } catch (loggingError) {
      // Don't let error logging fail the app
      console.error('Failed to log error:', loggingError);
    }
  }

  /**
   * Send error data to backend with retry logic
   */
  async sendToBackend(errorData, retryCount = 0) {
    try {
      await api.post('/api/v1/mobile/log_error', {
        error: errorData
      });
    } catch (err) {
      // Retry if failed and haven't exceeded max retries
      if (retryCount < this.maxRetries) {
        setTimeout(() => {
          this.sendToBackend(errorData, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        console.error('Failed to send error to backend after retries:', err);
      }
    }
  }

  /**
   * Disable error logging (useful for testing)
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Enable error logging
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Log a manual error message (for use in catch blocks)
   * @param {string} message - Error message
   * @param {Object} context - Additional context
   */
  logManualError(message, context = {}) {
    const error = new Error(message);
    this.logError(error, {
      ...context,
      type: 'manual_error'
    });
  }
}

// Export singleton instance
const errorLogger = new ErrorLogger();
export default errorLogger;
