import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { aiService } from '../lib/ai';
import { Campaign, Post } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Megaphone, Sparkles, Image, FileText, Copy, CheckCircle } from 'lucide-react';

export function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ info: '' });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = () => {
    if (user) {
      const userCampaigns = storage.getCampaigns(user.id);
      setCampaigns(userCampaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleCreateCampaign = async () => {
    if (!user || !formData.info) return;

    setLoading(true);
    try {
      const generated = await aiService.generateCampaign(user, formData.info);
      
      const campaign: Campaign = {
        id: Date.now().toString(),
        userId: user.id,
        title: generated.title || formData.info,
        description: generated.description || '',
        posts: generated.posts || {},
        status: 'draft',
        createdAt: new Date()
      };

      storage.createCampaign(campaign);
      loadCampaigns();
      setShowCreateForm(false);
      setFormData({ info: '' });
    } finally {
      setLoading(false);
    }
  };

  const activateCampaign = (campaignId: string) => {
    storage.updateCampaign(campaignId, { status: 'active' });
    
    // Créer les posts associés
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign && user) {
      if (campaign.posts.google) {
        const googlePost: Post = {
          ...campaign.posts.google,
          id: Date.now().toString() + '-google',
          userId: user.id,
          campaignId: campaign.id,
          status: 'draft',
          publishDate: new Date(),
          createdAt: new Date()
        };
        storage.createPost(googlePost);
      }
      
      if (campaign.posts.facebook) {
        const fbPost: Post = {
          ...campaign.posts.facebook,
          id: Date.now().toString() + '-fb',
          userId: user.id,
          campaignId: campaign.id,
          status: 'draft',
          publishDate: new Date(),
          createdAt: new Date()
        };
        storage.createPost(fbPost);
      }
    }
    
    loadCampaigns();
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
          <h1 className="text-2xl font-bold text-gray-900">Campagnes multicanal</h1>
          <p className="text-gray-600 mt-1">Créez des campagnes complètes en un clic</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Megaphone className="h-5 w-5" />
          Nouvelle campagne
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Créer une campagne</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qu'est-ce que vous voulez annoncer ?
              </label>
              <textarea
                value={formData.info}
                onChange={(e) => setFormData({ info: e.target.value })}
                placeholder="Ex: Nouveau soin anti-âge disponible, Ouverture le dimanche, Menu spécial été..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateCampaign}
                disabled={loading || !formData.info}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Génération...' : 'Générer la campagne'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ info: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des campagnes */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne</h3>
            <p className="text-gray-600 mb-6">Créez votre première campagne multicanal</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                    <p className="text-gray-600 mt-1">{campaign.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Créée le {format(new Date(campaign.createdAt), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : campaign.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {campaign.status === 'active' ? 'Active' : campaign.status === 'completed' ? 'Terminée' : 'Brouillon'}
                  </span>
                </div>

                {/* Contenu généré */}
                <div className="space-y-4">
                  {/* Posts */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {campaign.posts.google && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Post Google
                          </h4>
                          <button
                            onClick={() => copyToClipboard(campaign.posts.google!.content, `google-${campaign.id}`)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copied === `google-${campaign.id}` ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{campaign.posts.google.content}</p>
                      </div>
                    )}
                    {campaign.posts.facebook && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Post Facebook
                          </h4>
                          <button
                            onClick={() => copyToClipboard(campaign.posts.facebook!.content, `facebook-${campaign.id}`)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copied === `facebook-${campaign.id}` ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{campaign.posts.facebook.content}</p>
                      </div>
                    )}
                  </div>

                  {/* Story et bannière */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {campaign.posts.story && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4" />
                          Story (format vertical)
                        </h4>
                        <p className="text-sm text-purple-700">{campaign.posts.story.content}</p>
                        <p className="text-xs text-purple-600 mt-2">💡 Format 9:16 recommandé</p>
                      </div>
                    )}
                    {campaign.posts.banner && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4" />
                          Bannière site web
                        </h4>
                        <p className="text-sm font-semibold text-blue-800">{campaign.posts.banner.title}</p>
                        <p className="text-sm text-blue-700">{campaign.posts.banner.content}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {campaign.status === 'draft' && (
                  <div className="mt-6">
                    <button
                      onClick={() => activateCampaign(campaign.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Lancer la campagne
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
