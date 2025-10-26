import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

/**
 * AlertDialog Component
 * A reusable alert dialog for displaying messages to users
 *
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Callback when dialog is closed
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} type - Type of alert: 'info', 'success', 'error' (default: 'info')
 * @param {string} buttonText - Text for the OK button (default: 'حسناً')
 */
export default function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'حسناً'
}) {
  if (!isOpen) return null;

  // Icon and color based on type
  const config = {
    info: {
      icon: AlertCircle,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  };

  const { icon: Icon, bgColor, iconColor } = config[type] || config.info;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            onClick={onClose}
            className="w-full"
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
