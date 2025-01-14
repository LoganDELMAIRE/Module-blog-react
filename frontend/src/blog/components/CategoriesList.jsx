import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import CategoryModal from './CategoryModal';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import logger from '../utils/logger';

const CategoriesList = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/blog/categories');
      setCategories(response.data);
    } catch (error) {
      logger.error('Error during categories loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData, isEdit) => {
    try {
      if (isEdit) {
        await axios.put(`/api/blog/categories/${editingCategory._id}`, formData);
        alert('Catégorie modifiée avec succès!');
      } else {
        await axios.post('/api/blog/categories', formData);
        alert('Catégorie créée avec succès!');
      }
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      logger.error('Error during category saving:', error);
      alert('Error during category saving');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await axios.delete(`/api/blog/categories/${categoryId}`);
        alert('Catégorie supprimée avec succès!');
        fetchCategories();
      } catch (error) {
        logger.error('Error during category deletion:', error);
        alert('Error during category deletion');
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className={styles.postsListContainer}>
      <div className={styles.postsListHeader}>
        <h2>{getTranslation(language, 'list_categories.categories')}</h2>
        <button 
          className={styles.primaryButton}
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            setIsModalOpen(true);
          }}
        >
          {getTranslation(language, 'list_categories.new_category')}
        </button>
      </div>

      <div className={styles.postsTable}>
        <table>
          <thead>
            <tr>
              <th>{getTranslation(language, 'list_categories.name')}</th>
              <th>{getTranslation(language, 'list_categories.description')}</th>
              <th>{getTranslation(language, 'list_categories.slug')}</th>
              <th id="actions">{getTranslation(language, 'list_categories.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map(category => (
                <tr key={category._id}>
                  <td data-label={getTranslation(language, 'list_categories.name')}>
                    {category.name}
                  </td>
                  <td data-label={getTranslation(language, 'list_categories.description')}>
                    {category.description}
                  </td>
                  <td data-label={getTranslation(language, 'list_categories.slug')}>
                    {category.slug}
                  </td>
                  <td data-label={getTranslation(language, 'list_categories.actions')}>
                    <div className={styles.actions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEdit(category)}
                      >
                        {getTranslation(language, 'list_categories.edit')}
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(category._id)}
                      >
                        {getTranslation(language, 'list_categories.delete')}
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
                      {getTranslation(language, 'list_categories.no_category')}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setFormData({ name: '', description: '' });
        }}
        category={editingCategory}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CategoriesList; 