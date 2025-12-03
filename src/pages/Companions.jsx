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
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchCompanions();
  }, []);

  const fetchCompanions = async () => {
    setLoading(true);

    try {
      const response = await api.get('/api/v1/mobile/companions');
      setCompanions(response.data.companions || []);
    } catch (error) {
      console.error('Error fetching companions:', error);
      errorLogger.logError(error, {
        context: 'fetch_companions',
        page: 'Companions'
      });

      setAlert({
        isOpen: true,
        title: 'خطأ',
        message: 'حدث خطأ أثناء جلب قائمة الرفقاء',
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">رفقاء الحج</h1>
                <p className="text-sm text-white/90">إدارة رفقاء السفر</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
