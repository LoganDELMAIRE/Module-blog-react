import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Header.module.css';

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        Blog Admin
      </div>
      {currentUser && (
        <div className={styles.userInfo}>
          <span>{currentUser.username}</span>
        </div>
      )}
    </header>
  );
};

export default Header; 