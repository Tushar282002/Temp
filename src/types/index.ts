export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  averageRating?: number;
  reviewCount?: number;
  popularTags?: string[];
}

export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  review?: string;
  tags?: string[];
  photos?: string[];
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
}