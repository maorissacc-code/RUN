import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({ rating, maxRating = 5, size = 'md', interactive = false, onChange }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={cn(
              "transition-all",
              interactive && "hover:scale-110 cursor-pointer"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}