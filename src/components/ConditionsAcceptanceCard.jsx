import { Button } from './ui/button';
import { FileCheck, BookOpen } from 'lucide-react';

/**
 * ConditionsAcceptanceCard Component
 * Displays a call-to-action for reading and accepting Hajj conditions
 * Redesigned to match PassportScanInfoCard style
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
          يجب الموافقة على الشروط قبل المتابعة
        </p>
      </div>

      <div className="space-y-4">
        {/* Instructions card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">ماذا يجب عليك فعله؟</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                يرجى قراءة شروط وإلتزامات الحاج بعناية والموافقة عليها للمتابعة
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-xs text-amber-800 text-center">
                سيتم عرض جميع الشروط والإلتزامات لقراءتها بعناية
              </p>
            </div>

            <Button
              onClick={onAcceptClick}
              className="w-full"
              size="lg"
            >
              <FileCheck className="ml-2 h-5 w-5" />
              قراءة وقبول الشروط
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
