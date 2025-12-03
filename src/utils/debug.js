/**
 * Debug utilities for admin impersonation
 * Allows admins to view the app as another citizen for troubleshooting
 */

const IMPERSONATION_KEY = 'debug_impersonate_nni';
const ADMIN_WHITELIST_KEY = 'admin_nnis';

/**
 * Set the NNI to impersonate
 * @param {string} nni - The NNI to impersonate
 */
export function setImpersonatedNNI(nni) {
  if (nni && nni.trim()) {
    localStorage.setItem(IMPERSONATION_KEY, nni.trim());
    console.log('[DEBUG] Impersonating NNI:', nni.trim());
  } else {
    clearImpersonatedNNI();
  }
}

/**
 * Get the currently impersonated NNI
 * @returns {string|null} The impersonated NNI or null
 */
export function getImpersonatedNNI() {
  return localStorage.getItem(IMPERSONATION_KEY);
}

/**
 * Clear impersonation
 */
export function clearImpersonatedNNI() {
  localStorage.removeItem(IMPERSONATION_KEY);
  console.log('[DEBUG] Cleared impersonation');
}

/**
 * Check if currently impersonating
 * @returns {boolean}
 */
export function isImpersonating() {
  return !!getImpersonatedNNI();
}

/**
 * Get the effective NNI (impersonated or real)
 * @param {string} realNNI - The real NNI from the token
 * @returns {string} The NNI to use for API calls
 */
export function getEffectiveNNI(realNNI) {
  const impersonated = getImpersonatedNNI();
  return impersonated || realNNI;
}

/**
 * Check if the current user is an admin (allowed to impersonate)
 * This is a simple client-side check - backend will validate properly
 * @param {string} nni - The user's NNI
 * @returns {boolean}
 */
export function isAdmin(nni) {
  // Admin NNIs whitelist
  // TODO: This could be fetched from backend or environment variable
  const adminNNIs = [
    '1234567890',  // Example admin NNI
    '1623990685',  // Admin user
    // Add more admin NNIs here
  ];

  return adminNNIs.includes(nni);
}

/**
 * Log impersonation attempt for audit trail
 * @param {string} adminNNI - The admin's NNI
 * @param {string} targetNNI - The target NNI being impersonated
 */
export function logImpersonation(adminNNI, targetNNI) {
  const log = {
    timestamp: new Date().toISOString(),
    admin_nni: adminNNI,
    target_nni: targetNNI,
    action: 'impersonate'
  };

  console.log('[AUDIT] Impersonation:', log);

  // Store in localStorage for client-side audit trail
  const auditLog = JSON.parse(localStorage.getItem('debug_audit_log') || '[]');
  auditLog.push(log);

  // Keep only last 50 entries
  if (auditLog.length > 50) {
    auditLog.shift();
  }

  localStorage.setItem('debug_audit_log', JSON.stringify(auditLog));
}

/**
 * Get audit log
 * @returns {Array}
 */
export function getAuditLog() {
  return JSON.parse(localStorage.getItem('debug_audit_log') || '[]');
}
