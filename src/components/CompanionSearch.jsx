import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import api from '../services/api';

/**
 * CompanionSearch Component
 * Allows citizens to search for and add companions by NNI
 */
export default function CompanionSearch({ onCompanionAdded }) {
  const [searchNNI, setSearchNNI] = useState('');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchNNI.trim().length !== 10) {
      setError('الرقم الوطني يجب أن يكون 10 أرقام');
      return;
    }

    setSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const response = await api.post('/api/v1/mobile/companions/search', {
        nni: searchNNI.trim()
      });

      if (response.data.found) {
        setSearchResult(response.data.hajj);
      } else {
        setError(response.data.message || 'لم يتم العثور على حاج بهذا الرقم الوطني');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'حدث خطأ أثناء البحث';
      setError(errorMessage);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!searchResult) return;

    setAdding(true);
    setError(null);

    try {
      const response = await api.post('/api/v1/mobile/companions', {
        companion_nni: searchResult.nni
      });

      if (response.data.success) {
        // Notify parent component
        if (onCompanionAdded) {
          onCompanionAdded(response.data.companion);
        }

        // Reset form
        setSearchNNI('');
        setSearchResult(null);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'حدث خطأ أثناء إضافة الرفيق';
      setError(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-primary" />
          البحث عن رفيق
        </h3>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search-nni" className="block text-sm font-medium text-gray-700 mb-2">
              الرقم الوطني
            </label>
            <input
              id="search-nni"
              type="text"
              value={searchNNI}
              onChange={(e) => setSearchNNI(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="أدخل الرقم الوطني للرفيق (10 أرقام)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center font-mono text-lg"
              maxLength={10}
              disabled={searching || adding}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={searching || adding || searchNNI.length !== 10}
          >
            <Search className="ml-2 h-5 w-5" />
            {searching ? 'جارٍ البحث...' : 'بحث'}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-3">
              {/* Photo */}
              <div className="flex-shrink-0">
                {searchResult.photo_url ? (
                  <img
                    src={searchResult.photo_url}
                    alt={searchResult.full_name_ar}
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-green-300">
                    <span className="text-gray-500 text-2xl">
                      {searchResult.full_name_ar?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg mb-1">
                  {searchResult.full_name_ar}
                </h4>
                <p className="text-sm text-gray-600">
                  الرقم الوطني: <span className="font-mono">{searchResult.nni}</span>
                </p>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              className="w-full"
              size="lg"
              disabled={adding}
            >
              <UserPlus className="ml-2 h-5 w-5" />
              {adding ? 'جارٍ الإضافة...' : 'إضافة كرفيق'}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-800">
            <strong>ملاحظة:</strong> يمكنك إضافة حتى 5 رفقاء. الرفيق سيرى معلوماتك تلقائياً في قائمته.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
