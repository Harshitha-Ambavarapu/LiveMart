import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 'md', showNumber = false, interactive = false, onRatingChange }) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const handleClick = (index) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((index) => {
        const isFilled = index < Math.floor(rating);
        const isHalf = index < rating && index >= Math.floor(rating);
        
        return (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            type="button"
          >
            <Star
              className={`${sizes[size]} ${
                isFilled || isHalf
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}