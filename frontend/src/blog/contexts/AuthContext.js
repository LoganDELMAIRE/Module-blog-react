import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('blogToken');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/blog/auth/me');
          setCurrentUser(response.data);
        } catch (error) {
          logger.error('Error during verification:', error);
          localStorage.removeItem('blogToken');
          delete axios.defaults.headers.common['Authorization'];
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/api/blog/auth/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('blogToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const userResponse = await axios.get('/api/blog/auth/me');
    setCurrentUser(userResponse.data);
  };

  const logout = () => {
    localStorage.removeItem('blogToken');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 