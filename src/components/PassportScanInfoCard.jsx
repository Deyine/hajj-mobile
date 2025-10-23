import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { FileCheck, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import ConfirmationDialog from './ConfirmationDialog';

/**
 * PassportScanInfoCard Component
 * Informs citizens that they need to bring their physical passport for scanning
 * Shown when status is 'passport_imported'
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
    <Card className="w-full border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          إحضار جواز السفر
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-800 leading-relaxed">
            يرجى التوجه إلى مديرية الحج والعمرة لإحضار جواز السفر
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleButtonClick}
          className="w-full"
          disabled={loading}
        >
          <CheckCircle2 className="ml-2 h-5 w-5" />
          إتمام التسجيل
        </Button>
      </CardFooter>

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
    </Card>
  );
}
