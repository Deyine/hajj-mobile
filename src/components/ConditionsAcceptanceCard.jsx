import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileCheck, AlertCircle } from 'lucide-react';

/**
 * ConditionsAcceptanceCard Component
 * Displays a call-to-action for reading and accepting Hajj conditions
 * Simplified borderless design
 */
export default function ConditionsAcceptanceCard({ onAcceptClick }) {
  return (
    <div className="w-full mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            شروط وإلتزامات الحاج
          </h3>
          <Badge variant="default">مطلوب</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          يجب الموافقة على الشروط والإلتزامات قبل المتابعة
        </p>
      </div>

      <div className="space-y-4">
        {/* Important notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h4 className="font-semibold text-blue-900 mb-2">الخطوة التالية</h4>
          <p className="text-sm text-blue-800">
            يرجى قراءة شروط وإلتزامات الحاج بعناية والموافقة عليها للمتابعة في عملية التسجيل
          </p>
        </div>

        {/* What's included */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">ماذا تتضمن الشروط؟</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>السلوك الديني والمدني في أرض الحرمين</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>التزامات السفر والإقامة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>شروط جواز السفر والتأشيرة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>المسؤوليات المالية والإدارية</span>
            </li>
          </ul>
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
        <p className="text-xs text-center text-muted-foreground">
          بالضغط على الزر أعلاه، سيتم عرض الشروط كاملة لقراءتها والموافقة عليها
        </p>
      </div>
    </div>
  );
}
