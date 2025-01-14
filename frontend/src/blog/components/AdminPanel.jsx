import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import PostsList from './PostsList';
import PostForm from './PostForm';
import LoginForm from './LoginForm';
import InitialSetup from './InitialSetup';
import styles from '../styles/Admin.module.css';
import CategoriesList from './CategoriesList';
import TagsList from './TagsList';
import SettingsPanel from './SettingsPanel';
import UsersList from './UsersList';
import ChangePasswordModal from './ChangePasswordModal';
import RolesList from './RolesList';
import LanguagePanel from './LanguagePanel';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import scrollbarStyles from '../styles/Scrollbar.module.css';
import logger from '../utils/logger';

const AdminPanel = () => {
  const { language } = useLanguage();
  const { currentUser, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('posts');
  const [editingPost, setEditingPost] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await axios.get('/api/blog/auth/check-setup');
        setNeedsSetup(response.data.needsSetup);
      } catch (error) {
        logger.error('Error during setup check:', error);
      }
    };

    if (!currentUser) {
      checkSetup();
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setCurrentView('edit');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setCurrentView('posts');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <UsersList />;
      case 'roles':
        return <RolesList />;
      case 'categories':
        return <CategoriesList />;
      case 'tags':
        return <TagsList />;
      case 'settings':
        return <SettingsPanel />;
      case 'languages':
        return <LanguagePanel />;
      case 'create':
        return (
          <PostForm 
            onCancel={() => setCurrentView('posts')}
            onSuccess={() => setCurrentView('posts')}
          />
        );
      case 'edit':
        return (
          <PostForm 
            post={editingPost}
            onCancel={handleCancelEdit}
            onSuccess={() => {
              setEditingPost(null);
              setCurrentView('posts');
            }}
          />
        );
      default:
        return (
          <PostsList 
            onCreateNew={() => setCurrentView('create')} 
            onEdit={handleEdit}
          />
        );
    }
  };

  const isAdmin = currentUser?.role?.name === 'admin';
  const isSuperAdmin = currentUser?.role?.name === 'super_admin';
  const isModerator = currentUser?.role?.name === 'moderator';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!currentUser && needsSetup) {
    return <InitialSetup />;
  }

  if (!currentUser) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return (
    <div className={styles.adminContainer}>
      <button 
        className={styles.hamburgerButton}
        onClick={toggleSidebar}
        aria-label="Menu"
      >
        ☰
      </button>

      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.show : ''}`}
        onClick={closeSidebar}
      />

      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>Admin panel blog</div>
        </div>

        <nav className={`${styles.navigation} ${scrollbarStyles.navigation}`}>
          <div className={styles.menuSection}>
            <span className={styles.menuTitle}>{getTranslation(language, 'sidebar.articles')}</span>
            <ul className={styles.navMenu}>
              <li className={styles.navItem}>
                <button 
                  className={`${styles.navLink} ${currentView === 'posts' ? styles.active : ''}`}
                  onClick={() => setCurrentView('posts')}
                >
                  <span className={styles.navIcon}>📄</span>
                  <span className={styles.navText}>{getTranslation(language, 'sidebar.articles_list')}</span>
                </button>
              </li>
              <li className={styles.navItem}>
                <button 
                  className={`${styles.navLink} ${currentView === 'create' ? styles.active : ''}`}
                  onClick={() => setCurrentView('create')}
                >
                  <span className={styles.navIcon}>✚</span>
                  <span className={styles.navText}>{getTranslation(language, 'sidebar.new_article')}</span>
                </button>
              </li>
            </ul>
          </div>

          <div className={styles.menuSection}>
            <span className={styles.menuTitle}>{getTranslation(language, 'sidebar.classifications')}</span>
            <ul className={styles.navMenu}>
              <li className={styles.navItem}>
                <button 
                  className={`${styles.navLink} ${currentView === 'categories' ? styles.active : ''}`}
                  onClick={() => setCurrentView('categories')}
                >
                  <span className={styles.navIcon}>🏷️</span>
                  <span className={styles.navText}>{getTranslation(language, 'sidebar.categories')}</span>
                </button>
              </li>
              <li className={styles.navItem}>
                <button 
                  className={`${styles.navLink} ${currentView === 'tags' ? styles.active : ''}`}
                  onClick={() => setCurrentView('tags')}
                >
                  <span className={styles.navIcon}>🔖</span>
                  <span className={styles.navText}>{getTranslation(language, 'sidebar.tags')}</span>
                </button>
              </li>
            </ul>
          </div>

          {(isSuperAdmin || isAdmin) && (
            <div className={styles.menuSection}>
              <span className={styles.menuTitle}>{getTranslation(language, 'sidebar.configuration')}</span>
              <ul className={styles.navMenu}>
                <li className={styles.navItem}>
                  <button 
                    className={`${styles.navLink} ${currentView === 'settings' ? styles.active : ''}`}
                    onClick={() => setCurrentView('settings')}
                  >
                    <span className={styles.navIcon}>⚙️</span>
                    <span className={styles.navText}>{getTranslation(language, 'sidebar.appearance')}</span>
                  </button>
                </li>
                <li className={styles.navItem}>
                  <button 
                    className={`${styles.navLink} ${currentView === 'languages' ? styles.active : ''}`}
                    onClick={() => setCurrentView('languages')}
                  >
                    <span className={styles.navIcon}>🌐</span>
                    <span className={styles.navText}>{getTranslation(language, 'sidebar.languages')}</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {(isSuperAdmin || isAdmin || isModerator) && (
            <div className={styles.menuSection}>
              <span className={styles.menuTitle}>{getTranslation(language, 'sidebar.administration')}</span>
              <ul className={styles.navMenu}>
                <li className={styles.navItem}>
                  <button
                    className={`${styles.navLink} ${currentView === 'users' ? styles.active : ''}`}
                    onClick={() => setCurrentView('users')}
                  >
                    <span className={styles.navIcon}>👤</span>
                    <span className={styles.navText}>{getTranslation(language, 'sidebar.users')}</span>
                  </button>
                </li>
                {(isSuperAdmin || isAdmin) && (
                  <li className={styles.navItem}>
                    <button
                      className={`${styles.navLink} ${currentView === 'roles' ? styles.active : ''}`}
                      onClick={() => setCurrentView('roles')}
                    >
                      <span className={styles.navIcon}>🔑</span>
                      <span className={styles.navText}>{getTranslation(language, 'sidebar.roles')}</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userHeader}>
              <span>{currentUser.username}</span>
              <span className={`${styles.roleTag} ${styles[currentUser.role.name]}`}>
                {currentUser.role.name}
              </span>
            </div>
            <small>{currentUser.email}</small>
            <button 
              className={styles.changePasswordButton}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <span className={styles.navIcon}>🔑</span>
              <span className={styles.navText}>{getTranslation(language, 'sidebar.change_password')}</span>
            </button>
          </div>
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <span className={styles.navIcon}>🚪</span>
            <span className={styles.navText}>{getTranslation(language, 'logout')}</span>
          </button>
          <small>{getTranslation(language, 'sidebar.created_by')} <a href="https://logandelmairedev.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>Logan Delmaire</a></small>
        </div>
      </div>

      <main className={`${styles.mainContent} ${scrollbarStyles.blogScrollbar}`}>
        {((!isSuperAdmin && !isAdmin && currentView === 'settings') || 
          (!isSuperAdmin && !isAdmin && !isModerator && currentView === 'users') || 
          (!isSuperAdmin && !isAdmin && currentView === 'roles') ||
          (!isSuperAdmin && !isAdmin && currentView === 'languages')) ? (
          <div className={styles.unauthorizedAccess}>
            {getTranslation(language, 'sidebar.unauthorized_access')}
          </div>
        ) : (
          renderContent()
        )}
      </main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AdminPanel; 