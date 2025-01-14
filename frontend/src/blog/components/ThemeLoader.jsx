import { useEffect } from 'react';
import axios from '../../utils/axios';
import logger from '../utils/logger';

const ThemeLoader = () => {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await axios.get('/api/blog/settings');
        if (response.data.colors) {
          Object.entries(response.data.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
          });
        }
      } catch (error) {
        logger.error('Error loading theme settings:', error);
      }
    };

    loadTheme();
  }, []);

  return null;
};

export default ThemeLoader; 