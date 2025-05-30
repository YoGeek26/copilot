import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Star, Users, Settings, LogOut, Menu, X, Tag, FileBarChart, Calendar, Megaphone, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { badgeService } from '../lib/badges';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [badges, setBadges] = React.useState<number>(0);

  React.useEffect(() => {
    if (user) {
      // Vérifier les badges
      badgeService.checkAndAwardBadges(user.id).then(newBadges => {
        const allBadges = badgeService.getUserBadges(user.id);
        setBadges(allBadges.length);
      });
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Publications', href: '/posts', icon: FileText },
    { name: 'Avis clients', href: '/reviews', icon: Star },
    { name: 'Base clients', href: '/clients', icon: Users },
    { name: 'Promotions', href: '/promotions', icon: Tag, isNew: true },
    { name: 'Rapports', href: '/reports', icon: FileBarChart, isNew: true },
    { name: 'Calendrier', href: '/calendar', icon: Calendar, isNew: true },
    { name: 'Campagnes', href: '/campaigns', icon: Megaphone, isNew: true },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
        <nav className="fixed top-0 left-0 bottom-0 flex w-5/6 max-w-sm flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{user?.businessName}</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.isNew && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Nouveau
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="border-t p-4">
            {badges > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-purple-50 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">{badges} badges obtenus</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <nav className="flex flex-1 flex-col bg-white border-r">
          <div className="flex h-16 items-center px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Mon Copilote Digital</h1>
          </div>
          <div className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.isNew && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Nouveau
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="border-t p-4">
            <div className="mb-4 px-3">
              <p className="text-sm font-medium text-gray-900">{user?.businessName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              {badges > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">{badges} badges</span>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-500 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Mon Copilote Digital</h1>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
