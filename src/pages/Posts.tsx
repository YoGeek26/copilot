import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { aiService } from '../lib/ai';
import { Post } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Clock, CheckCircle, XCircle, Edit2, Sparkles, Calendar } from 'lucide-react';

export function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = () => {
    if (user) {
      const userPosts = storage.getPosts(user.id);
      setPosts(userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const generatePost = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const generatedContent = await aiService.generatePost(user);
      const newPost: Post = {
        id: Date.now().toString(),
        userId: user.id,
        title: generatedContent.title || 'Nouveau post',
        content: generatedContent.content || '',
        visualSuggestion: generatedContent.visualSuggestion,
        status: 'draft',
        publishDate: new Date(),
        channel: generatedContent.channel || 'both',
        createdAt: new Date()
      };
      
      storage.createPost(newPost);
      loadPosts();
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = (postId: string, status: Post['status']) => {
    storage.updatePost(postId, { status });
    loadPosts();
  };

  const startEditing = (post: Post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const saveEdit = (postId: string) => {
    storage.updatePost(postId, { content: editContent });
    setEditingPost(null);
    loadPosts();
  };

  const getStatusBadge = (status: Post['status']) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'Brouillon' },
      published: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Publié' },
      scheduled: { color: 'bg-blue-100 text-blue-700', icon: Calendar, text: 'Programmé' }
    };
    
    const badge = badges[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <badge.icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getChannelBadge = (channel: Post['channel']) => {
    const badges = {
      google: 'bg-blue-100 text-blue-700',
      facebook: 'bg-indigo-100 text-indigo-700',
      both: 'bg-purple-100 text-purple-700'
    };
    
    const text = channel === 'both' ? 'Google & Facebook' : channel === 'google' ? 'Google' : 'Facebook';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[channel]}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
          <p className="text-gray-600 mt-1">Gérez vos posts sur Google et Facebook</p>
        </div>
        <button
          onClick={generatePost}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="h-5 w-5" />
          {loading ? 'Génération...' : 'Générer un post'}
        </button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
            <p className="text-gray-600 mb-6">Commencez par générer votre première publication avec l'IA</p>
            <button
              onClick={generatePost}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              Générer un post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      {getStatusBadge(post.status)}
                      {getChannelBadge(post.channel)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Créé le {format(new Date(post.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                {editingPost === post.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(post.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingPost(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    
                    {post.visualSuggestion && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-amber-800 mb-1">💡 Suggestion visuelle</p>
                        <p className="text-sm text-amber-700">{post.visualSuggestion}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {post.status === 'draft' && (
                        <>
                          <button
                            onClick={() => updatePostStatus(post.id, 'published')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Publier
                          </button>
                          <button
                            onClick={() => startEditing(post)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
                                // In a real app, we would delete the post
                                loadPosts();
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Ignorer
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
