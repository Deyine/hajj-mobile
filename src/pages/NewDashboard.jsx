import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ContactInfoForm from '@/components/ContactInfoForm'
import PaymentInfoCard from '@/components/PaymentInfoCard'
import ConditionsAcceptanceCard from '@/components/ConditionsAcceptanceCard'
import ConditionsModal from '@/components/ConditionsModal'
import ConditionsViewModal from '@/components/ConditionsViewModal'
import PassportEntryCard from '@/components/PassportEntryCard'
import PassportScanInfoCard from '@/components/PassportScanInfoCard'
import MobileProgressIndicator from '@/components/MobileProgressIndicator'
import CompanionsBottomSheet from '@/components/CompanionsBottomSheet'
import DebugPanel from '@/components/DebugPanel'
import { getUserInfo } from '../utils/auth'
import { getImpersonatedNNI, setImpersonatedNNI, clearImpersonatedNNI, isImpersonating } from '../utils/debug'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plane,
  Hotel,
  Phone,
  IdCard,
  AlertTriangle,
  FileText,
  Download,
  Heart,
  FileCheck,
  Users,
  User,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

/**
 * New Dashboard component with visual progress tracking
 * Shows citizen's Hajj journey with step-by-step progress
 */
function NewDashboard() {
  const navigate = useNavigate()
  const [hajjData, setHajjData] = useState(null)
  const [companions, setCompanions] = useState([])
  const [companionsLoading, setCompanionsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [showConditionsModal, setShowConditionsModal] = useState(false)
  const [showConditionsViewModal, setShowConditionsViewModal] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [showCompanionsSheet, setShowCompanionsSheet] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  // Progressive disclosure state for info sections
  const [expandedSections, setExpandedSections] = useState({
    personal: false,
    flight: false,
    accommodation: false,
    passport: false,
    visa: false,
    medical: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

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
      setCompanionsLoading(true)

      // Fetch dashboard and companions in parallel
      const [dashboardResponse, companionsResponse] = await Promise.all([
        api.get('/api/v1/mobile/dashboard'),
        api.get('/api/v1/mobile/companions').catch(() => ({ data: { companions: [] } }))
      ])

      if (dashboardResponse.data.found === false) {
        setNotFound(true)
      } else {
        setHajjData(dashboardResponse.data)
        setCompanions(companionsResponse.data.companions || [])
      }
    } catch (err) {
      console.error('Error fetching Hajj data:', err)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
      setCompanionsLoading(false)
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

  const handleOpenConditionsViewModal = () => {
    setShowConditionsViewModal(true)
  }

  const handleCloseConditionsViewModal = () => {
    setShowConditionsViewModal(false)
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
        companionsCount={companions.length}
        onCompanionsClick={() => setShowCompanionsSheet(true)}
        companionsLoading={companionsLoading}
        hideProgress={hajjData.status === 'subscribed' || hajjData.status === 'finished'}
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
          <PassportScanInfoCard hajjData={hajjData} onSuccess={handlePassportSubmitted} />
        )}

        </div>
      </div>

      {/* Personal Info - Collapsible */}
      <div className={`bg-white safe-bottom ${hajjData.status !== 'subscribed' && hajjData.status !== 'finished' ? 'border-t border-border' : ''}`}>
        <button
          onClick={() => toggleSection('personal')}
          className={`w-full py-4 px-6 flex items-center justify-between transition-colors ${
            expandedSections.personal ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-50">
              <User className="h-5 w-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              معلوماتي
            </h3>
          </div>
          {expandedSections.personal ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        {expandedSections.personal && (
          <div className="px-6 pb-4 pt-2 space-y-3 animate-in slide-in-from-top-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">رقم الحاج</p>
              <p className="font-semibold text-foreground">{hajjData.full_reference}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">الرقم الوطني</p>
              <p className="font-semibold text-foreground">{hajjData.nni}</p>
            </div>
            {hajjData.phone && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">رقم الهاتف</p>
                <p className="font-semibold text-foreground">{hajjData.phone}</p>
              </div>
            )}
            {hajjData.whatsapp && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">واتساب</p>
                <p className="font-semibold text-foreground">{hajjData.whatsapp}</p>
              </div>
            )}
            {hajjData.close_person_phone && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">رقم شخص مقرب</p>
                <p className="font-semibold text-foreground">{hajjData.close_person_phone}</p>
              </div>
            )}

            {/* View Conditions Button - Show after conditions accepted */}
            {(hajjData.status === 'conditions_generated' || hajjData.status === 'passport_imported' || hajjData.status === 'subscribed' || hajjData.status === 'finished') && (
              <Button
                onClick={handleOpenConditionsViewModal}
                variant="outline"
                className="w-full"
              >
                <FileText className="ml-2 h-4 w-4" />
                مراجعة الشروط
              </Button>
            )}
          </div>
        )}
      </div>

          {/* Flight & Group Info - Collapsible */}
          {(hajjData.flight_info || hajjData.group_info || hajjData.supervisor_info) && (
            <div className="border-t border-border">
              <button
                onClick={() => toggleSection('flight')}
                className={`w-full py-4 px-6 flex items-center justify-between transition-colors ${
                  expandedSections.flight ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Plane className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    معلومات الرحلة والمجموعة
                  </h3>
                </div>
                {expandedSections.flight ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.flight && (
                <div className="px-6 pb-4 pt-2 space-y-3 animate-in slide-in-from-top-2">
                  {hajjData.flight_info && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">رقم الرحلة</p>
                      <p className="font-semibold text-foreground">{hajjData.flight_info.flight_number}</p>
                      {hajjData.flight_info.flight_name && (
                        <p className="text-sm text-muted-foreground mt-1">{hajjData.flight_info.flight_name}</p>
                      )}
                    </div>
                  )}
                  {hajjData.group_info && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">المجموعة</p>
                      <p className="font-semibold text-foreground">{hajjData.group_info.name}</p>
                    </div>
                  )}
                  {hajjData.supervisor_info && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">المشرف</p>
                      <p className="font-semibold text-foreground">{hajjData.supervisor_info.name}</p>
                      {hajjData.supervisor_info.phone && (
                        <p className="text-sm text-muted-foreground mt-1">{hajjData.supervisor_info.phone}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Accommodation Info - Collapsible */}
          {hajjData.accommodation_info && (
            <div className="border-t border-border">
              <button
                onClick={() => toggleSection('accommodation')}
                className={`w-full py-4 px-6 flex items-center justify-between transition-colors ${
                  expandedSections.accommodation ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Hotel className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    معلومات السكن
                  </h3>
                </div>
                {expandedSections.accommodation ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.accommodation && (
                <div className="px-6 pb-4 pt-2 space-y-3 animate-in slide-in-from-top-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">الفندق</p>
                    <p className="font-semibold text-foreground">{hajjData.accommodation_info.hotel.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">الطابق</p>
                      <p className="font-semibold text-foreground">{hajjData.accommodation_info.floor.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">الغرفة</p>
                      <p className="font-semibold text-foreground">{hajjData.accommodation_info.room.number}</p>
                    </div>
                  </div>
                  {hajjData.accommodation_info.suite && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">الجناح</p>
                      <p className="font-semibold text-foreground">{hajjData.accommodation_info.suite.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Passport Info - Collapsible */}
          {hajjData.passeport_number && (
            <div className="border-t border-border">
              <button
                onClick={() => toggleSection('passport')}
                className={`w-full py-4 px-6 flex items-center justify-between transition-colors ${
                  expandedSections.passport ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    معلومات جواز السفر
                  </h3>
                </div>
                {expandedSections.passport ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.passport && (
                <div className="px-6 pb-4 pt-2 space-y-3 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">رقم الجواز</p>
                      <p className="font-semibold font-mono text-foreground">{hajjData.passeport_number}</p>
                    </div>
                    {hajjData.passeport_type && (
                      <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
                        <p className="text-xs text-muted-foreground mb-1">النوع</p>
                        <Badge variant="outline" className="w-fit">{hajjData.passeport_type}</Badge>
                      </div>
                    )}
                  </div>
                  {hajjData.passeport_expiration_date && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">تاريخ انتهاء الصلاحية</p>
                      <p className="font-semibold text-foreground">{new Date(hajjData.passeport_expiration_date).toLocaleDateString('en-GB')}</p>
                    </div>
                  )}
                  {hajjData.has_passeport_photo && hajjData.passeport_photo_url && (
                    <Button
                      onClick={() => window.open(hajjData.passeport_photo_url, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 ml-2" />
                      عرض وثيقة الجواز
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Visa Info - Collapsible */}
          {hajjData.has_visa_attached && (
            <div className="border-t border-border">
              <button
                onClick={() => toggleSection('visa')}
                className={`w-full py-4 px-6 flex items-center justify-between transition-colors ${
                  expandedSections.visa ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <FileCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    تأشيرة الحج
                  </h3>
                </div>
                {expandedSections.visa ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.visa && (
                <div className="px-6 pb-4 pt-2 space-y-3 animate-in slide-in-from-top-2">
                  <div className="bg-green-50 rounded-lg p-3 flex items-center justify-center">
                    <Badge className="bg-green-600">✓ تم إصدار التأشيرة</Badge>
                  </div>
                  {hajjData.visa_url && (
                    <Button
                      onClick={() => window.open(hajjData.visa_url, '_blank')}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تحميل التأشيرة
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Medical Info - Collapsible */}
          {(hajjData.blood_type || hajjData.vaccine_provided !== undefined || hajjData.vaccine2_provided !== undefined) && (
            <div className="border-t border-border">
              <button
                onClick={() => toggleSection('medical')}
                className={`w-full py-4 px-6 flex items-center justify-between transition-colors ${
                  expandedSections.medical ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50">
                    <Heart className="h-5 w-5 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    الملف الطبي
                  </h3>
                </div>
                {expandedSections.medical ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.medical && (
                <div className="px-6 pb-4 pt-2 space-y-3 animate-in slide-in-from-top-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">فصيلة الدم</p>
                    {hajjData.blood_type ? (
                      <Badge className="bg-rose-600 text-white font-bold">{hajjData.blood_type}</Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground">غير محدد</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {hajjData.vaccine_provided !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">اللقاح الأول</p>
                        <Badge className={hajjData.vaccine_provided ? 'bg-green-600' : 'bg-gray-400'}>
                          {hajjData.vaccine_provided ? '✓ مُقدم' : '✗ غير مُقدم'}
                        </Badge>
                      </div>
                    )}
                    {hajjData.vaccine2_provided !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">اللقاح الثاني</p>
                        <Badge className={hajjData.vaccine2_provided ? 'bg-green-600' : 'bg-gray-400'}>
                          {hajjData.vaccine2_provided ? '✓ مُقدم' : '✗ غير مُقدم'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Conditions Modal - For acceptance */}
      <ConditionsModal
        isOpen={showConditionsModal}
        onClose={handleCloseConditionsModal}
        onAccepted={handleConditionsAccepted}
      />

      {/* Conditions View Modal - For viewing after acceptance */}
      <ConditionsViewModal
        isOpen={showConditionsViewModal}
        onClose={handleCloseConditionsViewModal}
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

      {/* Companions Bottom Sheet */}
      <CompanionsBottomSheet
        isOpen={showCompanionsSheet}
        onClose={() => setShowCompanionsSheet(false)}
        onCompanionsChange={(updatedCompanions) => setCompanions(updatedCompanions)}
      />
    </div>
  )
}

export default NewDashboard
