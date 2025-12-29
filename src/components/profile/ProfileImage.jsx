import React from 'react';
import { User, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileImage({ imageUrl, size = 'lg', editable = false, onUpload }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <div className="relative">
      <div className={cn(
        "rounded-full overflow-hidden border-4 border-[#D4AF37] bg-white flex items-center justify-center",
        sizeClasses[size]
      )}>
        {imageUrl ? (
          <img src={imageUrl} alt="פרופיל" className="w-full h-full object-cover" />
        ) : (
          <User className="w-1/2 h-1/2 text-gray-300" />
        )}
      </div>
      {editable && onUpload && (
        <button
          onClick={onUpload}
          className="absolute bottom-0 right-0 bg-[#D4AF37] text-white rounded-full p-2 hover:bg-[#B8941F] transition-all shadow-lg"
        >
          <Upload className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}