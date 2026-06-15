import { Phone } from 'lucide-react';

const CallButton = ({ phone, size = 'sm', showLabel = false, className = '' }) => {
  if (!phone) return null;

  const sizeClasses = {
    sm: showLabel ? 'h-8 px-3 gap-1.5' : 'w-8 h-8',
    md: showLabel ? 'h-10 px-4 gap-2' : 'w-10 h-10',
    lg: showLabel ? 'h-12 px-5 gap-2' : 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <a
      href={`tel:${phone.replace(/\D/g, '')}`}
      title="Call"
      aria-label="Call"
      className={`inline-flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-md hover:shadow-lg transition-all ${sizeClasses[size]} ${className}`}
    >
      <Phone className={iconSizes[size]} strokeWidth={2.5} />
      {showLabel && <span className="text-sm font-semibold">Call</span>}
    </a>
  );
};

export default CallButton;
