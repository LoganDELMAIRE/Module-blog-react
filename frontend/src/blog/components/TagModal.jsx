import React, { useState } from 'react';
import styles from '../styles/Modal.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';

const TagModal = ({ isOpen, onClose, onSubmit, tag }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: tag?.name || '',
    description: tag?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, !!tag);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{tag ? getTranslation(language, 'form_tag.edit_tag') : getTranslation(language, 'form_tag.new_tag')}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'form_tag.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label>{getTranslation(language, 'form_tag.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              {getTranslation(language, 'form_tag.cancel')}
            </button>
            <button type="submit" className={styles.primaryButton}>
              {tag ? getTranslation(language, 'form_tag.edit') : getTranslation(language, 'form_tag.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagModal; 