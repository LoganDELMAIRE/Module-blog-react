import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import styles from '../styles/Blog.module.css';
import { getTranslation } from '../translations/Translation';
import { useLanguage } from '../translations/LanguageContext';
import logger from '../utils/logger';
import { FaEye, FaArrowLeft, FaUser, FaCalendar } from 'react-icons/fa';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/blog/posts/${id}`);
        if (response.data) {
          setPost(response.data);
          setError(null);
        } else {
          setError('No data received from server');
        }
      } catch (error) {
        logger.error('Error loading post:', error);
        setError(error.response?.data?.message || 'Error loading post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    } else {
      setError('No post ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className={styles.loading}>{getTranslation(language, 'blog.loading')}</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!post) {
    return <div className={styles.error}>{getTranslation(language, 'blog.post_not_found')}</div>;
  }

  return (
    <div className={styles.blogPostContainer}>
      <article className={styles.blogPost}>
        {post.featuredImage && (
          <img 
            src={post.featuredImage.url} 
            alt={post.featuredImage.alt || post.title} 
            className={styles.postImage}
          />
        )}

        <h1 className={styles.postTitle}>{post.title}</h1>

        <div 
          className={styles.postContent}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className={styles.postFooter}>
          {post.categories && post.categories.length > 0 && (
            <div className={styles.categoriesList}>
              <span className={styles.labelText}>
                {getTranslation(language, 'blog.category_name')}:
              </span>
              {post.categories.map(category => (
                <span key={category._id} className={styles.category}>
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className={styles.tagsList}>
              <span className={styles.labelText}>
                {getTranslation(language, 'blog.tag_name')}:
              </span>
              {post.tags.map(tag => (
                <span key={tag._id} className={styles.tag}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}

        <div className={styles.postMeta}>
            <span className={styles.postMetaItem}>
              <FaUser />
              {post.author?.username || getTranslation(language, 'blog.unknown_author')}
            </span>
            <span className={styles.postMetaItem}>
              <FaCalendar />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span className={styles.postMetaItem}>
              <FaEye />
              {post.views || 0} {getTranslation(language, 'blog.views')}
            </span>
          </div>
        </div>
      </article>

      <button 
        className={styles.backButton}
        onClick={() => navigate('/blog')}
      >
        <FaArrowLeft /> {getTranslation(language, 'blog.back_to_list')}
      </button>
    </div>
  );
};

export default BlogPost; 