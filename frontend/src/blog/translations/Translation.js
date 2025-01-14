import { fr } from './languages/fr';
import { en } from './languages/en';
import { es } from './languages/es';
import { de } from './languages/de';
import { ru } from './languages/ru';

export const translations = {
    fr,
    en,
    es,
    de,
    ru
};

export const getTranslation = (lang, key) => {
    const keys = key.split('.');
    let translation = translations[lang];
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return key;
      }
    }
    
    return translation;
};