import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCodeForTokens, fetchUserInfo } from '../services/oidc'
import { isWebViewAuthenticated } from '../utils/auth'

/**
 * Callback page component
 *
 * Handles OAuth callback from the authorization server.
 * Exchanges authorization code for tokens and redirects to dashboard.
 * If no valid auth data is found, silently redirects to login.
 */
function Callback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if already authenticated via WebView with pre-injected tokens
        if (isWebViewAuthenticated()) {
          console.log('WebView authenticated - redirecting to dashboard')
          navigate('/dashboard', { replace: true })
          return
        }

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
          console.warn('No authorization code found - redirecting to login')
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
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-error text-center">خطأ في المصادقة</h2>
            <p className="text-sm mt-4 text-center">{error}</p>
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
