import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  interactive = false,
  size = 'md',
  showCount = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= rating;
    const isHalfFilled = starValue - 0.5 <= rating && starValue > rating;

    return (
      <button
        key={index}
        type="button"
        onClick={() => interactive && onRatingChange?.(starValue)}
        onMouseEnter={() => interactive && onRatingChange?.(starValue)}
        className={`${
          interactive
            ? 'cursor-pointer hover:scale-110 transition-all duration-150'
            : 'cursor-default'
        } focus:outline-none`}
        disabled={!interactive}
      >
        <Star
          className={`${sizeClasses[size]} ${
            isFilled || isHalfFilled
              ? 'text-orange-400 fill-current'
              : 'text-slate-300'
          } transition-colors duration-150`}
        />
      </button>
    );
  });

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">{stars}</div>
      {showCount && (
        <span className="text-sm text-slate-600 ml-2">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;