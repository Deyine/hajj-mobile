import { Button } from './ui/button';
import { FileCheck } from 'lucide-react';

/**
 * ConditionsAcceptanceCard Component
 * Displays a call-to-action for reading and accepting Hajj conditions
 * Clean, modern design with gradient card
 */
export default function ConditionsAcceptanceCard({ onAcceptClick }) {
  return (
    <div className="w-full mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
          <FileCheck className="h-5 w-5 text-primary" />
          شروط وإلتزامات الحاج
        </h3>
        <p className="text-sm text-muted-foreground">
          يجب الموافقة على الشروط والإلتزامات قبل المتابعة
        </p>
      </div>

      {/* Main action card with gradient */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-6 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <FileCheck className="h-10 w-10 text-primary" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-gray-900">الخطوة التالية</h4>
          <p className="text-sm text-gray-700 leading-relaxed max-w-md mx-auto">
            يرجى قراءة شروط وإلتزامات الحاج بعناية والموافقة عليها للمتابعة في عملية التسجيل
          </p>
        </div>

        {/* Call to action button */}
        <Button
          onClick={onAcceptClick}
          className="w-full"
          size="lg"
        >
          <FileCheck className="ml-2 h-5 w-5" />
          قراءة وقبول الشروط
        </Button>

        {/* Additional note */}
        <p className="text-xs text-gray-600">
          سيتم عرض الشروط كاملة لقراءتها والموافقة عليها
        </p>
      </div>
    </div>
  );
}
