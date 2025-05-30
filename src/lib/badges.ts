// Badge management system
import { storage } from './storage';
import { Badge, User, Stats } from '../types';

export class BadgeService {
  // Définition des badges disponibles
  private badgeDefinitions = {
    regular_poster: {
      title: 'Publicitaire régulier',
      description: 'Publie au moins 1 post par semaine pendant 4 semaines',
      icon: '📝',
      check: (stats: Stats[]) => {
        const lastMonth = stats.filter(s => s.period === 'week').slice(0, 4);
        return lastMonth.length === 4 && lastMonth.every(s => s.postsPublished >= 1);
      }
    },
    review_master: {
      title: 'Maître des avis',
      description: 'A répondu à 100% des avis pendant 30 jours',
      icon: '💬',
      check: (stats: Stats[]) => {
        const lastMonth = stats.filter(s => s.period === 'week').slice(0, 4);
        return lastMonth.every(s => s.reviewsReceived === 0 || s.reviewsAnswered === s.reviewsReceived);
      }
    },
    top_rated: {
      title: 'Top évaluation',
      description: 'Maintient une note moyenne de 4.5+ étoiles',
      icon: '⭐',
      check: (stats: Stats[], avgRating: number) => avgRating >= 4.5
    },
    engagement_star: {
      title: 'Star de l\'engagement',
      description: 'Plus de 1000 vues mensuelles',
      icon: '👀',
      check: (stats: Stats[]) => {
        const monthlyViews = stats.filter(s => s.period === 'week').slice(0, 4)
          .reduce((sum, s) => sum + s.views, 0);
        return monthlyViews >= 1000;
      }
    },
    promo_expert: {
      title: 'Expert des promos',
      description: 'A créé au moins 5 promotions',
      icon: '🎯',
      check: (stats: Stats[], user: User) => {
        const promos = storage.getPromotions(user.id);
        return promos.length >= 5;
      }
    }
  };

  // Vérifier et attribuer les badges
  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const user = storage.getUsers().find(u => u.id === userId);
    if (!user) return [];

    const existingBadges = storage.getBadges(userId);
    const stats = storage.getStats(userId);
    const reviews = storage.getReviews(userId);
    
    // Calculer la note moyenne
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    const newBadges: Badge[] = [];

    // Vérifier chaque badge
    for (const [type, definition] of Object.entries(this.badgeDefinitions)) {
      // Skip si déjà obtenu
      if (existingBadges.some(b => b.type === type as Badge['type'])) continue;

      let earned = false;
      
      if (type === 'top_rated') {
        earned = definition.check(stats, avgRating);
      } else if (type === 'promo_expert') {
        earned = definition.check(stats, user);
      } else {
        earned = definition.check(stats);
      }

      if (earned) {
        const badge: Badge = {
          id: Date.now().toString() + type,
          userId,
          type: type as Badge['type'],
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          earnedAt: new Date()
        };
        
        storage.createBadge(badge);
        newBadges.push(badge);
      }
    }

    return newBadges;
  }

  // Obtenir tous les badges d'un utilisateur
  getUserBadges(userId: string): Badge[] {
    return storage.getBadges(userId);
  }
}

export const badgeService = new BadgeService();
