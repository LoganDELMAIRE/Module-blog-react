import React, { useState } from 'react';
import axios from '../utils/axios';
import styles from '../styles/InitialSetup.module.css';
import logger from '../utils/logger';

const InitialSetup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/blog/auth/setup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      window.location.reload();
    } catch (error) {
      logger.error('Error during setup:', error);
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupCard}>
        <h1>Configuration initiale du blog</h1>
        <p>Créez votre compte administrateur pour commencer</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Configuration...' : 'Configurer le blog'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialSetup; 