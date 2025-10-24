import { useState } from 'react';
import { Button } from './ui/button';
import { Plane } from 'lucide-react';
import api from '../services/api';

/**
 * PassportEntryCard Component
 * Allows citizens in 'conditions_generated' status to submit their passport number
 * Simplified borderless design
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

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              تم تسجيل جواز السفر بنجاح
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="font-bold text-blue-900 text-sm">متطلبات جواز السفر:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>يجب أن يكون جواز السفر عاديا (ليس دبلوماسيا)</li>
              <li>يجب أن يكون صالحا حتى 15 نوفمبر 2025 على الأقل</li>
              <li>يجب أن يكون الجواز مسجلا باسمكم في وكالة سجل السكان</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label htmlFor="passport_number" className="block text-sm font-medium">
              رقم جواز السفر <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="passport_number"
              name="passport_number"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-lg font-mono tracking-wider text-right"
              placeholder="MR1234567"
              dir="ltr"
              maxLength={20}
              disabled={loading || success}
            />
            <p className="text-xs text-gray-500">
              أدخل رقم جواز السفر كما هو مكتوب في الجواز
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || success}
          >
            {loading ? 'جارٍ التحقق...' : success ? 'تم التسجيل بنجاح' : 'تسجيل جواز السفر'}
          </Button>
        </div>
      </form>
    </div>
  );
}
