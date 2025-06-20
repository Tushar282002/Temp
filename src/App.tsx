import React, { useState, useEffect } from 'react';
import { Star, Filter, TrendingUp } from 'lucide-react';
import ProductCard from './components/ProductCard';
import ReviewModal from './components/ReviewModal';
import { Product, Review } from './types';
import { API_BASE_URL } from './config';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = (product: Product) => {
    setSelectedProduct(product);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    fetchProducts(); // Refresh products to update ratings
    setIsReviewModalOpen(false);
    setSelectedProduct(null);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'reviews':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Star className="h-6 w-6 text-white fill-current" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">ProductReview</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Filter className="h-4 w-4" />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews' | 'name')}
                  className="border-0 bg-transparent font-medium text-slate-700 focus:ring-0 cursor-pointer"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Discover & Review Amazing Products
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Share your experience and help others make informed decisions. 
            Rate products, write detailed reviews, and discover what others think.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>{products.length} Products</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-orange-500 fill-current" />
              <span>{products.reduce((sum, p) => sum + (p.reviewCount || 0), 0)} Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onWriteReview={handleWriteReview}
            />
          ))}
        </div>
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}

export default App;