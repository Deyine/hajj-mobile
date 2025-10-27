import { useEffect, useState } from 'react'
import api from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ContactInfoForm from '@/components/ContactInfoForm'
import PaymentInfoCard from '@/components/PaymentInfoCard'
import ConditionsAcceptanceCard from '@/components/ConditionsAcceptanceCard'
import ConditionsModal from '@/components/ConditionsModal'
import PassportEntryCard from '@/components/PassportEntryCard'
import PassportScanInfoCard from '@/components/PassportScanInfoCard'
import MobileProgressIndicator from '@/components/MobileProgressIndicator'
import DebugPanel from '@/components/DebugPanel'
import { getUserInfo } from '../utils/auth'
import { getImpersonatedNNI, setImpersonatedNNI, clearImpersonatedNNI, isImpersonating } from '../utils/debug'
import {
  Plane,
  Hotel,
  Phone,
  IdCard,
  AlertTriangle
} from 'lucide-react'

/**
 * New Dashboard component with visual progress tracking
 * Shows citizen's Hajj journey with step-by-step progress
 */
function NewDashboard() {
  const [hajjData, setHajjData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  useEffect(() => {
    fetchHajjData()
  }, [])

  // Triple-click handler for debug panel
  const handleHeaderClick = () => {
    setClickCount(prev => prev + 1)

    // Reset click count after 1 second
    setTimeout(() => setClickCount(0), 1000)

    // Show debug panel on triple-click
    if (clickCount === 2) {
      setShowDebugPanel(true)
      setClickCount(0)
    }
  }

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

  const handlePaymentMarked = (updatedHajjData) => {
    // Update hajj data after marking as paid
    setHajjData(updatedHajjData)
  }

  const handleCloseConditionsModal = () => {
    setShowConditionsModal(false)
  }

  const handleImpersonate = (targetNNI) => {
    if (targetNNI) {
      setImpersonatedNNI(targetNNI)
    } else {
      clearImpersonatedNNI()
    }
    // Reload data with new NNI
    fetchHajjData()
  }

  const handleCloseDebugPanel = () => {
    setShowDebugPanel(false)
  }

  const steps = [
    { number: 1, title: 'معلومات الاتصال', description: 'يرجى إدخال معلومات الاتصال الخاصة بك' },
    { number: 2, title: 'الدفع', description: 'تم دفع رسوم الحج' },
    { number: 3, title: 'قبول الشروط', description: 'الموافقة على شروط وإلتزامات الحاج' },
    { number: 4, title: 'تسجيل الجواز', description: 'تسجيل جواز السفر' },
    { number: 5, title: 'إحضار جواز السفر', description: 'التوجه إلى المديرية لإحضار الجواز' },
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
            <button
              className="mt-4 text-primary font-semibold hover:underline cursor-pointer"
              onClick={fetchHajjData}
            >
              إعادة المحاولة
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main dashboard
  const userInfo = getUserInfo()
  const currentNNI = userInfo?.nni || ''
  const impersonatedNNI = getImpersonatedNNI()

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Impersonation Banner */}
      {isImpersonating() && (
        <div className="bg-destructive text-destructive-foreground py-2 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">
              وضع التصحيح: تعرض بيانات المواطن {impersonatedNNI}
            </span>
          </div>
          <button
            onClick={() => setShowDebugPanel(true)}
            className="text-xs underline hover:no-underline"
          >
            إعدادات التصحيح
          </button>
        </div>
      )}

      {/* Unified Header with Progress Indicator */}
      <MobileProgressIndicator
        currentStep={hajjData.progress.current_step}
        totalSteps={hajjData.progress.total_steps}
        steps={steps}
        hajjData={hajjData}
        onHeaderClick={handleHeaderClick}
      />

      <div className="p-4">
        <div className="container mx-auto max-w-4xl">

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

        {/* Contact Info Form - Show for init status */}
        {hajjData.status === 'init' && (
          <div className="mb-6">
            <ContactInfoForm
              initialData={hajjData}
              onSuccess={handleContactInfoSuccess}
            />
          </div>
        )}

        {/* Payment Information Section - Show only when status is bill_generated */}
        {hajjData.status === 'bill_generated' && (
          <PaymentInfoCard hajjData={hajjData} onPaymentMarked={handlePaymentMarked} />
        )}

        {/* Conditions Acceptance Card - Show when status is bill_paid */}
        {hajjData.status === 'bill_paid' && (
          <ConditionsAcceptanceCard onAcceptClick={handleOpenConditionsModal} />
        )}

        {/* Passport Entry Card - Show when status is conditions_generated */}
        {hajjData.status === 'conditions_generated' && (
          <PassportEntryCard onSuccess={handlePassportSubmitted} />
        )}

        {/* Passport Scan Info Card - Show when status is passport_imported */}
        {hajjData.status === 'passport_imported' && (
          <PassportScanInfoCard onSuccess={handlePassportSubmitted} />
        )}

        {/* Flight Planning Notification - Show when status is subscribed or finished */}
        {(hajjData.status === 'subscribed' || hajjData.status === 'finished') && (
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
        )}

        </div>
      </div>

      {/* Personal Info - Full width footer */}
      <div className="bg-white border-t border-border mt-6">
        <div className="py-6 px-6">
          <h3 className="text-lg font-bold text-foreground mb-4">معلوماتي</h3>
          <div className="grid gap-4">
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
          </div>
        </div>

        {/* Accommodation Info */}
        {hajjData.accommodation_info && (
          <div className="border-t border-border py-6 px-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              معلومات السكن
            </h3>
            <div className="space-y-3">
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
            </div>
          </div>
        )}
      </div>

      {/* Conditions Modal */}
      <ConditionsModal
        isOpen={showConditionsModal}
        onClose={handleCloseConditionsModal}
        onAccepted={handleConditionsAccepted}
      />

      {/* Debug Panel - Admin Impersonation */}
      {showDebugPanel && (
        <DebugPanel
          onClose={handleCloseDebugPanel}
          onImpersonate={handleImpersonate}
          currentNNI={currentNNI}
          impersonatedNNI={impersonatedNNI}
        />
      )}
    </div>
  )
}

export default NewDashboard
