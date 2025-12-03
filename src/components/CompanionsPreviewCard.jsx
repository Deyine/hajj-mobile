import { Users, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

/**
 * CompanionsPreviewCard Component
 * Shows a preview of companions on the dashboard with quick access
 */
export default function CompanionsPreviewCard({ companions = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header with count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-gray-900">رفقاء الحج</h3>
          </div>
          <Badge variant="secondary" className="font-mono">
            {companions.length}/5
          </Badge>
        </div>

        {/* Companions preview */}
        {companions.length > 0 ? (
          <div className="space-y-2 mb-3">
            {companions.slice(0, 3).map((companion) => (
              <div
                key={companion.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                {/* Mini photo - 40px circular */}
                <div className="flex-shrink-0">
                  {companion.photo_url ? (
                    <img
                      src={companion.photo_url}
                      alt={companion.full_name_ar}
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                      style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}
                    >
                      <span className="text-primary font-bold text-sm">
                        {companion.full_name_ar?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Companion info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {companion.full_name_ar}
                  </p>
                  <p className="text-xs text-gray-500">
                    {companion.full_reference}
                  </p>
                </div>
              </div>
            ))}

            {/* Show count of remaining companions */}
            {companions.length > 3 && (
              <p className="text-xs text-gray-500 text-center py-1">
                +{companions.length - 3} رفقاء آخرين
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-3 mb-3">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">لم تقم بإضافة رفقاء بعد</p>
          </div>
        )}

        {/* Action button */}
        <Button
          onClick={() => navigate('/companions')}
          variant="outline"
          className="w-full"
          size="sm"
        >
          {companions.length > 0 ? 'إدارة الرفقاء' : 'إضافة رفقاء'}
          <ChevronLeft className="mr-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
