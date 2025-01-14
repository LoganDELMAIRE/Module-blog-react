import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import logger from '../utils/logger';

const PostsList = ({ onCreateNew, onEdit }) => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/blog/posts');
      setPosts(response.data);
    } catch (error) {
      logger.error('Error during posts loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post ?')) {
      try {
        const response = await axios.delete(`/api/blog/posts/${postId}`);
        if (response.data.message) {
          alert(response.data.message);
        }
        
        fetchPosts();
      } catch (error) {
        logger.error('Error during post deletion:', error);
        const message = error.response?.data?.message || 'Error during post deletion';
        alert(message);
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className={styles.postsListContainer}>
      <div className={styles.postsListHeader}>
        <h2>{getTranslation(language, 'list_articles.title_articles')}</h2>
        <button 
          className={styles.primaryButton}
          onClick={onCreateNew}
        >
          {getTranslation(language, 'list_articles.create_article')}
        </button>
      </div>

      <div className={styles.postsTable}>
        <table>
          <thead>
            <tr>
              <th>{getTranslation(language, 'list_articles.title')}</th>
              <th>{getTranslation(language, 'list_articles.status')}</th>
              <th>{getTranslation(language, 'list_articles.created_at')}</th>
              <th id="actions">{getTranslation(language, 'list_articles.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map(post => (
                <tr key={post._id}>
                  <td data-label={getTranslation(language, 'list_articles.title')}>
                    {post.title}
                  </td>
                  <td data-label={getTranslation(language, 'list_articles.status')}>
                    <span className={`${styles.status} ${styles[post.status]}`}>
                      {post.status === 'draft' ? 
                        getTranslation(language, 'list_articles.draft') : 
                        getTranslation(language, 'list_articles.published')}
                    </span>
                  </td>
                  <td data-label={getTranslation(language, 'list_articles.created_at')}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label={getTranslation(language, 'list_articles.actions')}>
                    <div className={styles.actions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => onEdit(post)}
                      >
                        {getTranslation(language, 'list_articles.edit')}
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(post._id)}
                      >
                        {getTranslation(language, 'list_articles.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className={styles.noDataRow}>
                <td colSpan="4">
                  <div className={styles.noDataContainer}>
                    <span className={styles.noData}>
                      {getTranslation(language, 'list_articles.no_article')}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostsList; 