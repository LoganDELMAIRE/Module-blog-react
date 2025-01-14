const mongoose = require('mongoose');

const settingsSchema = {
  colors: {
    primary: {
      type: String,
      default: '#4299e1'
    },
    secondary: {
      type: String,
      default: '#e2e8f0'
    },
    accent: {
      type: String,
      default: '#ed8936'
    },
    background_main: {
      type: String,
      default: '#ffffff'
    },
    background_alt: {
      type: String,
      default: '#f7fafc'
    },
    background_dark: {
      type: String,
      default: '#2d3748'
    },
    sidebar_background: {
      type: String,
      default: '#2d3748'
    },
    card_background: {
      type: String,
      default: '#ffffff'
    },
    card_border: {
      type: String,
      default: '#e2e8f0'
    },
    modal_background: {
      type: String,
      default: '#ffffff'
    },
    modal_overlay: {
      type: String,
      default: 'rgba(0, 0, 0, 0.5)'
    },
    dropdown_background: {
      type: String,
      default: '#ffffff'
    },
    text_primary: {
      type: String,
      default: '#2d3748'
    },
    text_secondary: {
      type: String,
      default: '#4a5568'
    },
    text_light: {
      type: String,
      default: '#ffffff'
    },
    text_muted: {
      type: String,
      default: '#718096'
    },
    text_link: {
      type: String,
      default: '#4299e1'
    },
    text_hover: {
      type: String,
      default: '#2b6cb0'
    },
    sidebar_text: {
      type: String,
      default: '#ffffff'
    },
    button_primary_bg: {
      type: String,
      default: '#4299e1'
    },
    button_primary_text: {
      type: String,
      default: '#ffffff'
    },
    button_secondary_bg: {
      type: String,
      default: '#e2e8f0'
    },
    button_secondary_text: {
      type: String,
      default: '#2d3748'
    },
    button_danger_bg: {
      type: String,
      default: '#e53e3e'
    },
    button_danger_text: {
      type: String,
      default: '#ffffff'
    },
    input_background: {
      type: String,
      default: '#ffffff'
    },
    input_border: {
      type: String,
      default: '#e2e8f0'
    },
    input_text: {
      type: String,
      default: '#2d3748'
    },
    input_placeholder: {
      type: String,
      default: '#a0aec0'
    },
    input_focus_border: {
      type: String,
      default: '#4299e1'
    },
    success: {
      type: String,
      default: '#48bb78'
    },
    warning: {
      type: String,
      default: '#ed8936'
    },
    error: {
      type: String,
      default: '#e53e3e'
    },
    info: {
      type: String,
      default: '#4299e1'
    }
  },
  language: {
    type: String,
    enum: ['fr', 'en', 'es', 'de', 'ru'],
    default: 'fr'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
};

const schema = new mongoose.Schema(settingsSchema);

schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = { settingsSchema: schema }; 