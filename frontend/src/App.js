import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './blog/contexts/AuthContext';
import { LanguageBlogProvider } from './blog/translations/LanguageContext';
import BlogList from './blog/components/BlogList';
import AdminPanel from './blog/components/AdminPanel';

function AppContent() {
  const location = useLocation()
  const [nextPath, setNextPath] = useState(null);

  const handleNavigation = (path) => {
    if (path !== location.pathname) {
      setNextPath(path);
    }
  };

  return (
    <div className="App">
      <main className='main-content'>
        <Routes>
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog-admin-panel" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageBlogProvider>
          <Router>
            <Navbar />
            <AppContent />
          </Router>
      </LanguageBlogProvider>
    </AuthProvider>
  );
}

export default App;
