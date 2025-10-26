import { useState } from 'react';
import { Button } from './ui/button';
import { Plane, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../services/api';

/**
 * PassportEntryCard Component
 * Allows citizens in 'conditions_generated' status to submit their passport number
 * Modern gradient card design
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

      {/* Main card with gradient */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-1">خطأ</h4>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900 mb-1">نجح</h4>
                <p className="text-green-800 text-sm">تم تسجيل جواز السفر بنجاح</p>
              </div>
            </div>
          </div>
        )}

        {/* Requirements - compact list */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
          <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">!</span>
            متطلبات جواز السفر
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">جواز السفر عادي (ليس دبلوماسي)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">صالح حتى 15 نوفمبر 2025 على الأقل</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">مسجل باسمكم في وكالة سجل السكان</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="passport_number" className="block text-sm font-bold text-gray-900">
              رقم جواز السفر <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="passport_number"
                name="passport_number"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-bold tracking-widest text-center bg-white shadow-sm"
                placeholder="B00123456"
                dir="ltr"
                maxLength={20}
                disabled={loading || success}
              />
            </div>
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
            {loading ? 'جارٍ التحقق...' : success ? 'تم التسجيل بنجاح ✓' : 'تسجيل جواز السفر'}
          </Button>
        </form>
      </div>
    </div>
  );
}
