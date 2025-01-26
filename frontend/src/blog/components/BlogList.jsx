import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import styles from '../styles/Blog.module.css';
import { getTranslation } from '../translations/Translation';
import { useLanguage } from '../translations/LanguageContext';
import logger from '../utils/logger';
import { FaEye } from 'react-icons/fa';

const BlogList = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get('/api/blog/categories'),
          axios.get('/api/blog/tags')
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        logger.error('Error during filters loading:', error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/blog/posts');
        const publishedPosts = response.data.filter(post => post.status === 'published');
        setPosts(publishedPosts);
        setFilteredPosts(publishedPosts);
      } catch (error) {
        logger.error('Error during posts loading:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let updatedPosts = [...posts];

    
    if (searchTerm) {
      updatedPosts = updatedPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.categories.some(category => category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    
    if (selectedCategory) {
      updatedPosts = updatedPosts.filter(post =>
        post.categories.some(category => category._id === selectedCategory)
      );
    }

    
    if (selectedTag) {
      updatedPosts = updatedPosts.filter(post =>
        post.tags.some(tag => tag._id === selectedTag)
      );
    }

    
    if (sortOrder === 'newest') {
      updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'oldest') {
      updatedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredPosts(updatedPosts);
  }, [searchTerm, sortOrder, selectedCategory, selectedTag, posts]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortOrder('newest');
  };

  if (loading) {
    return <div className={styles.loading}>{getTranslation(language, 'blog.loading')}</div>;
  }

  if (filteredPosts.length === 0) {
    return (
      <div className={styles.blogContainer}>
        <h2>{getTranslation(language, 'blog.blog_title')}</h2>
        
      <div className={styles.controls}>
        <div className={styles.filtersGroup}>
          <input
            type="text"
            placeholder={getTranslation(language, 'blog.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBar}
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">{getTranslation(language, 'blog.all_categories')}</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">{getTranslation(language, 'blog.all_tags')}</option>
            {tags.map(tag => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">{getTranslation(language, 'blog.sort_newest')}</option>
            <option value="oldest">{getTranslation(language, 'blog.sort_oldest')}</option>
          </select>
        </div>

        <button 
          onClick={resetFilters}
          className={styles.resetButton}
          title={getTranslation(language, 'blog.reset_filters')}
        >
          ↺
        </button>
      </div>
        <div className={styles.noPosts}>
          {getTranslation(language, 'blog.no_posts')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.blogContainer}>
      <h2>{getTranslation(language, 'blog.blog_title')}</h2>

      <div className={styles.controls}>
        <div className={styles.filtersGroup}>
          <input
            type="text"
            placeholder={getTranslation(language, 'blog.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBar}
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">{getTranslation(language, 'blog.all_categories')}</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">{getTranslation(language, 'blog.all_tags')}</option>
            {tags.map(tag => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">{getTranslation(language, 'blog.sort_newest')}</option>
            <option value="oldest">{getTranslation(language, 'blog.sort_oldest')}</option>
          </select>
        </div>

        <button 
          onClick={resetFilters}
          className={styles.resetButton}
          title={getTranslation(language, 'blog.reset_filters')}
        >
          ↺
        </button>
      </div>

      <div className={styles.postsGrid}>
        {filteredPosts.map(post => (
          <article 
            key={post._id} 
            className={styles.postCard}
            onClick={() => navigate(`/blog/article/${post._id}`)}
          >
            {post.featuredImage && (
              <img 
                src={post.featuredImage.url} 
                alt={post.featuredImage.alt} 
                className={styles.featuredImage}
              />
            )}
            <div className={styles.postContent}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              
              {post.categories && post.categories.length > 0 && (
                <div className={styles.categoriesList}>
                  {getTranslation(language, 'blog.category_name')}:
                  {post.categories.map(category => (
                    <span key={category._id} className={styles.category}>
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className={styles.tagsList}>
                  {getTranslation(language, 'blog.tag_name')}:
                  {post.tags.map(tag => (
                    <span key={tag._id} className={styles.tag}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.postMeta}>
                <span>{getTranslation(language, 'blog.by')} {post.author?.username || getTranslation(language, 'blog.unknown_author')}</span>
                <span className={styles.viewCount}>
                  <FaEye /> {post.views || 0}
                </span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogList; 