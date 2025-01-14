import React from 'react';
import styles from '../styles/Admin.module.css';
import LanguageSettings from './LanguageSettings';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';

const LanguagePanel = () => {
  const { language } = useLanguage();

  return (
    <div className={styles.settingsContainer}>
      <h2>{getTranslation(language, 'settings.language')}</h2>
      
      <div className={styles.settingsGrid}>
        <div className={styles.settingsColumn}>
          <h3>{getTranslation(language, 'settings.language_settings')}</h3>
          <LanguageSettings />
          <p>{getTranslation(language, 'settings.language_help_text')}</p>
        </div>
      </div>
    </div>
  );
};

export default LanguagePanel;
