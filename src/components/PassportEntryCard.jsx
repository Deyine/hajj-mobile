import { useState } from 'react';
import { Button } from './ui/button';
import { Plane, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

/**
 * PassportEntryCard Component
 * Allows citizens in 'conditions_generated' status to submit their passport number
 * Clean design matching app style
 */
export default function PassportEntryCard({ onSuccess }) {
  const [passportNumber, setPassportNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate passport number
    if (!passportNumber.trim()) {
      setError('يجب إدخال رقم جواز السفر');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/v1/mobile/submit_passport', {
        passport_number: passportNumber.trim().toUpperCase()
      });

      if (response.data.success) {
        setSuccess(true);
        // Call success callback to refresh dashboard
        if (onSuccess) {
          onSuccess(response.data.hajj);
        }
      }
    } catch (err) {
      // Handle error messages from backend
      const errorMessage = err.response?.data?.error || 'حدث خطأ أثناء التحقق من جواز السفر';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Plane className="h-5 w-5 text-primary" />
          تسجيل جواز السفر
        </h3>
        <p className="text-sm text-muted-foreground">
          يرجى إدخال رقم جواز السفر الخاص بكم للمتابعة في عملية التسجيل
        </p>
      </div>

      <div className="space-y-4">
        {/* Error/Success messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">تم تسجيل جواز السفر بنجاح</p>
          </div>
        )}

        {/* Requirements box */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <h4 className="font-semibold text-amber-900 mb-2">متطلبات جواز السفر:</h4>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>جواز السفر عادي (ليس دبلوماسي)</li>
            <li>صالح حتى 15 نوفمبر 2025 على الأقل</li>
            <li>مسجل باسمكم في وكالة سجل السكان</li>
          </ul>
        </div>

        {/* Passport input card */}
        <div className="bg-white border-2 border-primary/20 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="passport_number" className="block text-sm font-semibold text-gray-900 text-center">
                رقم جواز السفر
              </label>
              <input
                type="text"
                id="passport_number"
                name="passport_number"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-2xl font-bold tracking-widest text-center bg-gray-50"
                placeholder="B00123456"
                dir="ltr"
                maxLength={20}
                disabled={loading || success}
              />
              <p className="text-xs text-gray-600 text-center">
                أدخل رقم جواز السفر كما هو مكتوب في الجواز
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || success}
            >
              <Plane className="ml-2 h-5 w-5" />
              {loading ? 'جارٍ التحقق...' : success ? 'تم التسجيل بنجاح' : 'تسجيل جواز السفر'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
