import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, CreditCard } from 'lucide-react';
import api from '../services/api';
import AlertDialog from './AlertDialog';
import ConfirmationDialog from './ConfirmationDialog';

/**
 * PaymentInfoCard Component
 * Displays payment information (titre de recette) for Hajj registration
 * Always shows download invoice button (creates bill if needed)
 * Simplified borderless design
 */
export default function PaymentInfoCard({ hajjData, onPaymentMarked }) {
  const [downloading, setDownloading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const handleDownloadBill = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/api/v1/mobile/bill', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${hajjData.titre_de_recette}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading bill:', err);
      setAlertDialog({
        isOpen: true,
        title: 'خطأ',
        message: 'حدث خطأ في تحميل الفاتورة',
        type: 'error'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleMarkAsPaid = () => {
    setConfirmDialog({ isOpen: true });
  };

  const confirmMarkAsPaid = async () => {
    setConfirmDialog({ isOpen: false });
    setMarking(true);
    try {
      const response = await api.post('/api/v1/mobile/mark_paid');
      if (response.data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'نجح',
          message: 'تم تسجيل الدفع بنجاح',
          type: 'success'
        });
        if (onPaymentMarked) {
          onPaymentMarked(response.data.hajj);
        }
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
      setAlertDialog({
        isOpen: true,
        title: 'خطأ',
        message: 'حدث خطأ في تسجيل الدفع',
        type: 'error'
      });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            معلومات الدفع
          </h3>
          {hajjData.bill_generated && (
            <Badge variant="success">متاح للدفع</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          رقم الدفع الخاص بكم
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment number - prominently displayed */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-6 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard className="h-6 w-6" />
            <p className="text-sm font-medium opacity-90">رقم الدفع</p>
          </div>
          <p className="text-5xl font-bold tracking-wider font-mono" dir="ltr">
            {hajjData.titre_de_recette}
          </p>
          <p className="text-xs mt-2 opacity-75">استخدموا هذا الرقم للدفع عبر المحافظ الإلكترونية</p>
        </div>

        {/* Invoice details */}
        {hajjData.payment_info && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-center mb-3">{hajjData.payment_info.hajj_season}</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">المبلغ المطلوب</p>
                <p className="text-lg font-bold text-gray-900">{hajjData.payment_info.amount_formatted}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">آخر موعد للدفع</p>
                <p className="text-lg font-bold text-gray-900" dir="ltr">{hajjData.payment_info.payment_deadline}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-300">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">الاسم الكامل</p>
                <p className="text-sm font-semibold text-gray-900">{hajjData.full_name_ar}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">رقم الحاج</p>
                <p className="text-sm font-semibold text-gray-900" dir="ltr">{hajjData.full_reference}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">الرقم الوطني</p>
                <p className="text-sm font-semibold text-gray-900" dir="ltr">{hajjData.nni}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <h4 className="font-semibold text-amber-900 mb-2">تعليمات الدفع:</h4>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>استخدموا رقم الدفع أعلاه عند الدفع عبر المحفظة الإلكترونية</li>
            <li>بعد إتمام الدفع، سيتم تحديث حالة التسجيل تلقائياً</li>
          </ul>
        </div>

        {/* Download invoice button - always available */}
        <Button
          onClick={handleDownloadBill}
          className="w-full"
          disabled={downloading}
        >
          <Download className="ml-2 h-4 w-4" />
          {downloading ? 'جارٍ التحميل...' : 'تحميل الفاتورة'}
        </Button>

        {/* Test button to mark as paid */}
        <Button
          onClick={handleMarkAsPaid}
          variant="destructive"
          className="w-full"
          disabled={marking}
        >
          {marking ? 'جارٍ التسجيل...' : '⚠️ تسجيل الدفع (اختبار)'}
        </Button>
      </div>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmMarkAsPaid}
        title="تأكيد تسجيل الدفع"
        description="هل تريد تسجيل الدفع؟ (للاختبار فقط)"
        confirmText="نعم، سجل الدفع"
        cancelText="إلغاء"
        loading={marking}
      />
    </div>
  );
}
