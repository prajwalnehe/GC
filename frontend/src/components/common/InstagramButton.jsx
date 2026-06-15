import { Instagram } from 'lucide-react';
import { getLeadInstagramUrl } from '../../utils/helpers';

const InstagramButton = ({ instagramId, companyName, size = 'sm', className = '' }) => {
  const url = getLeadInstagramUrl({ instagramId, companyName });
  if (!url) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Open Instagram"
      aria-label="Open Instagram"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:opacity-90 active:scale-95 text-white shadow-md hover:shadow-lg transition-all ${sizeClasses[size]} ${className}`}
    >
      <Instagram className={iconSizes[size]} strokeWidth={2.5} />
    </a>
  );
};

export default InstagramButton;
