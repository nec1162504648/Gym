import { useEffect, type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  md: 'md:max-w-md',
  lg: 'md:max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 md:bg-black/50"
        onClick={onClose}
      />
      <div className="fixed inset-0 md:flex md:items-center md:justify-center">
        <div className={`flex flex-col h-full md:h-auto md:max-h-[90vh] w-full ${sizeClasses[size]} md:mx-4 bg-white md:rounded-xl shadow-xl`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 md:px-6 md:py-4">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 active:text-gray-600 active:bg-gray-100 rounded-lg transition-colors cursor-pointer touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
