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

  useEffect(() => {
    const handleCallback = async () => {
      try {
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
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-error">خطأ في المصادقة</h2>
            <p className="text-sm mt-4">{error}</p>
            <div className="card-actions mt-6">
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
