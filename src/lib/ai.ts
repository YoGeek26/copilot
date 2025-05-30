// Simulated AI service for content generation
import { User, Post, Review, Promotion, MonthlyReport, Campaign } from '../types';

export class AIService {
  // Simulate AI post generation
  async generatePost(user: User, theme?: string): Promise<Partial<Post>> {
    // In production, this would call Claude API
    const seasons = ['printemps', 'été', 'automne', 'hiver'];
    const currentSeason = seasons[Math.floor(new Date().getMonth() / 3)];
    
    const tones = {
      professionnel: 'Nous sommes ravis de',
      amical: 'Hello ! On est super contents de',
      dynamique: '🎉 Grande nouvelle !'
    };

    const sectors = {
      restaurant: {
        title: `Menu spécial ${currentSeason}`,
        content: `${tones[user.tone || 'professionnel']} vous présenter notre nouveau menu de saison. Des produits frais et locaux pour ravir vos papilles !`,
        visual: 'Photo d\'un plat coloré de saison'
      },
      boutique: {
        title: `Collection ${currentSeason} disponible`,
        content: `${tones[user.tone || 'professionnel']} vous annoncer l'arrivée de notre nouvelle collection. Venez découvrir nos dernières nouveautés en magasin !`,
        visual: 'Vitrine avec les nouveaux produits'
      },
      service: {
        title: `Offre spéciale ${currentSeason}`,
        content: `${tones[user.tone || 'professionnel']} vous proposer une offre exceptionnelle ce mois-ci. Profitez de -20% sur nos prestations !`,
        visual: 'Image promotionnelle avec le pourcentage de réduction'
      }
    };

    const sectorContent = sectors[user.sector as keyof typeof sectors] || sectors.service;

    return {
      title: theme || sectorContent.title,
      content: sectorContent.content,
      visualSuggestion: sectorContent.visual,
      channel: 'both' as const
    };
  }

  // Simulate AI review response generation
  async generateReviewResponse(review: Review, user: User): Promise<string> {
    const tones = {
      professionnel: {
        positive: `Nous vous remercions sincèrement pour votre avis positif. Votre satisfaction est notre priorité et nous sommes ravis que vous ayez apprécié votre expérience chez ${user.businessName}.`,
        negative: `Nous vous remercions d'avoir pris le temps de partager votre expérience. Nous sommes désolés que celle-ci n'ait pas été à la hauteur de vos attentes. Nous prenons note de vos remarques pour améliorer nos services.`
      },
      amical: {
        positive: `Merci beaucoup pour ce super retour ! 😊 Ça nous fait vraiment plaisir de savoir que vous avez passé un bon moment chez ${user.businessName}. À très bientôt !`,
        negative: `Merci d'avoir partagé votre avis. On est vraiment désolés que votre expérience n'ait pas été top. On prend note et on va faire notre maximum pour s'améliorer !`
      },
      dynamique: {
        positive: `WOW ! 🌟 Merci pour ce retour incroyable ! L'équipe ${user.businessName} est aux anges ! On a hâte de vous revoir !`,
        negative: `Oups ! 😔 On est vraiment désolés pour cette expérience. Merci de nous avoir fait part de vos remarques, on va tout faire pour que ça n'arrive plus !`
      }
    };

    const tone = user.tone || 'professionnel';
    const sentiment = review.rating >= 4 ? 'positive' : 'negative';
    
    return tones[tone][sentiment];
  }

  // V3: Generate promotion content
  async generatePromotion(user: User, promoDetails: { discount: string; description: string }): Promise<Partial<Promotion>> {
    const tones = {
      professionnel: {
        prefix: '🎯 Offre exclusive',
        suffix: 'Conditions en magasin.'
      },
      amical: {
        prefix: '🎉 Super promo',
        suffix: 'On vous attend !'
      },
      dynamique: {
        prefix: '💥 PROMO FLASH',
        suffix: 'Foncez, c\'est maintenant !'
      }
    };

    const tone = tones[user.tone || 'professionnel'];
    
    const googlePost = `${tone.prefix} chez ${user.businessName} !\n\n${promoDetails.discount} sur ${promoDetails.description}\n\n📍 Venez nous voir en magasin\n⏰ Offre limitée\n\n${tone.suffix}`;
    
    const facebookPost = `${tone.prefix} ! 🛍️\n\n${user.businessName} vous offre ${promoDetails.discount} sur ${promoDetails.description} !\n\n✨ Une occasion à ne pas manquer\n📅 Valable cette semaine seulement\n\n${tone.suffix}\n\n#promo #${user.sector} #bonplan`;

    return {
      title: `Promo ${promoDetails.discount}`,
      description: promoDetails.description,
      discount: promoDetails.discount,
      posts: {
        google: googlePost,
        facebook: facebookPost
      },
      visualSuggestion: `Visuel avec "${promoDetails.discount}" en grand, fond aux couleurs de la marque, photo du produit/service`,
      status: 'draft'
    };
  }

