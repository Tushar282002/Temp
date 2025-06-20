import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Tag, Image as ImageIcon } from 'lucide-react';
import { Product, Review } from '../types';
import { API_BASE_URL } from '../config';
import RatingStars from './RatingStars';
import ReviewList from './ReviewList';

interface ProductCardProps {
  product: Product;
  onWriteReview: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onWriteReview }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    if (!showAllReviews || reviews.length > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAllReviews) {
      fetchReviews();
    }
  }, [showAllReviews]);

  const toggleReviews = () => {
    setShowAllReviews(!showAllReviews);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-slate-700">${product.price}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Rating Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <RatingStars rating={product.averageRating || 0} size="sm" />
            <span className="text-sm font-medium text-slate-700">
              {product.averageRating ? product.averageRating.toFixed(1) : 'No ratings'}
            </span>
          </div>
          <span className="text-sm text-slate-500">
            {product.reviewCount || 0} review{product.reviewCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Popular Tags */}
        {product.popularTags && product.popularTags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {product.popularTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => onWriteReview(product)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Star className="h-4 w-4" />
            <span>Write Review</span>
          </button>
          
          <button
            onClick={toggleReviews}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{showAllReviews ? 'Hide' : 'Show'} Reviews</span>
          </button>
        </div>

        {/* Reviews Section */}
        {showAllReviews && (
          <div className="border-t border-slate-200 pt-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;