import { useEffect, useState } from 'react'
import { getUserInfo } from '../utils/auth'
import { logout } from '../services/oidc'
import api from '../services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ContactInfoForm from '@/components/ContactInfoForm'
import PaymentInfoCard from '@/components/PaymentInfoCard'
import ConditionsAcceptanceCard from '@/components/ConditionsAcceptanceCard'
import ConditionsModal from '@/components/ConditionsModal'
import PassportEntryCard from '@/components/PassportEntryCard'
import PassportScanInfoCard from '@/components/PassportScanInfoCard'
import MobileProgressIndicator from '@/components/MobileProgressIndicator'
import {
  LogOut,
  Plane,
  Hotel,
  Phone,
  IdCard
} from 'lucide-react'

/**
 * New Dashboard component with visual progress tracking
 * Shows citizen's Hajj journey with step-by-step progress
 */
function NewDashboard() {
  const [userInfo, setUserInfo] = useState(null)
  const [hajjData, setHajjData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [showConditionsModal, setShowConditionsModal] = useState(false)

  useEffect(() => {
    // Load user info from storage
    const user = getUserInfo()
    setUserInfo(user)
    fetchHajjData()
  }, [])

  const handleOpenConditionsModal = () => {
    setShowConditionsModal(true)
  }

  const fetchHajjData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/mobile/dashboard')

      if (response.data.found === false) {
        setNotFound(true)
      } else {
        setHajjData(response.data)
      }
    } catch (err) {
      console.error('Error fetching Hajj data:', err)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleContactInfoSuccess = (updatedHajjData) => {
    // Update hajj data after successful contact info submission
    setHajjData(updatedHajjData)
  }

  const handleConditionsAccepted = (updatedHajjData) => {
    // Update hajj data after conditions acceptance
    setHajjData(updatedHajjData)
    setShowConditionsModal(false)
  }

  const handlePassportSubmitted = (updatedHajjData) => {
    // Update hajj data after successful passport submission
    setHajjData(updatedHajjData)
  }

  const handleCloseConditionsModal = () => {
    setShowConditionsModal(false)
  }

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout()
    }
  }

  const steps = [
    { number: 1, title: 'التسجيل الأولي', description: 'تم تسجيل بياناتك' },
    { number: 2, title: 'الدفع', description: 'تم دفع رسوم الحج' },
    { number: 3, title: 'قبول الشروط', description: 'الموافقة على شروط وإلتزامات الحاج' },
    { number: 4, title: 'تسجيل الجواز', description: 'تسجيل جواز السفر' },
    { number: 5, title: 'تم التسجيل', description: 'اكتمل التسجيل' },
    { number: 6, title: 'التفويج', description: 'تم تحديد المجموعة والرحلة' }
  ]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Not found state (not a Hajj)
  if (notFound) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>تطبيق الحج</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </CardHeader>
          </Card>

          {/* Not Found Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">مرحباً بك</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">🤲</div>
                <h2 className="text-2xl font-bold mb-4">لم يتم العثور على تسجيل للحج</h2>
                <p className="text-muted-foreground text-lg">
                  نتمنى لكم التوفيق في السنة القادمة إن شاء الله
                </p>
                <p className="text-muted-foreground mt-4">
                  تقبل الله دعاءكم ويسر لكم حج بيته الحرام قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={fetchHajjData}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>تطبيق الحج</CardTitle>
              <CardDescription>مرحباً {hajjData.full_name_ar}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </CardHeader>
        </Card>

        {/* Cancelled/Replaced Alerts */}
        {hajjData.cancelled && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-semibold text-center">تم إلغاء التسجيل</p>
            </CardContent>
          </Card>
        )}

        {hajjData.replaced && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-semibold text-center">تم التنازل</p>
            </CardContent>
          </Card>
        )}

        {/* Mobile Progress Indicator - ALWAYS AT TOP, before any action blocks */}
        <MobileProgressIndicator
          currentStep={hajjData.progress.current_step}
          totalSteps={hajjData.progress.total_steps}
          steps={steps}
        />

        {/* Contact Info Form - Show for init status if not complete */}
        {hajjData.status === 'init' && !hajjData.contact_info_complete && (
          <div className="mb-6">
            <ContactInfoForm
              initialData={hajjData}
              onSuccess={handleContactInfoSuccess}
            />
          </div>
        )}

        {/* Payment Information Section - Show when status is bill_generated OR (init with contact complete) */}
        {(hajjData.status === 'bill_generated' || (hajjData.status === 'init' && hajjData.contact_info_complete)) && (
          <PaymentInfoCard hajjData={hajjData} />
        )}

        {/* Conditions Acceptance Card - Show when status is bill_paid and conditions not accepted */}
        {hajjData.status === 'bill_paid' && !hajjData.conditions_accepted && (
          <ConditionsAcceptanceCard onAcceptClick={handleOpenConditionsModal} />
        )}

        {/* Passport Entry Card - Show when status is conditions_generated and passport not imported */}
        {hajjData.status === 'conditions_generated' && !hajjData.passeport_number && (
          <PassportEntryCard onSuccess={handlePassportSubmitted} />
        )}

        {/* Passport Scan Info Card - Show when status is passport_imported */}
        {hajjData.status === 'passport_imported' && (
          <PassportScanInfoCard onSuccess={handlePassportSubmitted} />
        )}

        {/* Flight Planning Notification */}
        <div className="w-full mb-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              التفويج
            </h3>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-900 font-medium mb-2">
              التفويج قيد التحضير
            </p>
            <p className="text-sm text-blue-800">
              سيتم إعلامكم فور برمجة التفويج
            </p>
          </div>
        </div>

        {/* Personal Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>معلوماتي</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3">
              <IdCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">رقم الحاج</p>
                <p className="font-semibold">{hajjData.full_reference}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IdCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">الرقم الوطني</p>
                <p className="font-semibold">{hajjData.nni}</p>
              </div>
            </div>
            {hajjData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                  <p className="font-semibold">{hajjData.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accommodation Info */}
        {hajjData.accommodation_info && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                معلومات السكن
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">الفندق</p>
                <p className="font-semibold">{hajjData.accommodation_info.hotel.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الطابق</p>
                  <p className="font-semibold">{hajjData.accommodation_info.floor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الغرفة</p>
                  <p className="font-semibold">{hajjData.accommodation_info.room.number}</p>
                </div>
              </div>
              {hajjData.accommodation_info.suite && (
                <div>
                  <p className="text-sm text-muted-foreground">الجناح</p>
                  <p className="font-semibold">{hajjData.accommodation_info.suite.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Conditions Modal */}
      <ConditionsModal
        isOpen={showConditionsModal}
        onClose={handleCloseConditionsModal}
        onAccepted={handleConditionsAccepted}
      />
    </div>
  )
}

export default NewDashboard
