import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCodeForTokens, fetchUserInfo } from '../services/oidc'
import { isWebViewAuthenticated, getAccessToken, getUserInfo, storeAccessToken } from '../utils/auth'

/**
 * Callback page component
 *
 * Handles two authentication scenarios:
 * 1. WebView mode (Khidmaty native app): Uses pre-injected tokens from localStorage
 * 2. Standalone web mode: Handles OAuth callback and exchanges authorization code for tokens
 *
 * When embedded in Khidmaty native app, the app pre-injects access_token and user_info
 * into localStorage before loading the webview, so no OAuth flow is needed.
 */
function Callback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [receivedMessages, setReceivedMessages] = useState([])

  useEffect(() => {
    // Listen for postMessage events from native app
    const messageHandler = (event) => {
      console.log('Received postMessage:', event)
      setReceivedMessages(prev => [...prev, {
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toISOString()
      }])
    }
    window.addEventListener('message', messageHandler)

    const handleCallback = async () => {
      try {
        // Collect DEBUG information to display on screen
        const fullUrl = window.location.href
        const allParams = {}
        searchParams.forEach((value, key) => {
          allParams[key] = value
        })

        // Check URL hash/fragment
        const urlHash = window.location.hash
        const hashParams = {}
        if (urlHash) {
          const hashString = urlHash.substring(1) // Remove #
          const pairs = hashString.split('&')
          pairs.forEach(pair => {
            const [key, value] = pair.split('=')
            if (key) hashParams[key] = decodeURIComponent(value || '')
          })
        }

        // Check for global JavaScript variables that might be injected by native app
        const globalVars = {
          khidmatyToken: window.khidmatyToken,
          accessToken: window.accessToken,
          token: window.token,
          userInfo: window.userInfo,
          khidmatyUser: window.khidmatyUser
        }

        // Check cookies - parse them into an object
        const cookies = document.cookie
        const parsedCookies = {}
        if (cookies) {
          cookies.split(';').forEach(cookie => {
            const parts = cookie.trim().split('=')
            const name = parts[0]
            const value = parts.slice(1).join('=') // Handle values with = in them
            if (name) {
              parsedCookies[name] = value
            }
          })
        }

        // Check for Android/iOS JavaScript interfaces
        const hasAndroidInterface = !!window.Android
        const hasIOSInterface = !!window.webkit?.messageHandlers

        const debugData = {
          url: fullUrl,
          urlParams: allParams,
          urlHash: urlHash || 'None',
          hashParams: hashParams,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          localStorageKeys: Object.keys(localStorage),
          sessionStorageKeys: Object.keys(sessionStorage),
          cookiesRaw: cookies || 'None',
          cookiesParsed: parsedCookies,
          cookieCount: Object.keys(parsedCookies).length,
          globalVars: globalVars,
          hasAndroidInterface: hasAndroidInterface,
          hasIOSInterface: hasIOSInterface,
          isWebView: /wv|WebView/i.test(navigator.userAgent)
        }

        // Fetch HTTP headers from backend
        let backendHeaders = null
        try {
          const headersResponse = await fetch('/api/v1/mobile/debug_headers')
          if (headersResponse.ok) {
            backendHeaders = await headersResponse.json()
            console.log('=== BACKEND HEADERS ===', backendHeaders)
          }
        } catch (error) {
          console.error('Failed to fetch backend headers:', error)
        }

        debugData.backendHeaders = backendHeaders

        // Check if backend sent debug info (Base64 encoded)
        const debugParam = searchParams.get('debug')
        if (debugParam) {
          try {
            // Decode URL-safe Base64 (replace - and _ back to + and /)
            const base64 = debugParam.replace(/-/g, '+').replace(/_/g, '/')
            const decoded = atob(base64)
            const backendDebugInfo = JSON.parse(decoded)
            console.log('=== BACKEND DEBUG INFO ===', backendDebugInfo)
            debugData.backendDebugInfo = backendDebugInfo
          } catch (error) {
            console.error('Failed to decode debug parameter:', error)
          }
        }

        setDebugInfo(debugData)
        console.log('=== CALLBACK DEBUG INFO ===', debugData)

        // SCENARIO 1: Token passed directly in URL parameters or hash
        // Check for access_token in URL query params
        let foundToken = searchParams.get('access_token') || searchParams.get('token')
        let tokenSource = foundToken ? 'URL query parameter' : null

        // Check in URL hash/fragment
        if (!foundToken && (hashParams.access_token || hashParams.token)) {
          foundToken = hashParams.access_token || hashParams.token
          tokenSource = 'URL hash/fragment'
        }

        // Check in global JavaScript variables
        if (!foundToken && (globalVars.accessToken || globalVars.token || globalVars.khidmatyToken)) {
          foundToken = globalVars.accessToken || globalVars.token || globalVars.khidmatyToken
          tokenSource = 'Global JavaScript variable'
        }

        if (foundToken) {
          console.log(`Token found in: ${tokenSource}`)
          console.log('Token (first 20 chars):', foundToken.substring(0, 20) + '...')

          // Store the token in localStorage
          storeAccessToken(foundToken)

          // Fetch user info using this token
          try {
            await fetchUserInfo(foundToken)
            console.log('User info fetched successfully')
            navigate('/dashboard', { replace: true })
            return
          } catch (error) {
            console.error('Failed to fetch user info:', error)
            setError(`فشل التحقق من صحة الرمز المرسل\n\nالمصدر: ${tokenSource}\nالخطأ: ${error.message}`)
            return
          }
        }

        // SCENARIO 2: WebView with pre-injected tokens (Khidmaty native app)
        // The native app has already set access_token and user_info in localStorage
        if (isWebViewAuthenticated()) {
          console.log('WebView authenticated - using pre-injected tokens from native app')
          const accessToken = getAccessToken()
          const userInfo = getUserInfo()

          console.log('Access token exists:', !!accessToken)
          console.log('User info exists:', !!userInfo)

          // Tokens are already in localStorage, just redirect to dashboard
          navigate('/dashboard', { replace: true })
          return
        }

        // SCENARIO 3: Standard OAuth redirect flow (standalone web app)
        // Extract authorization code from URL
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Check for errors from the authorization server
        if (errorParam) {
          setError(errorDescription || errorParam)
          console.error('Authorization error:', errorParam, errorDescription)
          return
        }

        // Ensure we have a code
        if (!code) {
          // If we're in a webview with no code and no token, show integration instructions
          if (debugData.isWebView) {
            setError('خطأ في التكامل مع تطبيق خدماتي\n\nيجب على تطبيق خدماتي إرسال رمز الوصول (access token) بإحدى الطرق التالية:\n\n1. عبر URL: ?access_token=xxx\n2. في localStorage\n3. عبر OAuth code parameter')
          } else {
            setError('لم يتم استلام رمز التفويض')
          }
          console.error('No authorization code received')
          return
        }

        // Exchange code for tokens
        const tokenData = await exchangeCodeForTokens(code)

        // Fetch user information
        await fetchUserInfo(tokenData.access_token)

        // Redirect to dashboard on success
        navigate('/dashboard', { replace: true })
      } catch (error) {
        console.error('Callback error:', error)
        setError(error.message || 'حدث خطأ أثناء المصادقة')
      }
    }

    handleCallback()

    // Cleanup event listener
    return () => {
      window.removeEventListener('message', messageHandler)
    }
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-error text-center">خطأ في المصادقة</h2>
            <p className="text-sm mt-4 text-center">{error}</p>

            {/* Debug Information Display */}
            {debugInfo && (
              <div className="mt-6 p-4 bg-base-200 rounded-lg text-left">
                <h3 className="font-bold mb-2 text-sm">معلومات التشخيص (Debug Info)</h3>

                {/* COOKIES - HIGHLIGHTED AT THE TOP */}
                <div className="mb-4 p-4 bg-green-100 rounded-lg border-2 border-green-500">
                  <strong className="text-green-900 text-base">🍪 COOKIES (JavaScript)</strong>
                  <div className="text-xs mt-2 text-green-900">
                    <div className="mb-2">
                      <strong>Cookie Count:</strong> {debugInfo.cookieCount} cookies found
                    </div>
                    {debugInfo.cookieCount > 0 ? (
                      <div>
                        <strong>Parsed Cookies:</strong>
                        <pre className="bg-white p-3 rounded mt-1 overflow-x-auto text-black">
                          {JSON.stringify(debugInfo.cookiesParsed, null, 2)}
                        </pre>
                        <div className="mt-2">
                          <strong>Raw Cookie String:</strong>
                          <pre className="bg-white p-3 rounded mt-1 overflow-x-auto text-black break-all">
                            {debugInfo.cookiesRaw}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-700 font-bold mt-2">
                        ❌ NO COOKIES FOUND IN JAVASCRIPT!
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs space-y-2 font-mono overflow-auto max-h-96" dir="ltr">
                  <div>
                    <strong>URL:</strong>
                    <div className="break-all">{debugInfo.url}</div>
                  </div>

                  <div>
                    <strong>URL Query Parameters:</strong>
                    <pre className="bg-base-300 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(debugInfo.urlParams, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <strong>URL Hash/Fragment:</strong> {debugInfo.urlHash}
                  </div>

                  {debugInfo.urlHash !== 'None' && (
                    <div>
                      <strong>Hash Parameters:</strong>
                      <pre className="bg-base-300 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(debugInfo.hashParams, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <strong>Is WebView:</strong> {debugInfo.isWebView ? 'YES' : 'NO'}
                  </div>

                  <div>
                    <strong>User Agent:</strong>
                    <div className="break-all">{debugInfo.userAgent}</div>
                  </div>

                  <div>
                    <strong>Referrer:</strong> {debugInfo.referrer || 'None'}
                  </div>

                  <div>
                    <strong>localStorage Keys:</strong> {debugInfo.localStorageKeys.join(', ') || 'Empty'}
                  </div>

                  <div>
                    <strong>sessionStorage Keys:</strong> {debugInfo.sessionStorageKeys.join(', ') || 'Empty'}
                  </div>

                  <div>
                    <strong>Global Variables:</strong>
                    <pre className="bg-base-300 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(
                        Object.entries(debugInfo.globalVars)
                          .filter(([, value]) => value !== undefined)
                          .reduce((obj, [key, value]) => {
                            obj[key] = typeof value === 'string' && value.length > 50
                              ? value.substring(0, 50) + '...'
                              : value
                            return obj
                          }, {}),
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  <div>
                    <strong>Android Interface:</strong> {debugInfo.hasAndroidInterface ? 'YES' : 'NO'}
                  </div>

                  <div>
                    <strong>iOS Interface:</strong> {debugInfo.hasIOSInterface ? 'YES' : 'NO'}
                  </div>

                  {receivedMessages.length > 0 && (
                    <div>
                      <strong>PostMessage Events:</strong>
                      <pre className="bg-base-300 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(receivedMessages, null, 2)}
                      </pre>
                    </div>
                  )}

                  {debugInfo.backendHeaders && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded border-2 border-yellow-500">
                      <strong className="text-yellow-900">🔍 HTTP HEADERS (From Backend):</strong>
                      <div className="text-xs mt-2">
                        <div><strong>Method:</strong> {debugInfo.backendHeaders.request_method}</div>
                        <div><strong>Path:</strong> {debugInfo.backendHeaders.request_path}</div>
                        <div><strong>Remote IP:</strong> {debugInfo.backendHeaders.remote_ip}</div>
                        <div className="mt-2">
                          <strong>All Headers:</strong>
                          <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(debugInfo.backendHeaders.headers, null, 2)}
                          </pre>
                        </div>
                        {Object.keys(debugInfo.backendHeaders.cookies || {}).length > 0 && (
                          <div className="mt-2">
                            <strong>Cookies (Backend):</strong>
                            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(debugInfo.backendHeaders.cookies, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {debugInfo.backendDebugInfo && (
                    <div className="mt-4 p-3 bg-red-100 rounded border-2 border-red-500">
                      <strong className="text-red-900">🔴 BACKEND /CB CALLBACK DATA:</strong>
                      <div className="text-xs mt-2 text-red-900">
                        <div><strong>⏰ Time:</strong> {debugInfo.backendDebugInfo.timestamp}</div>
                        <div><strong>📍 Full URL:</strong> {debugInfo.backendDebugInfo.full_url}</div>
                        <div><strong>🔗 Query String:</strong> {debugInfo.backendDebugInfo.query_string || 'Empty'}</div>

                        <div className="mt-2">
                          <strong>🔑 Query Params:</strong>
                          <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-black">
                            {JSON.stringify(debugInfo.backendDebugInfo.query_params, null, 2)}
                          </pre>
                        </div>

                        <div className="mt-2">
                          <strong>📨 Headers (Backend Received):</strong>
                          <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-black max-h-48 overflow-y-auto">
                            {JSON.stringify(debugInfo.backendDebugInfo.headers, null, 2)}
                          </pre>
                        </div>

                        {Object.keys(debugInfo.backendDebugInfo.cookies || {}).length > 0 && (
                          <div className="mt-2">
                            <strong>🍪 Cookies (Backend Received):</strong>
                            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-black">
                              {JSON.stringify(debugInfo.backendDebugInfo.cookies, null, 2)}
                            </pre>
                          </div>
                        )}

                        {debugInfo.backendDebugInfo.body && (
                          <div className="mt-2">
                            <strong>📦 Request Body:</strong>
                            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-black">
                              {debugInfo.backendDebugInfo.body}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="card-actions mt-6 justify-center">
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="btn btn-primary"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4">جاري المصادقة...</p>
        </div>
      </div>
    </div>
  )
}

export default Callback
