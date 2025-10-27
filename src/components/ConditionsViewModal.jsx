import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, AlertTriangle, FileCheck } from 'lucide-react';
import api from '../services/api';

/**
 * ConditionsViewModal Component
 * Lighter version for viewing conditions after acceptance
 * Read-only modal without acceptance functionality
 */
const ConditionsViewModal = ({ isOpen, onClose }) => {
  const [conditionsData, setConditionsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-0">
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

        <CardContent className="flex-1 overflow-y-auto px-6 py-6">
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
                <div className="bg-white rounded-xl p-6 shadow-sm text-right">
                  <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b-2 border-primary/20 text-right">معلومات الحاج</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1 text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block">الحاج</span>
                      <p className="font-bold text-gray-900 text-lg">{conditionsData.hajj_info.full_name_ar}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-right">
                        <span className="text-xs text-gray-500 uppercase tracking-wide block">رقم الحاج</span>
                        <p className="font-semibold text-gray-900 text-right">{conditionsData.hajj_info.full_reference}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-xs text-gray-500 uppercase tracking-wide block">الرقم الوطني</span>
                        <p className="font-semibold text-gray-900 text-right">{conditionsData.hajj_info.nni}</p>
                      </div>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-gray-100 text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block">التاريخ</span>
                      <p className="font-medium text-gray-700">{conditionsData.hajj_info.date}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer with close button only */}
        <div className="flex gap-3 w-full p-4 bg-gray-50 rounded-b-lg border-t safe-bottom">
          <Button
            onClick={onClose}
            className="flex-1"
          >
            إغلاق
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConditionsViewModal;
