import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const ConditionsModal = ({ isOpen, onClose, onAccepted }) => {
  const [conditionsData, setConditionsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Fetch conditions when modal opens
  useEffect(() => {
    if (isOpen && !conditionsData) {
      fetchConditions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/v1/mobile/conditions');
      setConditionsData(response.data);
    } catch (err) {
      setError('فشل في تحميل الشروط. يرجى المحاولة مرة أخرى.');
      console.error('Error fetching conditions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError(null);
      const response = await api.post('/api/v1/mobile/accept_conditions');

      if (response.data.success) {
        // Call the callback with updated hajj data
        if (onAccepted) {
          onAccepted(response.data.hajj);
        }
        onClose();
      } else {
        setError(response.data.message || 'فشل في قبول الشروط');
      }
    } catch (err) {
      setError('فشل في قبول الشروط. يرجى المحاولة مرة أخرى.');
      console.error('Error accepting conditions:', err);
    } finally {
      setAccepting(false);
    }
  };

  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">شروط وإلتزامات الحاج</CardTitle>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">إغلاق</span>
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto px-6" onScroll={handleScroll}>
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && conditionsData && (
            <div className="space-y-6" dir="rtl">
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">شروط وإلتزامات الحاج</h2>
              </div>

              {/* Conditions list */}
              <div className="space-y-4">
                {conditionsData.conditions.map((condition, index) => (
                  <div key={index} className="flex items-start gap-3 text-justify">
                    <span className="font-bold text-primary flex-shrink-0">{index + 1}.</span>
                    <p className="text-gray-800 leading-relaxed">{condition}</p>
                  </div>
                ))}
              </div>

              {/* Warning box */}
              {conditionsData.warning && (
                <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                    <p className="text-amber-900 font-semibold">{conditionsData.warning}</p>
                  </div>
                </div>
              )}

              {/* Hajj info */}
              {conditionsData.hajj_info && (
                <div className="border-t-2 border-gray-300 pt-6 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">الحاج:</p>
                        <p className="font-semibold text-gray-900">{conditionsData.hajj_info.full_name_ar}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الرقم الوطني:</p>
                        <p className="font-semibold text-gray-900" dir="ltr">{conditionsData.hajj_info.nni}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">المرجع:</p>
                        <p className="font-semibold text-gray-900">{conditionsData.hajj_info.full_reference}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">التاريخ:</p>
                        <p className="font-semibold text-gray-900">{conditionsData.hajj_info.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          {!hasScrolledToBottom && (
            <p className="text-sm text-muted-foreground text-center">
              يرجى التمرير لأسفل لقراءة جميع الشروط
            </p>
          )}

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={accepting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1"
              disabled={!hasScrolledToBottom || accepting}
            >
              {accepting ? 'جارٍ القبول...' : 'أوافق على الشروط'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConditionsModal;
