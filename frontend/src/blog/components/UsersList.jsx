import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import UserModal from './UserModal';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import logger from '../utils/logger';

const UsersList = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/blog/users');
      setUsers(response.data);
    } catch (error) {
      logger.error('Error during users loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user ?')) {
      try {
        await axios.delete(`/api/blog/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        logger.error('Error during user deletion:', error);
        alert(error.response?.data?.message || 'Error during user deletion');
      }
    }
  };

  const handleSubmit = async (userData, isEdit = false) => {
    try {
      if (isEdit) {
        await axios.put(`/api/blog/users/${selectedUser._id}`, userData);
      } else {
        await axios.post('/api/blog/users', userData);
      }
      fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      logger.error('Error during user saving:', error);
      alert(error.response?.data?.message || 'Error during user saving');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className={styles.postsListContainer}>
      <div className={styles.postsListHeader}>
        <h2>{getTranslation(language, 'users_list.users_management')}</h2>
        <button
          className={styles.primaryButton}
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
        >
          {getTranslation(language, 'users_list.new_user')}
        </button>
      </div>

      <div className={styles.postsTable}>
        <table>
          <thead>
            <tr>
              <th>{getTranslation(language, 'users_list.username')}</th>
              <th>{getTranslation(language, 'users_list.email')}</th>
              <th>{getTranslation(language, 'users_list.role')}</th>
              <th>{getTranslation(language, 'users_list.created_at')}</th>
              <th id="actions">{getTranslation(language, 'users_list.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td data-label={getTranslation(language, 'users_list.username')}>
                  {user.username}
                </td>
                <td data-label={getTranslation(language, 'users_list.email')}>
                  {user.email}
                </td>
                <td data-label={getTranslation(language, 'users_list.role')}>
                  <span className={`${styles.roleTag} ${styles[user.role.name]}`}>
                    {user.role.name}
                  </span>
                </td>
                <td data-label={getTranslation(language, 'users_list.created_at')}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td data-label={getTranslation(language, 'users_list.actions')}>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                    >
                      {getTranslation(language, 'users_list.edit')}
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user._id)}
                    >
                      {getTranslation(language, 'users_list.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmit}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersList; 