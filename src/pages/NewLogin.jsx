import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiateLogin } from '../services/oidc'
import { isAuthenticated } from '../utils/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AlertDialog from '@/components/AlertDialog'

/**
 * Login page component with automatic OIDC redirect
 * Automatically initiates login flow when page loads
 */
function NewLogin() {
  const navigate = useNavigate()
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      navigate('/dashboard')
      return
    }

    // Automatically initiate login only once
    if (!isLoggingIn) {
      setIsLoggingIn(true)

      const autoLogin = async () => {
        try {
          // Automatically trigger OIDC login - this will redirect the browser
          await initiateLogin()
        } catch (error) {
          console.error('Login error:', error)
          setIsLoggingIn(false)
          setAlertDialog({
            isOpen: true,
            title: 'خطأ',
            message: 'خطأ في بدء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
            type: 'error'
          })
        }
      }

      autoLogin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const handleRetry = async () => {
    setAlertDialog({ ...alertDialog, isOpen: false })
    setIsLoggingIn(true)

    try {
      await initiateLogin()
    } catch (error) {
      console.error('Login retry error:', error)
      setIsLoggingIn(false)
      setAlertDialog({
        isOpen: true,
        title: 'خطأ',
        message: 'خطأ في بدء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
        type: 'error'
      })
    }
  }

  return (
    <>
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

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={handleRetry}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </>
  )
}

export default NewLogin
