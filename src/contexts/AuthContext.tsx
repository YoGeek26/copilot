import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, businessName: string, sector: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userId = storage.getCurrentUserId();
    if (userId) {
      const users = storage.getUsers();
      const currentUser = users.find(u => u.id === userId);
      if (currentUser) {
        setUser(currentUser);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = storage.getUserByEmail(email);
    if (foundUser && foundUser.password === password) {
      storage.setCurrentUser(foundUser.id);
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, businessName: string, sector: string): Promise<boolean> => {
    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      businessName,
      sector,
      tone: 'professionnel',
      createdAt: new Date()
    };

    storage.createUser(newUser);
    storage.setCurrentUser(newUser.id);
    setUser(newUser);

    // Create free subscription
    storage.setSubscription({
      userId: newUser.id,
      plan: 'free',
      status: 'active'
    });

    return true;
  };

  const logout = () => {
    storage.clearSession();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      storage.updateUser(user.id, updates);
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
