import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Users, X, AlertCircle } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

/**
 * CompanionList Component
 * Displays list of companions with remove functionality
 */
export default function CompanionList({ companions, onCompanionRemoved }) {
  const [removingId, setRemovingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  const handleRemoveClick = (companion) => {
    setSelectedCompanion(companion);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = () => {
    if (selectedCompanion) {
      setRemovingId(selectedCompanion.id);
      setShowConfirmDialog(false);

      // Notify parent to handle removal
      if (onCompanionRemoved) {
        onCompanionRemoved(selectedCompanion.id, () => {
          setRemovingId(null);
          setSelectedCompanion(null);
        });
      }
    }
  };

  if (!companions || companions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لم تقم بإضافة أي رفيق بعد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            رفقاء الحج ({companions.length}/5)
          </h3>

          <div className="space-y-3">
            {companions.map((companion) => (
              <div
                key={companion.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
              >
                {/* Photo */}
                <div className="flex-shrink-0">
                  {companion.photo_url ? (
                    <img
                      src={companion.photo_url}
                      alt={companion.full_name_ar}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-gray-500 text-xl">
                        {companion.full_name_ar?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-1 truncate">
                    {companion.full_name_ar}
                  </h4>
                  <p className="text-sm text-gray-600">
                    الرقم الوطني: <span className="font-mono">{companion.nni}</span>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveClick(companion)}
                  disabled={removingId === companion.id}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setSelectedCompanion(null);
        }}
        onConfirm={handleConfirmRemove}
        title="تأكيد إزالة الرفيق"
        description={`هل أنت متأكد من إزالة ${selectedCompanion?.full_name_ar} من قائمة رفقائك؟`}
        confirmText="نعم، إزالة"
        cancelText="إلغاء"
        loading={removingId === selectedCompanion?.id}
      />
    </>
  );
}
