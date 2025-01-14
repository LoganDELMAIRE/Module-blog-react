import React from 'react';
import styles from '../styles/Admin.module.css';
import ThemeSettings from './ThemeSettings';

const SettingsPanel = () => {
  return (
    <div className={styles.settingsContainer}>
      <h2>Configuration</h2>
      
      <div className={styles.settingsGrid}>
        <div className={styles.settingsColumn}>
          <h3>Apparence</h3>
          <ThemeSettings />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 