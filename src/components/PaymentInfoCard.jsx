import { useState } from 'react';
import { Button } from './ui/button';
import { Download, CreditCard, Copy, Check, Banknote, Calendar, Hash } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const handleCopyTitreDeRecette = async () => {
    try {
      await navigator.clipboard.writeText(hajjData.titre_de_recette);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setAlertDialog({
        isOpen: true,
        title: 'خطأ',
        message: 'حدث خطأ في نسخ رقم الدفع',
        type: 'error'
      });
    }
  };

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
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-primary" />
          معلومات الدفع
        </h3>
        <p className="text-sm text-muted-foreground">
          رقم الدفع الخاص بكم
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment number - prominently displayed */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-4 sm:p-6 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
            <p className="text-xs sm:text-sm font-medium opacity-90">رقم الدفع</p>
          </div>
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider font-mono break-all" dir="ltr">
            {hajjData.titre_de_recette}
          </p>
          <p className="text-xs mt-2 opacity-75">استخدموا هذا الرقم للدفع عبر المحافظ الإلكترونية</p>

          {/* Copy button */}
          <button
            onClick={handleCopyTitreDeRecette}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                نسخ رقم الدفع
              </>
            )}
          </button>
        </div>

        {/* Invoice details */}
        {hajjData.payment_info && (
          <div className="space-y-3">
            {/* Season badge */}
            <div className="text-center">
              <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                {hajjData.payment_info.hajj_season}
              </span>
            </div>

            {/* Amount and Deadline - Prominent cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Amount card */}
              <div className="bg-white border-2 border-primary/20 rounded-lg p-4 text-center shadow-sm">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">المبلغ المطلوب</p>
                <p className="text-lg font-bold text-primary">{hajjData.payment_info.amount_formatted}</p>
              </div>

              {/* Deadline card */}
              <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center shadow-sm">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">آخر موعد للدفع</p>
                <p className="text-lg font-bold text-amber-700" dir="ltr">{hajjData.payment_info.payment_deadline}</p>
              </div>
            </div>

            {/* NNI - National ID */}
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 text-center shadow-sm">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">الرقم الوطني</p>
              <p className="text-lg font-bold text-blue-600" dir="ltr">{hajjData.nni}</p>
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
