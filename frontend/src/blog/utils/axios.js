import axios from 'axios';
import logger from './logger';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blogtoken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.log('Request URL:', config.url);
    logger.log('Full URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('blogToken');
      if (!window.location.pathname.includes('blog-admin-panel')) {
        window.location.href = '/blog-admin-panel';
      }
      logger.error('Response Error:', error.response.data);
      logger.error('Status:', error.response.status);
    } else if (error.request) {
      logger.error('Request Error:', error.request);
    } else {
      logger.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 