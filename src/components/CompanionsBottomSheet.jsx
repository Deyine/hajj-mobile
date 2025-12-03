import { useState, useEffect } from 'react';
import { BottomSheet } from './ui/bottom-sheet';
import CompanionSearch from './CompanionSearch';
import CompanionList from './CompanionList';
import api from '../services/api';
import errorLogger from '../services/errorLogger';

/**
 * CompanionsBottomSheet Component
 * Bottom sheet modal for managing companions
 */
export default function CompanionsBottomSheet({ isOpen, onClose, onCompanionsChange }) {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanions();
    }
  }, [isOpen]);

  const fetchCompanions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/mobile/companions');
      setCompanions(response.data.companions || []);
    } catch (error) {
      console.error('Error fetching companions:', error);
      errorLogger.logError(error, {
        context: 'fetch_companions',
        component: 'CompanionsBottomSheet'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanionAdded = (newCompanion) => {
    const updatedCompanions = [...companions, newCompanion];
    setCompanions(updatedCompanions);
    // Notify parent dashboard
    if (onCompanionsChange) {
      onCompanionsChange(updatedCompanions);
    }
  };

  const handleCompanionRemoved = async (companionId, onComplete) => {
    try {
      const response = await api.delete(`/api/v1/mobile/companions/${companionId}`);

      if (response.data.success) {
        const updatedCompanions = companions.filter(c => c.id !== companionId);
        setCompanions(updatedCompanions);
        // Notify parent dashboard
        if (onCompanionsChange) {
          onCompanionsChange(updatedCompanions);
        }
      }
    } catch (error) {
      console.error('Error removing companion:', error);
      errorLogger.logError(error, {
        context: 'remove_companion',
        companion_id: companionId,
        component: 'CompanionsBottomSheet'
      });
    } finally {
      if (onComplete) onComplete();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="رفقاء الحج">
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">جارٍ التحميل...</p>
          </div>
        ) : (
          <>
            {/* Companion List */}
            <CompanionList
              companions={companions}
              onCompanionRemoved={handleCompanionRemoved}
            />

            {/* Search Component (disabled if limit reached) */}
            {companions.length >= 5 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-center">
                  <strong>وصلت للحد الأقصى:</strong> يمكنك إضافة 5 رفقاء كحد أقصى
                </p>
              </div>
            ) : (
              <CompanionSearch onCompanionAdded={handleCompanionAdded} />
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}
