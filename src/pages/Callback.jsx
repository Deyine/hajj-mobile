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

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Collect DEBUG information to display on screen
        const fullUrl = window.location.href
        const allParams = {}
        searchParams.forEach((value, key) => {
          allParams[key] = value
        })

        const debugData = {
          url: fullUrl,
          urlParams: allParams,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          localStorageKeys: Object.keys(localStorage),
          sessionStorageKeys: Object.keys(sessionStorage),
          isWebView: /wv|WebView/i.test(navigator.userAgent)
        }

        setDebugInfo(debugData)
        console.log('=== CALLBACK DEBUG INFO ===', debugData)

        // SCENARIO 1: Token passed directly in URL parameters
        // Check for access_token in URL (e.g., ?access_token=xyz or ?token=xyz)
        const urlAccessToken = searchParams.get('access_token') || searchParams.get('token')

        if (urlAccessToken) {
          console.log('Token found in URL parameters')

          // Store the token in localStorage
          storeAccessToken(urlAccessToken)

          // Fetch user info using this token
          try {
            await fetchUserInfo(urlAccessToken)
            console.log('User info fetched successfully with URL token')
            navigate('/dashboard', { replace: true })
            return
          } catch (error) {
            console.error('Failed to fetch user info with URL token:', error)
            setError('فشل التحقق من صحة الرمز المرسل')
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
                    <strong>URL Parameters:</strong>
                    <pre className="bg-base-300 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(debugInfo.urlParams, null, 2)}
                    </pre>
                  </div>

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
