import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const ColorInput = ({ label, value, onChange, onReset, lastValue }) => (
  <div className={styles.colorField}>
    <label>{label}</label>
    <div className={styles.colorInputWrapper}>
      {lastValue && lastValue !== value && (
        <button 
          type="button"
          onClick={onReset}
          className={styles.resetColorButton}
          title="Restaurer la dernière couleur"
        >
          ↺
        </button>
      )}
      <input
        type="color"
        value={value}
        onChange={onChange}
        className={styles.colorInput}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e, true)}
        className={styles.colorText}
      />
    </div>
  </div>
);

const ThemeSettings = () => {
  const { language } = useLanguage();
  const { currentUser, loading: authLoading } = useAuth();
  const [colors, setColors] = useState({
    /* Couleurs de base */
    primary: '#4299e1',
    secondary: '#e2e8f0',
    accent: '#ed8936',
    
    /* Couleurs de fond */
    background_main: '#ffffff',
    background_alt: '#f7fafc',
    background_dark: '#2d3748',
    sidebar_background: '#2d3748',
    
    /* Couleurs des cartes et conteneurs */
    card_background: '#ffffff',
    card_border: '#e2e8f0',
    modal_background: '#ffffff',
    modal_overlay: 'rgba(0, 0, 0, 0.5)',
    dropdown_background: '#ffffff',
    
    /* Couleurs du texte */
    text_primary: '#2d3748',
    text_secondary: '#4a5568',
    text_light: '#ffffff',
    text_muted: '#718096',
    text_link: '#4299e1',
    text_hover: '#2b6cb0',
    sidebar_text: '#ffffff',
    
    /* Couleurs des boutons */
    button_primary_bg: '#4299e1',
    button_primary_text: '#ffffff',
    button_secondary_bg: '#e2e8f0',
    button_secondary_text: '#2d3748',
    button_danger_bg: '#e53e3e',
    button_danger_text: '#ffffff',
    
    /* Couleurs des formulaires */
    input_background: '#ffffff',
    input_border: '#e2e8f0',
    input_text: '#2d3748',
    input_placeholder: '#a0aec0',
    input_focus_border: '#4299e1',
    
    /* Couleurs de statut */
    success: '#48bb78',
    warning: '#ed8936',
    error: '#e53e3e',
    info: '#4299e1'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedColors, setLastSavedColors] = useState({});

  useEffect(() => {
    const init = async () => {
      if (currentUser && !authLoading) {
        try {
          await fetchSettings();
        } catch (error) {
          logger.error('Error during initialization:', error);
        }
      }
    };
    init();
  }, [currentUser, authLoading]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/blog/settings');
      if (response.data.colors) {
        setColors(response.data.colors);
        setLastSavedColors(response.data.colors);
        Object.entries(response.data.colors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, value);
        });
      }
    } catch (error) {
      logger.error('Error during theme loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = async (colorKey, value) => {
    try {
      const newColors = { ...colors, [colorKey]: value };
      setColors(newColors);
      
      await axios.put('/api/blog/settings', { colors: newColors });
      
      Object.entries(newColors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    } catch (error) {
      logger.error('Error during color saving:', error);
      alert('Error during color saving');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/blog/settings', { colors });
      setLastSavedColors(colors);
      alert('Theme saved successfully!');
    } catch (error) {
      logger.error('Error during theme saving:', error);
      alert('Error during theme saving');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultColors = {
        /* Couleurs de base */
    primary: '#4299e1',
    secondary: '#e2e8f0',
    accent: '#ed8936',
    
    /* Couleurs de fond */
    background_main: '#ffffff',
    background_alt: '#f7fafc',
    background_dark: '#2d3748',
    sidebar_background: '#2d3748',
    
    /* Couleurs des cartes et conteneurs */
    card_background: '#ffffff',
    card_border: '#e2e8f0',
    modal_background: '#ffffff',
    modal_overlay: 'rgba(0, 0, 0, 0.5)',
    dropdown_background: '#ffffff',
    
    /* Couleurs du texte */
    text_primary: '#2d3748',
    text_secondary: '#4a5568',
    text_light: '#ffffff',
    text_muted: '#718096',
    text_link: '#4299e1',
    text_hover: '#2b6cb0',
    sidebar_text: '#ffffff',
    
    /* Couleurs des boutons */
    button_primary_bg: '#4299e1',
    button_primary_text: '#ffffff',
    button_secondary_bg: '#e2e8f0',
    button_secondary_text: '#2d3748',
    button_danger_bg: '#e53e3e',
    button_danger_text: '#ffffff',
    
    /* Couleurs des formulaires */
    input_background: '#ffffff',
    input_border: '#e2e8f0',
    input_text: '#2d3748',
    input_placeholder: '#a0aec0',
    input_focus_border: '#4299e1',
    
    /* Couleurs de statut */
    success: '#48bb78',
    warning: '#ed8936',
    error: '#e53e3e',
    info: '#4299e1'
    };
    setColors(defaultColors);
    Object.entries(defaultColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  };

  const handleResetColor = (colorKey) => {
    if (lastSavedColors[colorKey]) {
      handleColorChange(colorKey, lastSavedColors[colorKey]);
    }
  };

  if (authLoading || loading) {
    return <div>Chargement...</div>;
  }

  if (!currentUser) {
    return <div>Non autorisé</div>;
  }

  return (
    <div className={styles.settingsContent}>
      <form onSubmit={handleSubmit}>
        <div className={styles.colorSection}>
          <h4>{getTranslation(language, 'settings.base_colors')}</h4>
          <ColorInput
            label={getTranslation(language, 'settings.primary')}
            value={colors.primary}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            onReset={() => handleResetColor('primary')}
            lastValue={lastSavedColors.primary}
          />
          <ColorInput
            label={getTranslation(language, 'settings.secondary')}
            value={colors.secondary}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            onReset={() => handleResetColor('secondary')}
            lastValue={lastSavedColors.secondary}
          />
          <ColorInput
            label={getTranslation(language, 'settings.accent')}
            value={colors.accent}
            onChange={(e) => handleColorChange('accent', e.target.value)}
            onReset={() => handleResetColor('accent')}
            lastValue={lastSavedColors.accent}
          />
        </div>

        <div className={styles.colorSection}>
          <h4>{getTranslation(language, 'settings.background_colors')}</h4>
          <ColorInput
            label={getTranslation(language, 'settings.background_main')}
            value={colors.background_main}
            onChange={(e) => handleColorChange('background_main', e.target.value)}
            onReset={() => handleResetColor('background_main')}
            lastValue={lastSavedColors.background_main}
          />
          <ColorInput
            label={getTranslation(language, 'settings.background_alt')}
            value={colors.background_alt}
            onChange={(e) => handleColorChange('background_alt', e.target.value)}
            onReset={() => handleResetColor('background_alt')}
            lastValue={lastSavedColors.background_alt}
          />
          <ColorInput
            label={getTranslation(language, 'settings.background_dark')}
            value={colors.background_dark}
            onChange={(e) => handleColorChange('background_dark', e.target.value)}
            onReset={() => handleResetColor('background_dark')}
            lastValue={lastSavedColors.background_dark}
          />
          <ColorInput
            label={getTranslation(language, 'settings.sidebar_background')}
            value={colors.sidebar_background}
            onChange={(e) => handleColorChange('sidebar_background', e.target.value)}
            onReset={() => handleResetColor('sidebar_background')}
            lastValue={lastSavedColors.sidebar_background}
          />
        </div>

        <div className={styles.colorSection}>
          <h4>{getTranslation(language, 'settings.card_colors')}</h4>
          <ColorInput
            label={getTranslation(language, 'settings.card_background')}
            value={colors.card_background}
            onChange={(e) => handleColorChange('card_background', e.target.value)}
            onReset={() => handleResetColor('card_background')}
            lastValue={lastSavedColors.card_background}
          />
          <ColorInput
            label={getTranslation(language, 'settings.card_border')}
            value={colors.card_border}
            onChange={(e) => handleColorChange('card_border', e.target.value)}
            onReset={() => handleResetColor('card_border')}
            lastValue={lastSavedColors.card_border}
          />
          <ColorInput
            label={getTranslation(language, 'settings.modal_background')}
            value={colors.modal_background}
            onChange={(e) => handleColorChange('modal_background', e.target.value)}
            onReset={() => handleResetColor('modal_background')}
            lastValue={lastSavedColors.modal_background}
          />
          <ColorInput
            label={getTranslation(language, 'settings.dropdown_background')}
            value={colors.dropdown_background}
            onChange={(e) => handleColorChange('dropdown_background', e.target.value)}
            onReset={() => handleResetColor('dropdown_background')}
            lastValue={lastSavedColors.dropdown_background}
          />
        </div>

        <div className={styles.colorSection}>
          <h4>{getTranslation(language, 'settings.text_colors')}</h4>
          <ColorInput
            label={getTranslation(language, 'settings.text_primary')}
            value={colors.text_primary}
            onChange={(e) => handleColorChange('text_primary', e.target.value)}
            onReset={() => handleResetColor('text_primary')}
            lastValue={lastSavedColors.text_primary}
          />
          <ColorInput
            label={getTranslation(language, 'settings.text_secondary')}
            value={colors.text_secondary}
            onChange={(e) => handleColorChange('text_secondary', e.target.value)}
            onReset={() => handleResetColor('text_secondary')}
            lastValue={lastSavedColors.text_secondary}
          />
          <ColorInput
            label={getTranslation(language, 'settings.text_light')}
            value={colors.text_light}
            onChange={(e) => handleColorChange('text_light', e.target.value)}
            onReset={() => handleResetColor('text_light')}
            lastValue={lastSavedColors.text_light}
          />
          <ColorInput
            label={getTranslation(language, 'settings.text_muted')}
            value={colors.text_muted}
            onChange={(e) => handleColorChange('text_muted', e.target.value)}
            onReset={() => handleResetColor('text_muted')}
            lastValue={lastSavedColors.text_muted}
          />
          <ColorInput
            label={getTranslation(language, 'settings.text_link')}
            value={colors.text_link}
            onChange={(e) => handleColorChange('text_link', e.target.value)}
            onReset={() => handleResetColor('text_link')}
            lastValue={lastSavedColors.text_link}
          />
          <ColorInput
            label={getTranslation(language, 'settings.text_hover')}
            value={colors.text_hover}
            onChange={(e) => handleColorChange('text_hover', e.target.value)}
            onReset={() => handleResetColor('text_hover')}
            lastValue={lastSavedColors.text_hover}
          />
          <ColorInput
            label={getTranslation(language, 'settings.sidebar_text')}
            value={colors.sidebar_text}
            onChange={(e) => handleColorChange('sidebar_text', e.target.value)}
            onReset={() => handleResetColor('sidebar_text')}
            lastValue={lastSavedColors.sidebar_text}
          />
        </div>

        <div className={styles.colorSection}>
          <h4>{getTranslation(language, 'settings.button_colors')}</h4>
          <ColorInput
            label={getTranslation(language, 'settings.button_primary_bg')}
            value={colors.button_primary_bg}
            onChange={(e) => handleColorChange('button_primary_bg', e.target.value)}
            onReset={() => handleResetColor('button_primary_bg')}
            lastValue={lastSavedColors.button_primary_bg}
          />
          <ColorInput
            label={getTranslation(language, 'settings.button_primary_text')}
            value={colors.button_primary_text}
            onChange={(e) => handleColorChange('button_primary_text', e.target.value)}
            onReset={() => handleResetColor('button_primary_text')}
            lastValue={lastSavedColors.button_primary_text}
          />
          <ColorInput
            label={getTranslation(language, 'settings.button_secondary_bg')}
            value={colors.button_secondary_bg}
            onChange={(e) => handleColorChange('button_secondary_bg', e.target.value)}
            onReset={() => handleResetColor('button_secondary_bg')}
            lastValue={lastSavedColors.button_secondary_bg}
          />
          <ColorInput
            label={getTranslation(language, 'settings.button_secondary_text')}
            value={colors.button_secondary_text}
            onChange={(e) => handleColorChange('button_secondary_text', e.target.value)}
            onReset={() => handleResetColor('button_secondary_text')}
            lastValue={lastSavedColors.button_secondary_text}
          />
        </div>

        <div className={styles.colorSection}>
          <h4>{getTranslation(language, 'settings.form_colors')}</h4>
          <ColorInput
            label={getTranslation(language, 'settings.input_background')}
            value={colors.input_background}
            onChange={(e) => handleColorChange('input_background', e.target.value)}
            onReset={() => handleResetColor('input_background')}
            lastValue={lastSavedColors.input_background}
          />
          <ColorInput
            label={getTranslation(language, 'settings.input_border')}
            value={colors.input_border}
            onChange={(e) => handleColorChange('input_border', e.target.value)}
            onReset={() => handleResetColor('input_border')}
            lastValue={lastSavedColors.input_border}
          />
          <ColorInput
            label={getTranslation(language, 'settings.input_text')}
            value={colors.input_text}
            onChange={(e) => handleColorChange('input_text', e.target.value)}
            onReset={() => handleResetColor('input_text')}
            lastValue={lastSavedColors.input_text}
          />
          <ColorInput
            label={getTranslation(language, 'settings.input_placeholder')}
            value={colors.input_placeholder}
            onChange={(e) => handleColorChange('input_placeholder', e.target.value)}
            onReset={() => handleResetColor('input_placeholder')}
            lastValue={lastSavedColors.input_placeholder}
          />
          <ColorInput
            label={getTranslation(language, 'settings.input_focus_border')}
            value={colors.input_focus_border}
            onChange={(e) => handleColorChange('input_focus_border', e.target.value)}
            onReset={() => handleResetColor('input_focus_border')}
            lastValue={lastSavedColors.input_focus_border}
          />
        </div>

        <div className={styles.colorSection}>
          <h4>{getTranslation(language, 'settings.status_colors')}</h4>
          <ColorInput
            label={getTranslation(language, 'settings.success')}
            value={colors.success}
            onChange={(e) => handleColorChange('success', e.target.value)}
            onReset={() => handleResetColor('success')}
            lastValue={lastSavedColors.success}
          />
          <ColorInput
            label={getTranslation(language, 'settings.warning')}
            value={colors.warning}
            onChange={(e) => handleColorChange('warning', e.target.value)}
            onReset={() => handleResetColor('warning')}
            lastValue={lastSavedColors.warning}
          />
          <ColorInput
            label={getTranslation(language, 'settings.error')}
            value={colors.error}
            onChange={(e) => handleColorChange('error', e.target.value)}
            onReset={() => handleResetColor('error')}
            lastValue={lastSavedColors.error}
          />
          <ColorInput
            label={getTranslation(language, 'settings.info')}
            value={colors.info}
            onChange={(e) => handleColorChange('info', e.target.value)}
            onReset={() => handleResetColor('info')}
            lastValue={lastSavedColors.info}
          />
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={handleReset}
            className={styles.secondaryButton}
          >
            {getTranslation(language, 'settings.reset')}
          </button>
          <button 
            type="submit" 
            className={styles.primaryButton}
            disabled={saving}
          >
            {saving ? getTranslation(language, 'settings.saving') : getTranslation(language, 'settings.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThemeSettings; 