import { useState } from 'react';
import { Button } from './ui/button';
import api from '../services/api';

/**
 * ContactInfoForm Component
 * Allows citizens in 'init' status to complete their contact information
 * Simplified borderless design
 */
export default function ContactInfoForm({ initialData, onSuccess }) {
  const [formData, setFormData] = useState({
    phone: initialData?.phone || '',
    whatsapp: initialData?.whatsapp || '',
    close_person_phone: initialData?.close_person_phone || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.phone) {
      setError('يرجى ملء رقم الهاتف');
      setLoading(false);
      return;
    }

    try {
      const response = await api.put('/api/v1/mobile/contact_info', {
        contact_info: formData
      });

      if (response.data.success) {
        // Call success callback to refresh dashboard
        if (onSuccess) {
          onSuccess(response.data.hajj);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground mb-2">إكمال معلومات الاتصال</h3>
        <p className="text-sm text-muted-foreground">
          يرجى ملء معلومات الاتصال الخاصة بكم للمتابعة في عملية التسجيل
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">
              رقم الهاتف الشخصي <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="44123456"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="block text-sm font-medium">
              رقم الواتساب (اختياري)
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="44123456"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="close_person_phone" className="block text-sm font-medium">
              رقم هاتف شخص قريب (اختياري)
            </label>
            <input
              type="tel"
              id="close_person_phone"
              name="close_person_phone"
              value={formData.close_person_phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="44123456"
              dir="ltr"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ معلومات الاتصال'}
          </Button>
        </div>
      </form>
    </div>
  );
}
