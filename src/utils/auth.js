/**
 * Authentication utility functions for OIDC flow
 */

/**
 * Generates a random string for PKCE code verifier
 * @param {number} length - Length of the string (43-128 characters recommended)
 * @returns {string} Random string
 */
export function generateRandomString(length = 64) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const charactersLength = characters.length

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

/**
 * Generates PKCE code challenge from verifier
 * @param {string} verifier - Code verifier string
 * @returns {Promise<string>} Base64 URL-encoded SHA-256 hash
 */
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(digest))

  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Stores code verifier in sessionStorage
 * @param {string} verifier - Code verifier to store
 */
export function storeCodeVerifier(verifier) {
  sessionStorage.setItem('code_verifier', verifier)
}

/**
 * Retrieves code verifier from sessionStorage
 * @returns {string|null} Code verifier or null if not found
 */
export function getCodeVerifier() {
  return sessionStorage.getItem('code_verifier')
}

/**
 * Removes code verifier from sessionStorage
 */
export function clearCodeVerifier() {
  sessionStorage.removeItem('code_verifier')
}

/**
 * Stores access token in localStorage
 * @param {string} token - Access token
 */
export function storeAccessToken(token) {
  localStorage.setItem('access_token', token)
}

/**
 * Retrieves access token from localStorage
 * @returns {string|null} Access token or null if not found
 */
export function getAccessToken() {
  return localStorage.getItem('access_token')
}

/**
 * Stores refresh token in localStorage
 * @param {string} token - Refresh token
 */
export function storeRefreshToken(token) {
  localStorage.setItem('refresh_token', token)
}

/**
 * Retrieves refresh token from localStorage
 * @returns {string|null} Refresh token or null if not found
 */
export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

/**
 * Stores user information in localStorage
 * @param {object} userInfo - User information object
 */
export function storeUserInfo(userInfo) {
  localStorage.setItem('user_info', JSON.stringify(userInfo))
}

/**
 * Retrieves user information from localStorage
 * @returns {object|null} User information object or null if not found
 */
export function getUserInfo() {
  const userInfo = localStorage.getItem('user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * Clears all authentication data from storage
 */
export function clearAuthData() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_info')
  sessionStorage.removeItem('code_verifier')
}

/**
 * Checks if user is authenticated
 * @returns {boolean} True if access token exists
 */
export function isAuthenticated() {
  return !!getAccessToken()
}

/**
 * Detects if running in a WebView (e.g., Khidmaty native app)
 * @returns {boolean} True if running in a webview
 */
export function isWebView() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /wv|WebView/i.test(userAgent)
}

/**
 * Checks if running in WebView with pre-injected authentication
 * (e.g., Khidmaty native app has already set tokens in localStorage)
 * @returns {boolean} True if webview with existing tokens
 */
export function isWebViewAuthenticated() {
  return isWebView() && isAuthenticated()
}
