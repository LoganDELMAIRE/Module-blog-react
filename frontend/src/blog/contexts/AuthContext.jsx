import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';
import logger from '../utils/logger';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('blogToken');
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/blog/auth/me');
        if (response.data) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        logger.error('Error during auth verification:', error); 
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/api/blog/auth/login', { email, password });
    const { token, expiresIn } = response.data;
    
    localStorage.setItem('blogToken', token);
    localStorage.setItem('blogTokenExpires', new Date(Date.now() + expiresIn).toISOString());
    
    const userResponse = await axios.get('/api/blog/auth/me');
    setCurrentUser(userResponse.data);
    
    return userResponse.data;
  };

  const logout = () => {
    localStorage.removeItem('blogToken');
    localStorage.removeItem('blogTokenExpires');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 