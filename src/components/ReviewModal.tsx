import React, { useState } from 'react';
import { X, Star, Upload, Tag } from 'lucide-react';
import { Product } from '../types';
import { API_BASE_URL } from '../config';
import RatingStars from './RatingStars';

interface ReviewModalProps {
  product: Product;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ product, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [userName, setUserName] = useState('');
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!userName.trim()) {
      newErrors.userName = 'Name is required';
    }

    if (rating === 0 && !review.trim()) {
      newErrors.general = 'Please provide either a rating or a review (or both)';
    }

    if (review.trim() && review.trim().length < 10) {
      newErrors.review = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 3); // Limit to 3 photos
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('productId', product.id.toString());
      formData.append('userName', userName.trim());
      formData.append('rating', rating.toString());
      formData.append('review', review.trim());
      formData.append('tags', tags.trim());
      
      photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onReviewSubmitted();
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Failed to submit review' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Write a Review</h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex items-center space-x-4 mb-6 p-3 bg-slate-50 rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold text-slate-900">{product.name}</h4>
              <p className="text-sm text-slate-600">${product.price}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.userName ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter your name"
              />
              {errors.userName && (
                <p className="text-red-600 text-sm mt-1">{errors.userName}</p>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-2">
                <RatingStars
                  rating={rating}
                  onRatingChange={setRating}
                  interactive
                  size="lg"
                />
                <span className="text-sm text-slate-600">
                  {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Review
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                  errors.review ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Share your experience with this product..."
              />
              {errors.review && (
                <p className="text-red-600 text-sm mt-1">{errors.review}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags (Optional)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="comfortable, durable, good value"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Photos (Optional)
              </label>
              <div className="space-y-3">
                {photos.length < 3 && (
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload photos</p>
                      <p className="text-xs text-slate-500">Up to 3 photos, max 5MB each</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;