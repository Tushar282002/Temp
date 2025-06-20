import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory storage (replace with actual database)
let products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
    price: 299.99,
    imageUrl: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800",
    averageRating: 0,
    reviewCount: 0,
    popularTags: []
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitoring, GPS, and smartphone integration. Track your health and stay connected.",
    price: 199.99,
    imageUrl: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800",
    averageRating: 0,
    reviewCount: 0,
    popularTags: []
  },
  {
    id: 3,
    name: "Ergonomic Office Chair",
    description: "Comfortable and supportive office chair designed for long working hours. Adjustable height and lumbar support included.",
    price: 449.99,
    imageUrl: "https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=800",
    averageRating: 0,
    reviewCount: 0,
    popularTags: []
  },
  {
    id: 4,
    name: "Professional Camera Lens",
    description: "High-performance camera lens for professional photography. Sharp images with excellent bokeh effect.",
    price: 899.99,
    imageUrl: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800",
    averageRating: 0,
    reviewCount: 0,
    popularTags: []
  },
  {
    id: 5,
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with customizable keys. Perfect for gaming and professional typing.",
    price: 159.99,
    imageUrl: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800",
    averageRating: 0,
    reviewCount: 0,
    popularTags: []
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    description: "Portable wireless speaker with exceptional sound quality and long battery life. Perfect for outdoor activities.",
    price: 79.99,
    imageUrl: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800",
    averageRating: 0,
    reviewCount: 0,
    popularTags: []
  }
];

let reviews = [];
let userReviews = new Map(); // Track user reviews per product

// Helper functions
const calculateProductStats = (productId) => {
  const productReviews = reviews.filter(r => r.productId === productId);
  const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;
  
  // Extract and count tags
  const allTags = productReviews.flatMap(r => r.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  
  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: productReviews.length,
    popularTags
  };
};

const updateProductStats = (productId) => {
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    const stats = calculateProductStats(productId);
    products[productIndex] = { ...products[productIndex], ...stats };
  }
};

// Routes

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get reviews for a specific product
app.get('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const productReviews = reviews.filter(r => r.productId === productId);
  res.json(productReviews);
});

// Create a new review
app.post('/api/reviews', upload.array('photos', 3), (req, res) => {
  try {
    const { productId, userName, rating, review, tags } = req.body;
    
    // Basic validation
    if (!productId || !userName) {
      return res.status(400).json({ message: 'Product ID and user name are required' });
    }

    if (!rating && !review) {
      return res.status(400).json({ message: 'Either rating or review is required' });
    }

    const numericProductId = parseInt(productId);
    const numericRating = rating ? parseInt(rating) : 0;

    // Check if user already reviewed this product
    const userKey = `${userName.toLowerCase()}-${numericProductId}`;
    if (userReviews.has(userKey)) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Process uploaded photos
    const photoUrls = req.files ? req.files.map(file => 
      `http://localhost:3001/uploads/${file.filename}`
    ) : [];

    // Process tags
    const processedTags = tags ? 
      tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Create new review
    const newReview = {
      id: Date.now(),
      productId: numericProductId,
      userName: userName.trim(),
      rating: numericRating,
      review: review ? review.trim() : null,
      tags: processedTags,
      photos: photoUrls,
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    userReviews.set(userKey, true);

    // Update product statistics
    updateProductStats(numericProductId);

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get popular tags across all reviews
app.get('/api/reviews/tags', (req, res) => {
  const allTags = reviews.flatMap(r => r.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  
  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  res.json(popularTags);
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: 'Only image files are allowed.' });
  }

  res.status(500).json({ message: 'Internal server error' });
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});