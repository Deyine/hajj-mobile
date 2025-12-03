import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompanionSearch from '@/components/CompanionSearch';
import CompanionList from '@/components/CompanionList';
import AlertDialog from '@/components/AlertDialog';
import api from '../services/api';
import errorLogger from '../services/errorLogger';

/**
 * Companions Page
 * Separate page for managing hajj companions
 */
export default function Companions() {
  const navigate = useNavigate();
  const [hajjData, setHajjData] = useState(null);
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch both hajj data and companions in parallel
      const [hajjResponse, companionsResponse] = await Promise.all([
        api.get('/api/v1/mobile/dashboard'),
        api.get('/api/v1/mobile/companions')
      ]);

      setHajjData(hajjResponse.data);
      setCompanions(companionsResponse.data.companions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      errorLogger.logError(error, {
        context: 'fetch_data',
        page: 'Companions'
      });

      setAlert({
        isOpen: true,
        title: 'خطأ',
        message: 'حدث خطأ أثناء جلب البيانات',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanionAdded = (newCompanion) => {
    // Add the new companion to the list
    setCompanions(prev => [...prev, newCompanion]);

    // Show success message
    setAlert({
      isOpen: true,
      title: 'نجح',
      message: 'تمت إضافة الرفيق بنجاح',
      type: 'success'
    });
  };

  const handleCompanionRemoved = async (companionId, onComplete) => {
    try {
      const response = await api.delete(`/api/v1/mobile/companions/${companionId}`);

      if (response.data.success) {
        // Remove from list
        setCompanions(prev => prev.filter(c => c.id !== companionId));

        // Show success message
        setAlert({
          isOpen: true,
          title: 'نجح',
          message: 'تم إزالة الرفيق بنجاح',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error removing companion:', error);
      errorLogger.logError(error, {
        context: 'remove_companion',
        companion_id: companionId,
        page: 'Companions'
      });

      const errorMessage = error.response?.data?.error || 'حدث خطأ أثناء إزالة الرفيق';
      setAlert({
        isOpen: true,
        title: 'خطأ',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header - Same as Dashboard */}
      {hajjData && (
        <div className="mb-6">
          <div
            className="rounded-[20px] bg-white overflow-hidden"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              className="py-6 px-6 relative overflow-hidden"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              {/* Vector Art Background */}
              <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                viewBox="0 0 400 120"
              >
                <defs>
                  <pattern id="crystalPattern" x="0" y="0" width="120" height="100" patternUnits="userSpaceOnUse">
                    <polygon
                      points="40,30 60,20 80,30 60,40"
                      fill="#2C5F2D"
                      opacity="0.3"
                    />
                    <polygon
                      points="95,70 105,65 110,80 100,85"
                      fill="#97CC04"
                      opacity="0.5"
                    />
                    <polygon
                      points="15,15 25,10 30,20 20,25"
                      fill="#2C5F2D"
                      opacity="0.4"
                    />
                  </pattern>
                </defs>
                <rect width="400" height="120" fill="url(#crystalPattern)" opacity="0.06" />
                <path
                  d="M0,80 Q50,70 100,80 T200,80 T300,80 T400,80 L400,120 L0,120 Z"
                  fill="#2C5F2D"
                  opacity="0.08"
                />
                <path
                  d="M0,90 Q50,82 100,90 T200,90 T300,90 T400,90 L400,120 L0,120 Z"
                  fill="#4A9B4D"
                  opacity="0.08"
                />
                <path
                  d="M0,120 L0,110 Q50,118 100,110 T200,110 T300,110 T400,110 L400,120 Z"
                  fill="#2C5F2D"
                  opacity="0.08"
                />
                <path
                  d="M0,120 L0,102 Q50,110 100,102 T200,102 T300,102 T400,102 L400,120 Z"
                  fill="#6BBF73"
                  opacity="0.08"
                />
              </svg>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/85 via-emerald-50/75 to-green-50/60" />

              {/* Content wrapper */}
              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  {/* Hajj Photo */}
                  <div className="flex-shrink-0">
                    {hajjData?.photo_url ? (
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
                          {hajjData?.full_name_ar?.charAt(0) || '👤'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-5 w-5 text-primary" />
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                        رفقاء الحج
                      </p>
                    </div>
                    <h2 className="text-lg font-bold mb-0.5" style={{ color: '#1F2937', letterSpacing: '-0.01em' }}>
                      {hajjData?.full_name_ar}
                    </h2>
                    <p className="text-xs font-medium" style={{ color: '#6B7280' }}>
                      <span className="font-semibold">رقم الحاج:</span> {hajjData?.full_reference}
                    </p>
                  </div>

                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/dashboard');
                    }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">جارٍ التحميل...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Companion List */}
            <CompanionList
              companions={companions}
              onCompanionRemoved={handleCompanionRemoved}
            />

            {/* Search Component (disabled if limit reached) */}
            {companions.length >= 5 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-center">
                  <strong>وصلت للحد الأقصى:</strong> يمكنك إضافة 5 رفقاء كحد أقصى
                </p>
              </div>
            ) : (
              <CompanionSearch onCompanionAdded={handleCompanionAdded} />
            )}
          </>
        )}
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
