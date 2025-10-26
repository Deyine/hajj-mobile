import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, UserCog, X } from 'lucide-react';

/**
 * Debug Panel for Admin Impersonation
 * Allows admins to view the app as another citizen for troubleshooting
 *
 * Usage: Triple-click on the header to toggle visibility
 */
export default function DebugPanel({ onClose, onImpersonate, currentNNI, impersonatedNNI }) {
  const [targetNNI, setTargetNNI] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill with current impersonation if any
    if (impersonatedNNI) {
      setTargetNNI(impersonatedNNI);
    }
  }, [impersonatedNNI]);

  const handleImpersonate = () => {
    setError('');

    if (!targetNNI || targetNNI.trim().length !== 10) {
      setError('الرجاء إدخال رقم وطني صحيح (10 أرقام)');
      return;
    }

    onImpersonate(targetNNI.trim());
  };

  const handleClearImpersonation = () => {
    setTargetNNI('');
    setError('');
    onImpersonate(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive border-2">
        <CardHeader className="bg-destructive/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <UserCog className="h-5 w-5" />
              لوحة التصحيح - Debug Panel
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 inline ml-1" />
              للمسؤولين فقط - Admin Only
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">رقمك الوطني:</p>
            <p className="text-sm text-muted-foreground font-mono" dir="ltr">{currentNNI}</p>
          </div>

          {impersonatedNNI && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm font-semibold text-red-900 mb-1">
                تنتحل شخصية:
              </p>
              <p className="text-sm text-red-800 font-mono" dir="ltr">{impersonatedNNI}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">
              الرقم الوطني للمواطن (للتصحيح):
            </label>
            <Input
              type="text"
              placeholder="0123456789"
              value={targetNNI}
              onChange={(e) => setTargetNNI(e.target.value)}
              maxLength={10}
              dir="ltr"
              className="font-mono text-center text-lg"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleImpersonate}
              className="w-full"
              variant="destructive"
            >
              عرض بيانات هذا المواطن
            </Button>

            {impersonatedNNI && (
              <Button
                onClick={handleClearImpersonation}
                className="w-full"
                variant="outline"
              >
                العودة إلى حسابي
              </Button>
            )}

            <Button
              onClick={onClose}
              className="w-full"
              variant="secondary"
            >
              إغلاق
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            <p>⚠️ جميع عمليات التصحيح مسجلة</p>
            <p>All debug actions are logged</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
