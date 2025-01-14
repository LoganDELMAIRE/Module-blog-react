import React, { useState } from 'react';
import styles from '../styles/Modal.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';

const CategoryModal = ({ isOpen, onClose, onSubmit, category }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault(); 
    onSubmit(formData, !!category);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{category ? getTranslation(language, 'form_category.edit_category') : getTranslation(language, 'form_category.new_category')}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'form_category.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'form_category.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              {getTranslation(language, 'form_category.cancel')}
            </button>
            <button type="submit" className={styles.primaryButton}>
              {category ? getTranslation(language, 'form_category.edit') : getTranslation(language, 'form_category.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;