import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { aiService } from '../lib/ai';
import { MonthlyReport } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, TrendingUp, Download, Calendar, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = () => {
    if (user) {
      const userReports = storage.getMonthlyReports(user.id);
      setReports(userReports.sort((a, b) => b.month.localeCompare(a.month)));
      if (userReports.length > 0 && !selectedReport) {
        setSelectedReport(userReports[0]);
      }
    }
  };

  const generateReport = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      
      // Vérifier si le rapport existe déjà
      const existingReport = storage.getMonthlyReport(user.id, currentMonth);
      if (existingReport) {
        setSelectedReport(existingReport);
        return;
      }

      // Calculer les métriques
      const posts = storage.getPosts(user.id);
      const reviews = storage.getReviews(user.id);
      const responses = storage.getReviewResponses();
      const clients = storage.getClients(user.id);
      
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
      const monthlyPosts = posts.filter(p => {
        const date = new Date(p.createdAt);
        return date >= monthStart && date <= monthEnd && p.status === 'published';
      });
      
      const monthlyReviews = reviews.filter(r => {
        const date = new Date(r.date);
        return date >= monthStart && date <= monthEnd;
      });
      
      const monthlyResponses = responses.filter(r => {
        const review = reviews.find(rev => rev.id === r.reviewId);
        return review && new Date(review.date) >= monthStart && new Date(review.date) <= monthEnd && r.status === 'sent';
      });
      
      const monthlyClients = clients.filter(c => {
        const date = new Date(c.createdAt);
        return date >= monthStart && date <= monthEnd;
      });
      
      const avgRating = monthlyReviews.length > 0
        ? monthlyReviews.reduce((sum, r) => sum + r.rating, 0) / monthlyReviews.length
        : 0;
      
      const metrics: MonthlyReport['metrics'] = {
        views: Math.floor(Math.random() * 800) + 200, // Simulé
        reviewsReceived: monthlyReviews.length,
        reviewsAnswered: monthlyResponses.length,
        postsPublished: monthlyPosts.length,
        avgRating: avgRating,
        clientsAdded: monthlyClients.length
      };
      
      // Générer le rapport avec l'IA
      const { summary, recommendations } = await aiService.generateMonthlyReport(user, metrics);
      
      // Créer le contenu HTML
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Rapport mensuel - ${format(new Date(), 'MMMM yyyy', { locale: fr })}</h1>
          <h2 style="color: #4b5563;">Résumé</h2>
          <p style="color: #6b7280; line-height: 1.6;">${summary}</p>
          <h2 style="color: #4b5563;">Métriques clés</h2>
          <ul style="color: #6b7280;">
            <li>Vues : ${metrics.views}</li>
            <li>Avis reçus : ${metrics.reviewsReceived}</li>
            <li>Avis répondus : ${metrics.reviewsAnswered}</li>
            <li>Posts publiés : ${metrics.postsPublished}</li>
            <li>Note moyenne : ${metrics.avgRating.toFixed(1)}/5</li>
            <li>Nouveaux clients : ${metrics.clientsAdded}</li>
          </ul>
          <h2 style="color: #4b5563;">Recommandations</h2>
          <ul style="color: #6b7280;">
            ${recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      `;
      
      const report: MonthlyReport = {
        id: Date.now().toString(),
        userId: user.id,
        month: currentMonth,
        metrics,
        summary,
        recommendations,
        htmlContent,
        createdAt: new Date()
      };
      
      storage.createMonthlyReport(report);
      loadReports();
      setSelectedReport(report);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (report: MonthlyReport) => {
    const blob = new Blob([report.htmlContent || ''], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${report.month}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Préparer les données pour le graphique
  const chartData = reports.slice(0, 6).reverse().map(report => ({
    month: format(new Date(report.month + '-01'), 'MMM', { locale: fr }),
    vues: report.metrics.views,
    posts: report.metrics.postsPublished * 50, // Échelle pour la visibilité
    avis: report.metrics.reviewsReceived * 100
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports mensuels</h1>
          <p className="text-gray-600 mt-1">Analysez vos performances et suivez vos progrès</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Génération...' : 'Générer le rapport du mois'}
        </button>
      </div>

      {/* Graphique de tendance */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution sur 6 mois</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="vues" stroke="#6366f1" name="Vues" strokeWidth={2} />
                <Line type="monotone" dataKey="posts" stroke="#10b981" name="Impact posts" strokeWidth={2} />
                <Line type="monotone" dataKey="avis" stroke="#f59e0b" name="Impact avis" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des rapports */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-900">Historique</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {reports.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Aucun rapport disponible</p>
                </div>
              ) : (
                reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedReport?.id === report.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(report.month + '-01'), 'MMMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {report.metrics.views} vues • {report.metrics.postsPublished} posts
                        </p>
                      </div>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Détails du rapport sélectionné */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Rapport de {format(new Date(selectedReport.month + '-01'), 'MMMM yyyy', { locale: fr })}
                </h2>
                <button
                  onClick={() => downloadReport(selectedReport)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
              </div>

              {/* Métriques */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Vues</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedReport.metrics.views}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Posts publiés</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedReport.metrics.postsPublished}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedReport.metrics.avgRating.toFixed(1)}/5</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avis reçus</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedReport.metrics.reviewsReceived}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avis répondus</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedReport.metrics.reviewsAnswered}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Nouveaux clients</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedReport.metrics.clientsAdded}</p>
                </div>
              </div>

              {/* Résumé */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Résumé</h3>
                <p className="text-gray-600 leading-relaxed">{selectedReport.summary}</p>
              </div>

              {/* Recommandations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Recommandations</h3>
                <div className="space-y-2">
                  {selectedReport.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un rapport</h3>
              <p className="text-gray-600">Choisissez un rapport dans la liste ou générez-en un nouveau</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
