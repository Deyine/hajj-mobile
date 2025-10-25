/**
 * OIDC (OpenID Connect) service for Khidmaty authentication
 */

import {
  generateRandomString,
  generateCodeChallenge,
  storeCodeVerifier,
  getCodeVerifier,
  clearCodeVerifier,
  storeAccessToken,
  storeRefreshToken,
  storeUserInfo,
  clearAuthData
} from '../utils/auth'

// OIDC Configuration - uses dev credentials for localhost
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export const OIDC_CONFIG = {
  AUTH_SERVER: 'https://oidc.khidmaty.gov.mr',
  CLIENT_ID: isDevelopment ? 'oidcTest' : 'Next-Haj',
  CLIENT_SECRET: isDevelopment
    ? 'D54A90D024447A1E4966C33F6FCB61657DEIDINE'
    : '6A9EA8D755E210FAA307F41FC60A71A64A8E3FBB3C3F3185898124A371CD0D6C',
  REDIRECT_URI: `${window.location.origin}/cb`,
  SCOPE: 'openid email profile phone address offline_access api:read'
}

// OIDC Endpoints
export const OIDC_ENDPOINTS = {
  AUTHORIZATION: `${OIDC_CONFIG.AUTH_SERVER}/auth`,
  TOKEN: `${OIDC_CONFIG.AUTH_SERVER}/token`,
  USER_INFO: `${OIDC_CONFIG.AUTH_SERVER}/me`,
  LOGOUT: `${OIDC_CONFIG.AUTH_SERVER}/session/end`
}

/**
 * Initiates the OIDC login flow with PKCE
 * Generates code verifier/challenge and redirects to authorization endpoint
 */
export async function initiateLogin() {
  try {
    // Generate PKCE parameters
    const codeVerifier = generateRandomString(64)
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    // Store code verifier for later use in token exchange
    storeCodeVerifier(codeVerifier)

    // Build authorization URL
    const authUrl = new URL(OIDC_ENDPOINTS.AUTHORIZATION)
    authUrl.searchParams.append('client_id', OIDC_CONFIG.CLIENT_ID)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', OIDC_CONFIG.SCOPE)
    authUrl.searchParams.append('redirect_uri', OIDC_CONFIG.REDIRECT_URI)
    authUrl.searchParams.append('code_challenge', codeChallenge)
    authUrl.searchParams.append('code_challenge_method', 'S256')

    // Redirect to authorization endpoint
    window.location.href = authUrl.toString()
  } catch (error) {
    console.error('Error initiating login:', error)
    throw error
  }
}

/**
 * Exchanges authorization code for tokens
 * @param {string} code - Authorization code from callback
 * @returns {Promise<object>} Token response with access_token, refresh_token, etc.
 */
export async function exchangeCodeForTokens(code) {
  try {
    // Retrieve the code verifier from storage
    const codeVerifier = getCodeVerifier()

    if (!codeVerifier) {
      throw new Error('Code verifier not found in storage')
    }

    // Prepare token request
    const tokenUrl = OIDC_ENDPOINTS.TOKEN
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: OIDC_CONFIG.REDIRECT_URI,
      client_id: OIDC_CONFIG.CLIENT_ID,
      client_secret: OIDC_CONFIG.CLIENT_SECRET,
      code_verifier: codeVerifier
    })

    // Request tokens
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error_description || 'Token exchange failed')
    }

    const tokenData = await response.json()

    // Store tokens
    storeAccessToken(tokenData.access_token)
    if (tokenData.refresh_token) {
      storeRefreshToken(tokenData.refresh_token)
    }

    // Clear code verifier as it's no longer needed
    clearCodeVerifier()

    return tokenData
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw error
  }
}

/**
 * Fetches user information from the userinfo endpoint
 * @param {string} accessToken - Access token
 * @returns {Promise<object>} User information
 */
export async function fetchUserInfo(accessToken) {
  try {
    const response = await fetch(OIDC_ENDPOINTS.USER_INFO, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    const userInfo = await response.json()

    // Store user info
    storeUserInfo(userInfo)

    return userInfo
  } catch (error) {
    console.error('Error fetching user info:', error)
    throw error
  }
}

/**
 * Logs out the user
 * Clears local storage and redirects to logout endpoint
 */
export function logout() {
  // Clear all auth data
  clearAuthData()

  // Build logout URL
  const logoutUrl = new URL(OIDC_ENDPOINTS.LOGOUT)
  logoutUrl.searchParams.append('client_id', OIDC_CONFIG.CLIENT_ID)
  logoutUrl.searchParams.append('post_logout_redirect_uri', `${window.location.origin}/logout`)

  // Redirect to logout endpoint
  window.location.href = logoutUrl.toString()
}
