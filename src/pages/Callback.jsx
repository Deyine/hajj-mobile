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

        // Check cookies
        const cookies = document.cookie

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
          cookies: cookies || 'None',
          globalVars: globalVars,
          hasAndroidInterface: hasAndroidInterface,
          hasIOSInterface: hasIOSInterface,
          isWebView: /wv|WebView/i.test(navigator.userAgent)
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

        // No code found - silently redirect to login
        if (!code) {
          console.warn('No authorization code, token, or authentication data found - redirecting to login')
          navigate('/login', { replace: true })
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
        // On any error, silently redirect to login instead of showing error screen
        navigate('/login', { replace: true })
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
