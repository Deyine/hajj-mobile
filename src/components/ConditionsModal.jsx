import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, AlertTriangle, FileCheck } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header with gradient */}
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileCheck className="h-6 w-6" />
              شروط وإلتزامات الحاج
            </CardTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">إغلاق</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto px-6 py-6" onScroll={handleScroll}>
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!loading && conditionsData && (
            <div className="space-y-6" dir="rtl">
              {/* Conditions list */}
              <div className="space-y-4">
                {conditionsData.conditions.map((condition, index) => (
                  <div key={index} className="flex items-start gap-3 text-justify p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-bold text-white bg-primary rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm">
                      {index + 1}
                    </span>
                    <p className="text-gray-800 leading-relaxed pt-0.5">{condition}</p>
                  </div>
                ))}
              </div>

              {/* Warning box */}
              {conditionsData.warning && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-900 mb-1">تنبيه هام</h4>
                      <p className="text-amber-800 text-sm leading-relaxed">{conditionsData.warning}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hajj info - Signature box */}
              {conditionsData.hajj_info && (
                <div className="border-2 border-primary/20 rounded-xl p-5 bg-gradient-to-br from-primary/5 to-transparent">
                  <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">معلومات الحاج</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">الحاج:</span>
                      <span className="font-bold text-gray-900">{conditionsData.hajj_info.full_name_ar}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">رقم الحاج:</span>
                      <span className="font-bold text-gray-900" dir="ltr">{conditionsData.hajj_info.full_reference}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">الرقم الوطني:</span>
                      <span className="font-bold text-gray-900" dir="ltr">{conditionsData.hajj_info.nni}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">التاريخ:</span>
                      <span className="font-bold text-gray-900">{conditionsData.hajj_info.date}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer with scroll indicator */}
        <CardFooter className="flex flex-col gap-3 pt-4 pb-4 bg-gray-50 rounded-b-lg border-t">
          {!hasScrolledToBottom && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
              <p className="text-sm text-blue-700 font-medium">
                ⬇️ يرجى التمرير لأسفل لقراءة جميع الشروط
              </p>
            </div>
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
              <FileCheck className="ml-2 h-4 w-4" />
              {accepting ? 'جارٍ القبول...' : 'أوافق على الشروط'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConditionsModal;
