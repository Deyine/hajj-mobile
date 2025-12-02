import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiateLogin } from '../services/oidc'
import { isAuthenticated } from '../utils/auth'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import errorLogger from '@/services/errorLogger'

/**
 * Login page component with automatic OIDC redirect
 * Automatically initiates login flow when page loads
 */
function NewLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [errorDetails, setErrorDetails] = useState(null)

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      navigate('/dashboard')
      return
    }

    // Automatically initiate login only once
    if (!isLoggingIn && !error) {
      setIsLoggingIn(true)

      const autoLogin = async () => {
        try {
          // Automatically trigger OIDC login - this will redirect the browser
          await initiateLogin()
        } catch (err) {
          console.error('Login error:', err)

          // Log error to backend with detailed context
          errorLogger.logError(err, {
            context: 'auto_login_on_load',
            page: 'NewLogin',
            action: 'initiateLogin'
          })

          setIsLoggingIn(false)
          setError('خطأ في بدء تسجيل الدخول. يرجى المحاولة مرة أخرى.')

          // Store error details for debugging (only in dev mode)
          if (import.meta.env.DEV) {
            setErrorDetails(err.message || err.toString())
          }
        }
      }

      autoLogin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const handleRetry = async () => {
    setError(null)
    setErrorDetails(null)
    setIsLoggingIn(true)

    try {
      await initiateLogin()
    } catch (err) {
      console.error('Login retry error:', err)

      // Log retry error to backend
      errorLogger.logError(err, {
        context: 'manual_retry',
        page: 'NewLogin',
        action: 'initiateLogin_retry'
      })

      setIsLoggingIn(false)
      setError('خطأ في بدء تسجيل الدخول. يرجى المحاولة مرة أخرى.')

      // Store error details for debugging (only in dev mode)
      if (import.meta.env.DEV) {
        setErrorDetails(err.message || err.toString())
      }
    }
  }

  const handleClose = () => {
    setError(null)
    setErrorDetails(null)
    setIsLoggingIn(false)
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">خطأ في تسجيل الدخول</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {error}
            </p>

            {/* Show error details in development mode */}
            {errorDetails && import.meta.env.DEV && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">تفاصيل الخطأ (وضع التطوير):</p>
                <p className="text-xs font-mono text-red-600 break-all">
                  {errorDetails}
                </p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                إذا استمرت المشكلة، يرجى التحقق من اتصالك بالإنترنت أو الاتصال بالدعم الفني.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={handleRetry}
              className="w-full"
              size="lg"
            >
              المحاولة مرة أخرى
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="w-full"
              size="lg"
            >
              إغلاق
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">تطبيق الحج</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            {/* Loading Spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                جارٍ تسجيل الدخول...
              </p>
              <p className="text-sm text-muted-foreground">
                سيتم توجيهكم إلى منصة خدماتي
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewLogin
