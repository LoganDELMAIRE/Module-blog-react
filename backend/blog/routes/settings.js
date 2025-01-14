const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const logger = require('../utils/logger');

// Route publique pour récupérer les paramètres du thème
router.get('/', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Settings = conn.model('Settings');
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        colors: {
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
        },
        language: 'fr'
      });
    }
    
    res.json(settings);
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Routes protégées pour la modification des paramètres
router.put('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Settings = conn.model('Settings');
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      settings.colors = req.body.colors;
      if (req.body.language) {
        settings.language = req.body.language;
      }
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route publique pour récupérer la langue
router.get('/language', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Settings = conn.model('Settings');
    
    const settings = await Settings.findOne();
    res.json({ language: settings?.language || 'fr' });
  } catch (error) {
    logger.error('Error fetching language:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route protégée pour mettre à jour la langue
router.put('/language', auth, checkRole(['admin']), async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Settings = conn.model('Settings');
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.language = req.body.language;
    await settings.save();
    res.json({ language: settings.language });
  } catch (error) {
    logger.error('Error updating language:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;