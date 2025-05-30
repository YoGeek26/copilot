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
  visualUrl?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate: Date;
  plannedDate?: Date; // Pour le calendrier éditorial
  channel: 'google' | 'facebook' | 'both';
  campaignId?: string; // Lien vers une campagne
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

// Nouvelles interfaces V3

export interface Promotion {
  id: string;
  userId: string;
  title: string;
  description: string;
  discount: string; // Ex: "-20%", "2+1 gratuit"
  startDate: Date;
  endDate: Date;
  posts: {
    google?: string;
    facebook?: string;
  };
  visualUrl?: string;
  visualSuggestion: string;
  status: 'draft' | 'active' | 'ended';
  createdAt: Date;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  month: string; // Format: "2024-01"
  metrics: {
    views: number;
    reviewsReceived: number;
    reviewsAnswered: number;
    postsPublished: number;
    avgRating: number;
    clientsAdded: number;
  };
  summary: string;
  recommendations: string[];
  htmlContent?: string;
  pdfUrl?: string;
  createdAt: Date;
}

export interface Badge {
  id: string;
  userId: string;
  type: 'regular_poster' | 'review_master' | 'top_rated' | 'engagement_star' | 'promo_expert';
  title: string;
  description: string;
  icon: string; // Emoji ou nom d'icône
  earnedAt: Date;
}

export interface Campaign {
  id: string;
  userId: string;
  title: string;
  description: string;
  posts: {
    google?: Post;
    facebook?: Post;
    story?: {
      content: string;
      visualUrl?: string;
    };
    banner?: {
      title: string;
      content: string;
      visualUrl?: string;
    };
  };
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  type: 'post' | 'promotion' | 'event' | 'holiday';
  date: Date;
  description?: string;
  postId?: string;
  promotionId?: string;
}
