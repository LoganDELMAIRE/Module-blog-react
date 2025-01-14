import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageBlogProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageBlogProvider');
  }
  return context;
}; 