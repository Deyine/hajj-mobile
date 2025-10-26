import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiateLogin } from '../services/oidc'
import { isAuthenticated } from '../utils/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AlertDialog from '@/components/AlertDialog'

/**
 * Login page component with shadcn/ui
 * Displays login button and handles OIDC authentication flow initiation
 */
function NewLogin() {
  const navigate = useNavigate()
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' })

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
            <CardDescription className="text-base">
              مرحباً بك في تطبيق الحج
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              يرجى تسجيل الدخول عبر منصة خدماتي للوصول إلى خدمات الحج
            </p>
            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full"
            >
              تسجيل الدخول عبر خدماتي
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </>
  )
}

export default NewLogin
