import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

/**
 * BottomSheet Component
 * A modal that slides up from the bottom of the screen
 * Mobile-first design pattern
 */
export function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[20px] shadow-2xl"
        style={{
          maxHeight: '90vh',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-[20px] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div
          className="overflow-y-auto px-6 py-4"
          style={{
            maxHeight: 'calc(90vh - 73px)', // 73px is header height
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
