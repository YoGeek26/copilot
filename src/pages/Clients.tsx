import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { Client } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, UserPlus, Mail, Download, Upload } from 'lucide-react';

export function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = () => {
    if (user) {
      const userClients = storage.getClients(user.id);
      setClients(userClients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    const newClient: Client = {
      id: Date.now().toString(),
      userId: user.id,
      name: formData.name,
      email: formData.email,
      createdAt: new Date()
    };
    
    storage.createClient(newClient);
    loadClients();
    setFormData({ name: '', email: '' });
    setShowAddForm(false);
  };

  const exportClients = () => {
    const csv = [
      ['Nom', 'Email', 'Date d\'ajout'],
      ...clients.map(client => [
        client.name,
        client.email,
        format(new Date(client.createdAt), 'dd/MM/yyyy', { locale: fr })
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base clients</h1>
          <p className="text-gray-600 mt-1">Gérez vos contacts pour les newsletters</p>
        </div>
        <div className="flex gap-2">
          {clients.length > 0 && (
            <button
              onClick={exportClients}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              <Download className="h-5 w-5" />
              Exporter CSV
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Ajouter un client
          </button>
        </div>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau client</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Jean Dupont"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="jean@exemple.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', email: '' });
                  setErrors({});
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h3>
          <p className="text-gray-600 mb-6">Commencez à construire votre base de contacts</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Ajouter votre premier client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
              </p>
              <button className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <Upload className="h-4 w-4" />
                Importer CSV
              </button>
            </div>
          </div>
          <div className="divide-y">
            {clients.map((client) => (
              <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{client.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </span>
                      <span className="text-sm text-gray-500">
                        Ajouté le {format(new Date(client.createdAt), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Preview */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Newsletter automatique</h2>
        <p className="text-white/90 mb-4">
          Une newsletter est envoyée automatiquement chaque mois à vos {clients.length} clients avec vos dernières actualités
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-5 w-5" />
          <span>Prochaine newsletter : 1er {format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMMM', { locale: fr })}</span>
        </div>
      </div>
    </div>
  );
}
