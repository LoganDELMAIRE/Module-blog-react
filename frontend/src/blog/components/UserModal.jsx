import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import styles from '../styles/Modal.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import logger from '../utils/logger';

const UserModal = ({ isOpen, onClose, onSubmit, user }) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSuperAdmin = currentUser?.role?.name === 'super_admin';
  const isAdmin = currentUser?.role?.name === 'admin';

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get('/api/blog/roles');
      let availableRoles = response.data;

      
      if (!isSuperAdmin) {
        if (isAdmin) {
          
          availableRoles = availableRoles.filter(role => role.name !== 'super_admin');
        } else {
          
          availableRoles = availableRoles.filter(role => 
            !['super_admin', 'admin', 'moderator'].includes(role.name)
          );
        }
      }

      setRoles(availableRoles);
      setLoading(false);
    } catch (error) {
      logger.error('Error during roles loading:', error);
      setError('Error during roles loading');
      setLoading(false);
    }
  }, [isSuperAdmin, isAdmin]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role._id
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: ''
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) {
      setError('Please select a role');
      return;
    }
    onSubmit(formData, !!user);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{getTranslation(language, 'users_form.users_form')}</h2>
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'users_form.username')}</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'users_form.email')}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'users_form.password')}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required={!user}
              autoComplete={user ? 'new-password' : 'current-password'}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'users_form.role')}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
              disabled={loading || (!isSuperAdmin && user?.role?.name === 'super_admin')}
              className={styles.select}
            >
              <option value="">{getTranslation(language, 'users_form.select_role')}</option>
              {roles.map(role => (
                <option 
                  key={role._id} 
                  value={role._id}
                  className={styles[`role-${role.name}`]}
                >
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              {getTranslation(language, 'users_form.cancel')}
            </button>
            <button type="submit" className={styles.primaryButton}>
              {user ? getTranslation(language, 'users_form.edit') : getTranslation(language, 'users_form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal; 