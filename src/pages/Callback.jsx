import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCodeForTokens, fetchUserInfo } from '../services/oidc'

/**
 * Callback page component
 * Handles the OAuth callback from Khidmaty OIDC provider
 * Exchanges authorization code for tokens and fetches user info
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
          setError('لم يتم استلام رمز التفويض')
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
