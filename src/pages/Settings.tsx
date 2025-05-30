import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { badgeService } from '../lib/badges';
import { Badge } from '../types';
import { Palette, Type, Building, CreditCard, CheckCircle, Award, Trophy } from 'lucide-react';

export function Settings() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    sector: user?.sector || '',
    primaryColor: user?.primaryColor || '#6366f1',
    tone: user?.tone || 'professionnel',
    logo: user?.logo || ''
  });
  const [saved, setSaved] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const subscription = user ? storage.getSubscription(user.id) : null;

  React.useEffect(() => {
    if (user) {
      const userBadges = badgeService.getUserBadges(user.id);
      setBadges(userBadges);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      features: ['1 post par semaine', '5 réponses aux avis', 'Mini-site basique'],
      current: subscription?.plan === 'free'
    },
    {
      name: 'Essentiel',
      price: '29€/mois',
      features: ['Posts illimités', 'Réponses illimitées', 'Newsletter mensuelle', 'Statistiques détaillées'],
      current: subscription?.plan === 'essential',
      recommended: true
    },
    {
      name: 'Pro',
      price: '59€/mois',
      features: ['Tout Essentiel +', 'Multi-plateformes', 'IA personnalisée', 'Support prioritaire'],
      current: subscription?.plan === 'pro'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configurez votre entreprise et votre abonnement</p>
      </div>

      {/* Business Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations de l'entreprise</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                <Building className="inline h-4 w-4 mr-1" />
                Nom de l'entreprise
              </label>
              <input
                type="text"
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                Secteur d'activité
              </label>
              <select
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="restaurant">Restaurant / Café</option>
                <option value="boutique">Boutique / Commerce</option>
                <option value="service">Service / Artisanat</option>
              </select>
            </div>

            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                <Palette className="inline h-4 w-4 mr-1" />
                Couleur principale
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                <Type className="inline h-4 w-4 mr-1" />
                Ton de communication
              </label>
              <select
                id="tone"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="professionnel">Professionnel</option>
                <option value="amical">Amical</option>
                <option value="dynamique">Dynamique</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Enregistrer
            </button>
            {saved && (
              <span className="inline-flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Modifications enregistrées
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          <Trophy className="inline h-5 w-5 mr-2" />
          Vos badges de performance
        </h2>
        
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun badge obtenu pour le moment</p>
            <p className="text-sm text-gray-500 mt-1">Continuez à utiliser l'application pour débloquer des badges !</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{badge.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Obtenu le {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          <CreditCard className="inline h-5 w-5 mr-2" />
          Abonnement
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border-2 p-6 ${
                plan.current
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                  Recommandé
                </span>
              )}
              
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{plan.price}</p>
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Plan actuel' : 'Choisir ce plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
