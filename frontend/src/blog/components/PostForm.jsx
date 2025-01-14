import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import RichTextEditor from './RichTextEditor';
import CategoryModal from './CategoryModal';
import TagModal from './TagModal';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import logger from '../utils/logger';
const PostForm = ({ post, onCancel, onSuccess }) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const quillRef = useRef(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    tags: [],
    status: 'draft',
    featuredImage: null
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: '', description: '' });
  const [newTagData, setNewTagData] = useState({ name: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get('/api/blog/categories'),
          axios.get('/api/blog/tags')
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);

        if (post) {
          console.log("Post data received:", post);
          setFormData({
            title: post.title || '',
            content: post.content || '',
            categories: post.categories?.map(cat => cat._id) || [],
            tags: post.tags?.map(tag => tag._id) || [],
            status: post.status || 'draft',
            featuredImage: post.featuredImage || null
          });

          if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.root.innerHTML = post.content || '';
          }
        }
      } catch (error) {
        logger.error('Error loading form data:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, [post]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/blog/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: response.data.url,
          public_id: response.data.public_id,
          alt: file.name
        }
      }));
    } catch (error) {
      logger.error('Error during image upload:', error);
      alert('Error during image upload');
    }
  };

  const handleImageDelete = async () => {
    if (!formData.featuredImage) return;

    if (window.confirm('Are you sure you want to delete this image ?')) {
      try {
        if (formData.featuredImage.public_id) {
          const encodedPublicId = encodeURIComponent(formData.featuredImage.public_id);
          await axios.delete(`/api/blog/upload/${encodedPublicId}`);
        }
        
        setFormData(prev => ({
          ...prev,
          featuredImage: null
        }));
      } catch (error) {
        logger.error('Error during image deletion:', error);
        alert('Error during image deletion');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      categories: [],
      tags: [],
      status: 'draft',
      featuredImage: null
    });
    if (quillRef.current) {
      quillRef.current.getEditor().setText('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (post) {
        await axios.put(`/api/blog/posts/${post._id}`, {
          ...formData,
          author: currentUser._id
        });
        alert('Article modifié avec succès!');
      } else {
        const postFormData = new FormData();
        postFormData.append('title', formData.title);
        postFormData.append('content', formData.content);
        postFormData.append('excerpt', formData.excerpt);
        
        const slug = formData.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        postFormData.append('slug', slug);
        
        if (formData.categories.length > 0) {
          postFormData.append('categories', JSON.stringify(formData.categories));
        }
        if (formData.tags.length > 0) {
          postFormData.append('tags', JSON.stringify(formData.tags));
        }
        if (formData.featuredImage) {
          postFormData.append('image', formData.featuredImage);
        }

        const response = await axios.post('/api/blog/posts', postFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        onSuccess(response.data);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error);
      setError(error.response?.data?.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/blog/categories', newCategoryData);
      setCategories([...categories, response.data]);
      setNewCategoryData({ name: '', description: '' });
      setIsCategoryModalOpen(false);
      alert('Catégorie créée avec succès!');
    } catch (error) {
      logger.error('Error during category creation:', error);
      alert('Error during category creation');
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/blog/tags', newTagData);
      setTags([...tags, response.data]);
      setNewTagData({ name: '' });
      setIsTagModalOpen(false);
      alert('Tag créé avec succès!');
    } catch (error) {
      logger.error('Error during tag creation:', error);
      alert('Error during tag creation');
    }
  };

  const handleMultiSelect = (e, field) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {getTranslation(language, 'form_article.title')}
          </label>
          <input
            type="text"
            className={styles.input}
            value={formData.title}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              title: e.target.value
            }))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {getTranslation(language, 'form_article.featured_image')}
          </label>
          <div 
            className={styles.imageUpload}
            onClick={() => document.getElementById('imageInput').click()}
            style={{ cursor: 'pointer' }}
          >
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {formData.featuredImage ? (
              <div className={styles.imagePreview}>
                <img
                  src={formData.featuredImage.url}
                  alt={formData.featuredImage.alt || "Featured image"}
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageDelete();
                  }}
                  className={styles.deleteImageBtn}
                  aria-label="Supprimer l'image"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <span className={styles.uploadIcon}>📁</span>
                <p>{getTranslation(language, 'form_article.click_or_drag_image')}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {getTranslation(language, 'form_article.content')}
          </label>
          <RichTextEditor
            ref={quillRef}
            value={formData.content}
            onChange={(content) => setFormData(prev => ({
              ...prev,
              content: content
            }))}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {getTranslation(language, 'form_article.categories')}
          </label>
          <select
            multiple
            className={styles.select}
            value={formData.categories}
            onChange={(e) => handleMultiSelect(e, 'categories')}
          >
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {getTranslation(language, 'form_article.tags')}
          </label>
          <select
            multiple
            className={styles.select}
            value={formData.tags}
            onChange={(e) => handleMultiSelect(e, 'tags')}
          >
            {tags.map(tag => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {getTranslation(language, 'form_article.status')}
          </label>
          <select
            className={styles.select}
            value={formData.status}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              status: e.target.value
            }))}
          >
            <option value="draft">{getTranslation(language, 'form_article.draft')}</option>
            <option value="published">{getTranslation(language, 'form_article.published')}</option>
          </select>
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            {getTranslation(language, 'form_article.cancel')}
          </button>
          <button type="submit" className={styles.submitButton}>
            {post ? getTranslation(language, 'form_article.edit') : getTranslation(language, 'form_article.create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm; 