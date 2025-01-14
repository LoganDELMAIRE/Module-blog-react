import React, { useState } from 'react';
import axios from '../utils/axios';
import styles from '../styles/Modal.module.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('The new passwords do not match');
      return;
    }

    try {
      await axios.put('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      onClose();
      alert('Password changed successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error during password change');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Modifier mon mot de passe</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Mot de passe actuel</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Annuler
            </button>
            <button type="submit" className={styles.primaryButton}>
              Modifier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 