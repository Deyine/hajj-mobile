import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, CreditCard, FileText } from 'lucide-react';
import api from '../services/api';

/**
 * PaymentInfoCard Component
 * Displays payment information (titre de recette) for Hajj registration
 * Always shows download invoice button (creates bill if needed)
 */
export default function PaymentInfoCard({ hajjData }) {
  const [downloading, setDownloading] = useState(false);

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
      alert('حدث خطأ في تحميل الفاتورة');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full border-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            معلومات الدفع
          </CardTitle>
          {hajjData.bill_generated && (
            <Badge variant="success">متاح للدفع</Badge>
          )}
        </div>
        <CardDescription>
          رقم الدفع الخاص بكم
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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

        {/* Bill generation info if bill is already generated */}
        {hajjData.bill_generated && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">الفاتورة متاحة</p>
                <p className="text-xs text-green-700">
                  تم الإنشاء: {formatDate(hajjData.bill_generated_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Download invoice button - always available */}
        <Button
          onClick={handleDownloadBill}
          className="w-full"
          disabled={downloading}
        >
          <Download className="ml-2 h-4 w-4" />
          {downloading ? 'جارٍ التحميل...' : 'تحميل الفاتورة'}
        </Button>
      </CardContent>
    </Card>
  );
}
