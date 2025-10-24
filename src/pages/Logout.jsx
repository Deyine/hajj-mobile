import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthData } from '../utils/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

/**
 * Logout page component
 * Handles the post-logout redirect from Khidmaty OIDC provider
 * Clears any remaining authentication data and shows logout confirmation
 */
function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    // Clear any remaining auth data (in case OIDC didn't clear everything)
    clearAuthData()
  }, [])

  const handleBackToLogin = () => {
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">تم تسجيل الخروج</CardTitle>
          <CardDescription className="text-base">
            تم تسجيل خروجك بنجاح من نظام الحج
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            شكراً لاستخدامكم نظام الحج الإلكتروني
          </p>
          <Button onClick={handleBackToLogin} className="w-full">
            العودة لتسجيل الدخول
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Logout
