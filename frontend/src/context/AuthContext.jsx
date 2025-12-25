import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('wc_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (error) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('wc_token');
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, [token]);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    setToken(data.token);
    localStorage.setItem('wc_token', data.token);
    setUser(data.user);
  };

  const updateProfile = async (updates) => {
    const { data } = await api.patch('/users/me', updates);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wc_token');
  };

  const value = useMemo(
    () => ({ token, user, loading, login, logout, updateProfile }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
