import React from 'react';
import { User, Calendar, Image as ImageIcon, Tag } from 'lucide-react';
import { Review } from '../types';
import RatingStars from './RatingStars';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-900 flex items-center space-x-2">
        <span>Reviews ({reviews.length})</span>
      </h4>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {reviews.map((review) => (
          <div key={review.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-slate-900">{review.userName}</h5>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {review.rating > 0 && (
                <RatingStars rating={review.rating} size="sm" />
              )}
            </div>

            {/* Review Content */}
            {review.review && (
              <p className="text-slate-700 mb-3 leading-relaxed">{review.review}</p>
            )}

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {review.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-2 w-2 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {review.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg group-hover:opacity-90 transition-opacity cursor-pointer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;