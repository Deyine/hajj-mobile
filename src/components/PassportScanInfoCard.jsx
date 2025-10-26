import { useState } from 'react';
import { Button } from './ui/button';
import { FileCheck, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';
import api from '../services/api';
import ConfirmationDialog from './ConfirmationDialog';

/**
 * PassportScanInfoCard Component
 * Informs citizens that they need to bring their physical passport for scanning
 * Shown when status is 'passport_imported'
 * Clean, simple design
 */
export default function PassportScanInfoCard({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleButtonClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/v1/mobile/complete_subscription');

      if (response.data.success) {
        setShowConfirmDialog(false);
        // Call success callback to refresh dashboard
        if (onSuccess) {
          onSuccess(response.data.hajj);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'حدث خطأ أثناء إتمام التسجيل';
      setError(errorMessage);
      setShowConfirmDialog(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
          <FileCheck className="h-5 w-5 text-primary" />
          إحضار جواز السفر
        </h3>
        <p className="text-sm text-muted-foreground">
          الخطوة الأخيرة لإتمام التسجيل
        </p>
      </div>

      <div className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Location info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">الموقع</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                مديرية الحج والعمرة
              </p>
            </div>
          </div>
        </div>

        {/* Instructions card */}
        <div className="bg-white border-2 border-primary/20 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                <FileCheck className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">ماذا يجب عليك فعله؟</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                يرجى التوجه إلى مديرية الحج والعمرة لإحضار جواز السفر الفيزيائي الخاص بكم
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-xs text-amber-800 text-center">
                بعد إحضار جواز السفر، اضغط على الزر أدناه لإتمام التسجيل
              </p>
            </div>

            <Button
              onClick={handleButtonClick}
              className="w-full"
              size="lg"
              disabled={loading}
            >
              <CheckCircle2 className="ml-2 h-5 w-5" />
              تأكيد إحضار جواز السفر
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        title="تأكيد إتمام التسجيل"
        description="هل قمت بإحضار جواز السفر إلى مديرية الحج والعمرة؟"
        confirmText="نعم، تم الإحضار"
        cancelText="إلغاء"
        loading={loading}
      />
    </div>
  );
}