  // V3: Generate monthly report
  async generateMonthlyReport(user: User, metrics: MonthlyReport['metrics']): Promise<{ summary: string; recommendations: string[] }> {
    const performance = metrics.avgRating >= 4.5 ? 'excellente' : metrics.avgRating >= 4 ? 'bonne' : 'à améliorer';
    const postFrequency = metrics.postsPublished >= 8 ? 'très active' : metrics.postsPublished >= 4 ? 'régulière' : 'insuffisante';
    
    const summary = `Ce mois-ci, ${user.businessName} a maintenu une présence ${postFrequency} avec ${metrics.postsPublished} publications. 
    Vous avez reçu ${metrics.reviewsReceived} nouveaux avis (note moyenne: ${metrics.avgRating.toFixed(1)}/5) et répondu à ${metrics.reviewsAnswered} d'entre eux.
    Votre fiche a généré ${metrics.views} vues, ${metrics.views > 500 ? 'un excellent résultat' : 'avec une marge de progression'}.
    ${metrics.clientsAdded} nouveaux clients ont rejoint votre base de données.`;

    const recommendations = [];
    
    if (metrics.postsPublished < 4) {
      recommendations.push('📝 Augmentez votre fréquence de publication à au moins 1 post par semaine');
    }
    
    if (metrics.reviewsAnswered < metrics.reviewsReceived) {
      recommendations.push('💬 Répondez à tous les avis clients pour améliorer votre engagement');
    }
    
    if (metrics.avgRating < 4.5) {
      recommendations.push('⭐ Encouragez vos clients satisfaits à laisser des avis positifs');
    }
    
    if (metrics.views < 300) {
      recommendations.push('👀 Optimisez vos posts avec des mots-clés locaux pour augmenter votre visibilité');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('🎯 Continuez sur cette lancée ! Testez des promotions pour booster encore plus votre activité');
    }

    return { summary, recommendations };
  }

  // V3: Generate campaign content
  async generateCampaign(user: User, info: string): Promise<Partial<Campaign>> {
    const tones = {
      professionnel: 'Découvrez',
      amical: 'On a une surprise pour vous',
      dynamique: 'NOUVEAU'
    };

    const tone = user.tone || 'professionnel';
    const intro = tones[tone];

    const googlePost: Partial<Post> = {
      title: `${intro} : ${info}`,
      content: `${user.businessName} est heureux de vous annoncer : ${info}.\n\nVenez découvrir cette nouveauté en magasin !`,
      channel: 'google',
      visualSuggestion: 'Photo du nouveau produit/service en situation'
    };

    const facebookPost: Partial<Post> = {
      title: `${intro} ! ${info}`,
      content: `🎉 ${intro} !\n\n${info} est maintenant disponible chez ${user.businessName} !\n\nVenez vite le découvrir, on vous attend avec impatience 😊\n\n#nouveauté #${user.sector}`,
      channel: 'facebook',
      visualSuggestion: 'Photo lifestyle avec le produit/service mis en valeur'
    };

    const story = {
      content: `${intro.toUpperCase()}\n\n${info}\n\n👇 Swipe up`,
      visualUrl: '' // Placeholder pour l'image générée
    };

    const banner = {
      title: info,
      content: `Nouveauté disponible dès maintenant !`,
      visualUrl: '' // Placeholder pour la bannière
    };

    return {
      title: info,
      description: `Campagne pour annoncer : ${info}`,
      posts: {
        google: googlePost as Post,
        facebook: facebookPost as Post,
        story,
        banner
      },
      status: 'draft'
    };
  }

  // Simulate newsletter generation
  async generateNewsletter(user: User, clients: number): Promise<{ subject: string; content: string }> {
    const month = new Date().toLocaleDateString('fr-FR', { month: 'long' });
    
    return {
      subject: `Les nouvelles de ${user.businessName} - ${month}`,
      content: `
Bonjour,

Ce mois-ci chez ${user.businessName}, nous avons le plaisir de partager avec vous nos dernières actualités.

**Nos horaires**
Nous sommes ouverts du lundi au samedi, venez nous rendre visite !

**Événement du mois**
Ne manquez pas notre événement spécial ce mois-ci. Plus d'informations en magasin.

**Offre exclusive**
En tant que client fidèle, bénéficiez de 10% de réduction sur votre prochain achat.

À très bientôt !
L'équipe ${user.businessName}
      `.trim()
    };
  }
}

export const aiService = new AIService();
