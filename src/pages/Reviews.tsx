import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { aiService } from '../lib/ai';
import { Review, ReviewResponse } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Star, MessageSquare, CheckCircle, Clock, Sparkles, Send } from 'lucide-react';

export function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [generatingResponse, setGeneratingResponse] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (user) {
      loadReviews();
      // Simulate receiving new reviews
      simulateNewReviews();
    }
  }, [user]);

  const loadReviews = () => {
    if (user) {
      const userReviews = storage.getReviews(user.id);
      const allResponses = storage.getReviewResponses();
      setReviews(userReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setResponses(allResponses);
    }
  };

  const simulateNewReviews = () => {
    if (!user) return;
    
    // Check if we already have reviews
    const existingReviews = storage.getReviews(user.id);
    if (existingReviews.length > 0) return;

    // Add some sample reviews
    const sampleReviews: Review[] = [
      {
        id: '1',
        userId: user.id,
        content: 'Service excellent et personnel très accueillant. Je recommande vivement !',
        author: 'Marie Dupont',
        rating: 5,
        date: new Date(Date.now() - 86400000), // 1 day ago
        platform: 'google'
      },
      {
        id: '2',
        userId: user.id,
        content: 'Bonne expérience dans l\'ensemble, mais le temps d\'attente était un peu long.',
        author: 'Jean Martin',
        rating: 3,
        date: new Date(Date.now() - 172800000), // 2 days ago
        platform: 'google'
      },
      {
        id: '3',
        userId: user.id,
        content: 'Parfait ! Exactement ce que je cherchais. Merci beaucoup !',
        author: 'Sophie Bernard',
        rating: 5,
        date: new Date(Date.now() - 259200000), // 3 days ago
        platform: 'facebook'
      }
    ];

    sampleReviews.forEach(review => storage.createReview(review));
    loadReviews();
  };

  const generateResponse = async (review: Review) => {
    if (!user) return;
    
    setGeneratingResponse(review.id);
    try {
      const aiResponse = await aiService.generateReviewResponse(review, user);
      
      const response: ReviewResponse = {
        id: Date.now().toString(),
        reviewId: review.id,
        response: aiResponse,
        status: 'pending',
        createdAt: new Date()
      };
      
      storage.createReviewResponse(response);
      loadReviews();
      
      // Start editing immediately
      setEditingResponse(response.id);
      setEditContent(aiResponse);
    } finally {
      setGeneratingResponse(null);
    }
  };

  const saveResponse = (responseId: string) => {
    storage.updateReviewResponse(responseId, { 
      response: editContent,
      status: 'approved' 
    });
    setEditingResponse(null);
    loadReviews();
  };

  const sendResponse = (responseId: string) => {
    storage.updateReviewResponse(responseId, { status: 'sent' });
    loadReviews();
  };

  const getResponseForReview = (reviewId: string) => {
    return responses.find(r => r.reviewId === reviewId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avis clients</h1>
        <p className="text-gray-600 mt-1">Répondez aux avis de vos clients avec l'aide de l'IA</p>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h3>
            <p className="text-gray-600">Les avis de vos clients apparaîtront ici</p>
          </div>
        ) : (
          reviews.map((review) => {
            const response = getResponseForReview(review.id);
            const isGenerating = generatingResponse === review.id;
            
            return (
              <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.author}</h3>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          {review.platform}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(review.date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    {response?.status === 'sent' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Répondu
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <p className="text-gray-700 mb-4">{review.content}</p>

                  {/* Response Section */}
                  {response ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Votre réponse</p>
                        {response.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="h-3 w-3" />
                            En attente
                          </span>
                        )}
                      </div>
                      
                      {editingResponse === response.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveResponse(response.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEditingResponse(null)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600 text-sm mb-3">{response.response}</p>
                          {response.status !== 'sent' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => sendResponse(response.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                              >
                                <Send className="h-4 w-4" />
                                Envoyer
                              </button>
                              <button
                                onClick={() => {
                                  setEditingResponse(response.id);
                                  setEditContent(response.response);
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                              >
                                Modifier
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => generateResponse(review)}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isGenerating ? 'Génération...' : 'Générer une réponse'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
