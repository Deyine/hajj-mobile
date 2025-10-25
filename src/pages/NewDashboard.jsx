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
import {
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
  const [hajjData, setHajjData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [showConditionsModal, setShowConditionsModal] = useState(false)

  useEffect(() => {
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

  const steps = [
    { number: 1, title: 'التسجيل الأولي', description: 'يرجى إدخال معلومات الاتصال الخاصة بك' },
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
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Photo - Full width at top */}
      <div className="bg-white border-b border-border py-4 px-6">
        <div className="flex items-center gap-4">
          {/* Hajj Photo */}
          <div className="flex-shrink-0">
            {hajjData.photo_url ? (
              <div
                className="h-[80px] rounded-[5px]"
                style={{
                  display: 'flex',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)'
                }}
              >
                <img
                  src={hajjData.photo_url}
                  alt={hajjData.full_name_ar}
                  className="h-full w-auto object-contain"
                  style={{
                    borderRadius: '5px'
                  }}
                />
              </div>
            ) : (
              <div
                className="w-[80px] h-[80px] rounded-[5px] bg-primary/10 flex items-center justify-center"
                style={{ boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)' }}
              >
                <span className="text-3xl text-primary font-bold">
                  {hajjData.full_name_ar?.charAt(0) || '👤'}
                </span>
              </div>
            )}
          </div>
          {/* Greeting */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              مرحباً {hajjData.full_name_ar}
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">رقم الحاج:</span> {hajjData.full_reference}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Progress Indicator - Full width */}
      <MobileProgressIndicator
        currentStep={hajjData.progress.current_step}
        totalSteps={hajjData.progress.total_steps}
        steps={steps}
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
    </div>
  )
}

export default NewDashboard
