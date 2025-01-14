import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import TagModal from './TagModal';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import logger from '../utils/logger';

const TagsList = () => {
  const { language } = useLanguage();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/blog/tags');
      setTags(response.data);
    } catch (error) {
      logger.error('Error during tags loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData, isEdit) => {
    try {
      if (isEdit) {
        await axios.put(`/api/blog/tags/${editingTag._id}`, formData);
        alert('Tag modified successfully!');
      } else {
        await axios.post('/api/blog/tags', formData);
        alert('Tag created successfully!');
      }
      setFormData({ name: '' });
      setEditingTag(null);
      setIsModalOpen(false);
      fetchTags();
    } catch (error) {
      logger.error('Error during tag saving:', error);
      alert('Error during tag saving');
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag ?')) {
      try {
        await axios.delete(`/api/blog/tags/${tagId}`);
        alert('Tag deleted successfully!');
        fetchTags();
      } catch (error) {
        logger.error('Error during tag deletion:', error);
        alert('Error during tag deletion');
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className={styles.postsListContainer}>
      <div className={styles.postsListHeader}>
        <h2>{getTranslation(language, 'list_tags.tags')}</h2>
        <button 
          className={styles.primaryButton}
          onClick={() => {
            setEditingTag(null);
            setFormData({ name: '' });
            setIsModalOpen(true);
          }}
        >
          {getTranslation(language, 'list_tags.new_tag')}
        </button>
      </div>

      <div className={styles.postsTable}>
        <table>
          <thead>
            <tr>
              <th>{getTranslation(language, 'list_tags.name')}</th>
              <th>{getTranslation(language, 'list_tags.description')}</th>
              <th>{getTranslation(language, 'list_tags.slug')}</th>
              <th id="actions">{getTranslation(language, 'list_tags.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {tags.length > 0 ? (
              tags.map(tag => (
                <tr key={tag._id}>
                  <td data-label={getTranslation(language, 'list_tags.name')}>
                    {tag.name}
                  </td>
                  <td data-label={getTranslation(language, 'list_tags.description')}>
                    {tag.description}
                  </td>
                  <td data-label={getTranslation(language, 'list_tags.slug')}>
                    {tag.slug}
                  </td>
                  <td data-label={getTranslation(language, 'list_tags.actions')}>
                    <div className={styles.actions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEdit(tag)}
                      >
                        {getTranslation(language, 'list_tags.edit')}
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(tag._id)}
                      >
                        {getTranslation(language, 'list_tags.delete')}
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
                      {getTranslation(language, 'list_tags.no_tag')}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TagModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTag(null);
          setFormData({ name: '' });
        }}
        tag={editingTag}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default TagsList; 