export interface User {
  id: string;
  email: string;
  password: string;
  businessName: string;
  sector: string;
  logo?: string;
  primaryColor?: string;
  tone?: 'professionnel' | 'amical' | 'dynamique';
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  visualSuggestion?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate: Date;
  channel: 'google' | 'facebook' | 'both';
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  content: string;
  author: string;
  rating: number;
  date: Date;
  platform: 'google' | 'facebook';
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  response: string;
  status: 'pending' | 'approved' | 'sent';
  createdAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Stats {
  userId: string;
  postsPublished: number;
  reviewsReceived: number;
  reviewsAnswered: number;
  views: number;
  period: 'week' | 'month';
  date: Date;
}

export interface Subscription {
  userId: string;
  plan: 'free' | 'essential' | 'pro';
  status: 'active' | 'cancelled';
  expiresAt?: Date;
}
