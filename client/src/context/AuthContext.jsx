import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lifelink_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('lifelink_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[Auth] Session validation failed:', err.message);
          localStorage.removeItem('lifelink_token');
          localStorage.removeItem('lifelink_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('lifelink_token', res.token);
      localStorage.setItem('lifelink_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('lifelink_token', res.token);
      localStorage.setItem('lifelink_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const updateProfile = async (updates) => {
    const res = await api.auth.updateProfile(updates);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('lifelink_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('lifelink_token');
      localStorage.removeItem('lifelink_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isReviewer: user?.role === 'reviewer' || user?.role === 'admin',
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
