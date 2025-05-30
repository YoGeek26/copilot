import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { aiService } from '../lib/ai';
import { Promotion } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tag, Calendar, Sparkles, Eye, Copy, CheckCircle } from 'lucide-react';

export function Promotions() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    discount: '',
    description: '',
    duration: 7 // jours
  });

  useEffect(() => {
    if (user) {
      loadPromotions();
    }
  }, [user]);

  const loadPromotions = () => {
    if (user) {
      const userPromotions = storage.getPromotions(user.id);
      setPromotions(userPromotions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleCreatePromotion = async () => {
    if (!user || !formData.discount || !formData.description) return;

    setLoading(true);
    try {
      const generated = await aiService.generatePromotion(user, {
        discount: formData.discount,
        description: formData.description
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + formData.duration);

      const promotion: Promotion = {
        id: Date.now().toString(),
        userId: user.id,
        title: generated.title || `Promo ${formData.discount}`,
        description: formData.description,
        discount: formData.discount,
        startDate,
        endDate,
        posts: generated.posts|| {},
        visualSuggestion: generated.visualSuggestion || '',
        status: 'draft',
        createdAt: new Date()
      };

      storage.createPromotion(promotion);
      loadPromotions();
      setShowCreateForm(false);
      setFormData({ discount: '', description: '', duration: 7 });
    } finally {
      setLoading(false);
    }
  };

  const activatePromotion = (promotionId: string) => {
    storage.updatePromotion(promotionId, { status: 'active' });
    loadPromotions();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions spéciales</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos offres promotionnelles</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Tag className="h-5 w-5" />
          Créer une promo
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle promotion</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Réduction / Offre
              </label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="Ex: -20%, 2+1 gratuit, 10€ offerts"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: toute la collection été, tous les soins du visage..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée (jours)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={3}>3 jours</option>
                <option value={7}>1 semaine</option>
                <option value={14}>2 semaines</option>
                <option value={30}>1 mois</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreatePromotion}
                disabled={loading || !formData.discount || !formData.description}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Génération...' : 'Générer la promo'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ discount: '', description: '', duration: 7 });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des promotions */}
      <div className="space-y-4">
        {promotions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune promotion</h3>
            <p className="text-gray-600 mb-6">Créez votre première offre spéciale</p>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{promo.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        promo.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : promo.status === 'ended'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {promo.status === 'active' ? 'Active' : promo.status === 'ended' ? 'Terminée' : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-gray-600">{promo.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Du {format(new Date(promo.startDate), 'dd MMM', { locale: fr })} au {format(new Date(promo.endDate), 'dd MMM', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {promo.discount}
                  </div>
                </div>

                {/* Suggestion visuelle */}
                {promo.visualSuggestion && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-purple-800 mb-1">🎨 Suggestion visuelle</p>
                    <p className="text-sm text-purple-700">{promo.visualSuggestion}</p>
                  </div>
                )}

                {/* Posts générés */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {promo.posts.google && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Post Google</h4>
                        <button
                          onClick={() => copyToClipboard(promo.posts.google!, `google-${promo.id}`)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copied === `google-${promo.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{promo.posts.google}</p>
                    </div>
                  )}
                  {promo.posts.facebook && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Post Facebook</h4>
                        <button
                          onClick={() => copyToClipboard(promo.posts.facebook!, `facebook-${promo.id}`)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copied === `facebook-${promo.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{promo.posts.facebook}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {promo.status === 'draft' && (
                  <button
                    onClick={() => activatePromotion(promo.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Activer la promotion
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
