// Simulated AI service for content generation
import { User, Post, Review } from '../types';

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
