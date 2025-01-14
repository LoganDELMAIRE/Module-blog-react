import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import InitialSetup from './InitialSetup';
import styles from '../styles/Admin.module.css';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const LoginForm = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkInitialSetup();
  }, []);

  const checkInitialSetup = async () => {
    try {
      const response = await axios.get('/api/blog/auth/check-setup');
      setNeedsSetup(response.data.needsSetup);
    } catch (error) {
      logger.error('Error during setup check:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      onLoginSuccess();
    } catch (error) {
      logger.error('Login error:', error);
      setError('Email or password incorrect');
    } finally {
      setLoading(false);
    }
  };

  if (needsSetup) {
    return <InitialSetup onSetupComplete={() => setNeedsSetup(false)} />;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Connexion Admin</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mot de passe</label>
            <input
              type="password"
              className={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit" 
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 