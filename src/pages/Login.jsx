import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiateLogin } from '../services/oidc'
import { isAuthenticated } from '../utils/auth'

/**
 * Login page component
 * Displays login button and handles OIDC authentication flow initiation
 */
function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleLogin = async () => {
    try {
      await initiateLogin()
    } catch (error) {
      console.error('Login error:', error)
      alert('خطأ في بدء تسجيل الدخول. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl mb-4">تطبيق الحج</h2>
          <p className="mb-6">مرحباً بك في تطبيق الحج</p>
          <p className="text-sm mb-6 text-base-content/70">
            يرجى تسجيل الدخول عبر منصة خدماتي للوصول إلى خدمات الحج
          </p>
          <div className="card-actions">
            <button
              onClick={handleLogin}
              className="btn btn-primary btn-wide"
            >
              تسجيل الدخول عبر خدماتي
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
