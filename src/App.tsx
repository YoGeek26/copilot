import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Posts } from './pages/Posts';
import { Reviews } from './pages/Reviews';
import { Clients } from './pages/Clients';
import { Settings } from './pages/Settings';
import { storage } from './lib/storage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize demo account if no users exist
    const users = storage.getUsers();
    if (users.length === 0) {
      storage.createUser({
        id: 'demo',
        email: 'demo@example.com',
        password: 'password123',
        businessName: 'Ma Boutique Demo',
        sector: 'boutique',
        tone: 'amical',
        primaryColor: '#6366f1',
        createdAt: new Date()
      });
      
      storage.setSubscription({
        userId: 'demo',
        plan: 'free',
        status: 'active'
      });
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
