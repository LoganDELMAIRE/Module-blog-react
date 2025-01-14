import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import logger from '../utils/logger';

const LanguageSettings = () => {
  const { language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguage();
  }, []);

  const fetchLanguage = async () => {
    try {
      const response = await axios.get('/api/blog/settings/language');
      if (response.data.language) {
        setSelectedLanguage(response.data.language);
      }
    } catch (error) {
      logger.error('Error during language retrieval:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;
    try {
      await axios.put('/api/blog/settings/language', { language: newLanguage });
      setSelectedLanguage(newLanguage);
      if (typeof setLanguage === 'function') {
        setLanguage(newLanguage);
      }
    } catch (error) {
      logger.error('Error during language change:', error);
      alert(getTranslation(language, 'settings.language_error'));
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className={styles.settingsContent}>
      <div className={styles.languageSettings}>
        <h3>{getTranslation(language, 'settings.language')}</h3>
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className={styles.select}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
          <option value="ru">Русский</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSettings; 