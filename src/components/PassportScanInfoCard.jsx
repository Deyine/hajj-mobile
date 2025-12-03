import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { CheckCircle2, AlertCircle, Camera, Upload, X } from 'lucide-react';
import api from '../services/api';
import ConfirmationDialog from './ConfirmationDialog';

/**
 * PassportScanInfoCard Component
 * Allows citizens to upload a photo of their passport
 * Shown when status is 'passport_imported'
 * Clean, simple design with photo upload capability
 */
export default function PassportScanInfoCard({ hajjData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef(null);

  // Check if passport photo is already uploaded
  const hasPassportPhoto = hajjData?.has_passeport_photo;
  const passportPhotoUrl = hajjData?.passeport_photo_url;

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('يجب أن يكون الملف صورة (JPG, PNG)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('حجم الصورة كبير جدا (الحد الأقصى 5 ميجابايت)');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadSuccess(false);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('يجب اختيار صورة أولا');
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/api/v1/mobile/upload_passport_photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUploadSuccess(true);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        // Call success callback to refresh dashboard
        if (onSuccess) {
          onSuccess(response.data.hajj);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'حدث خطأ أثناء رفع الصورة';
      setError(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCompleteSubscription = () => {
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
          <Camera className="h-5 w-5 text-primary" />
          تصوير جواز السفر
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

        {/* Success message */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">تم رفع صورة جواز السفر بنجاح</p>
          </div>
        )}

        {/* Photo upload card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {/* Instructions */}
            {!hasPassportPhoto && !previewUrl && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">تصوير جواز السفر</h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  يرجى التقاط صورة واضحة لصفحة البيانات في جواز السفر
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    تأكد من وضوح البيانات في الصورة وعدم وجود انعكاسات ضوئية
                  </p>
                </div>
              </div>
            )}

            {/* Show uploaded photo if exists */}
            {hasPassportPhoto && passportPhotoUrl && !previewUrl && (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600 inline-block ml-2" />
                  <span className="text-sm text-green-800">تم رفع صورة جواز السفر</span>
                </div>
                <div className="mb-4">
                  <img
                    src={passportPhotoUrl}
                    alt="صورة جواز السفر"
                    className="max-w-full h-auto rounded-lg border border-gray-200 mx-auto"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
            )}

            {/* Photo preview */}
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="معاينة الصورة"
                  className="w-full h-auto rounded-lg border border-gray-200"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* File input */}
            {!hasPassportPhoto && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="passport-photo-input"
                />
                <label
                  htmlFor="passport-photo-input"
                  className="block w-full"
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">التقاط صورة أو اختيار من المعرض</p>
                    <p className="text-xs text-gray-500">JPG, PNG (الحد الأقصى 5 ميجابايت)</p>
                  </div>
                </label>
              </>
            )}

            {/* Upload button */}
            {selectedFile && (
              <Button
                onClick={handleUpload}
                className="w-full"
                size="lg"
                disabled={uploadLoading}
              >
                <Upload className="ml-2 h-5 w-5" />
                {uploadLoading ? 'جاري الرفع...' : 'رفع الصورة'}
              </Button>
            )}

            {/* Complete subscription button */}
            {hasPassportPhoto && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                  <p className="text-xs text-amber-800 text-center">
                    بعد التأكد من صحة البيانات، اضغط على الزر أدناه لإتمام التسجيل
                  </p>
                </div>
                <Button
                  onClick={handleCompleteSubscription}
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                  إتمام التسجيل
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        title="تأكيد إتمام التسجيل"
        description="هل أنت متأكد من إتمام التسجيل؟ يرجى التأكد من صحة جميع البيانات المدخلة."
        confirmText="نعم، إتمام التسجيل"
        cancelText="إلغاء"
        loading={loading}
      />
    </div>
  );
}
