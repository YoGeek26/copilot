import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Star, Users, TrendingUp, ArrowRight, CheckCircle, Clock, AlertCircle, Tag, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { badgeService } from '../lib/badges';
import { Post, Review, ReviewResponse, Stats, Badge } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewResponses, setReviewResponses] = useState<ReviewResponse[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [clients, setClients] = useState(0);
  const [promotions, setPromotions] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (user) {
      // Load data
      const userPosts = storage.getPosts(user.id);
      const userReviews = storage.getReviews(user.id);
      const allResponses = storage.getReviewResponses();
      const userClients = storage.getClients(user.id);
      const userPromotions = storage.getPromotions(user.id);

      setPosts(userPosts);
      setReviews(userReviews);
      setReviewResponses(allResponses);
      setClients(userClients.length);
      setPromotions(userPromotions.filter(p => p.status === 'active').length);

      // Calculate stats
      const weekStats: Stats = {
        userId: user.id,
        postsPublished: userPosts.filter(p => p.status === 'published').length,
        reviewsReceived: userReviews.length,
        reviewsAnswered: allResponses.filter(r => 
          userReviews.some(rev => rev.id === r.reviewId) && r.status === 'sent'
        ).length,
        views: Math.floor(Math.random() * 1000) + 500, // Simulated
        period: 'week',
        date: new Date()
      };
      setStats(weekStats);
      storage.createStats(weekStats);

      // Check for new badges
      badgeService.checkAndAwardBadges(user.id).then(badges => {
        setNewBadges(badges);
      });
    }
  }, [user]);

  const pendingPosts = posts.filter(p => p.status === 'draft').slice(0, 3);
  const recentReviews = reviews
    .filter(r => !reviewResponses.some(res => res.reviewId === r.id && res.status === 'sent'))
    .slice(0, 3);

  const statCards = [
    {
      title: 'Publications',
      value: stats?.postsPublished || 0,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/posts'
    },
    {
      title: 'Avis reçus',
      value: stats?.reviewsReceived || 0,
      icon: Star,
      color: 'bg-yellow-500',
      link: '/reviews'
    },
    {
      title: 'Clients',
      value: clients,
      icon: Users,
      color: 'bg-green-500',
      link: '/clients'
    },
    {
      title: 'Promos actives',
      value: promotions,
      icon: Tag,
      color: 'bg-purple-500',
      link: '/promotions'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {user?.businessName} 👋
        </h1>
        <p className="text-gray-600 mt-1">Voici un aperçu de votre activité cette semaine</p>
      </div>

      {/* New badges notification */}
      {newBadges.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            <div>
              <h3 className="font-semibold">Félicitations ! Vous avez débloqué {newBadges.length} nouveau{newBadges.length > 1 ? 'x' : ''} badge{newBadges.length > 1 ? 's' : ''} !</h3>
              <p className="text-sm text-white/90 mt-1">
                {newBadges.map(b => b.title).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Posts */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Publications à valider</h2>
          </div>
          <div className="divide-y">
            {pendingPosts.length > 0 ? (
              pendingPosts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(new Date(post.createdAt), 'dd MMM', { locale: fr })}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {post.channel === 'both' ? 'Google & Facebook' : post.channel}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/posts"
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Valider
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Toutes les publications sont à jour !</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Avis sans réponse</h2>
          </div>
          <div className="divide-y">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{review.author}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(new Date(review.date), 'dd MMM', { locale: fr })}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          {review.platform}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/reviews"
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Répondre
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Tous les avis ont une réponse !</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/posts"
            className="bg-white/20 backdrop-blur rounded-lg p-4 text-center hover:bg-white/30 transition-colors"
          >
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Créer un post</p>
          </Link>
          <Link
            to="/promotions"
            className="bg-white/20 backdrop-blur rounded-lg p-4 text-center hover:bg-white/30 transition-colors"
          >
            <Tag className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Lancer une promo</p>
          </Link>
          <Link
            to="/calendar"
            className="bg-white/20 backdrop-blur rounded-lg p-4 text-center hover:bg-white/30 transition-colors"
          >
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Voir le calendrier</p>
          </Link>
          <Link
            to="/reports"
            className="bg-white/20 backdrop-blur rounded-lg p-4 text-center hover:bg-white/30 transition-colors"
          >
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Consulter rapports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
