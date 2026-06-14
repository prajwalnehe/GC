import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary-100 dark:border-secondary-700">
          <h2 className="text-base sm:text-lg font-semibold text-secondary-800 dark:text-secondary-100 pr-4">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors shrink-0">
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
