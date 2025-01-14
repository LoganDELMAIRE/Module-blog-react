import React, { useEffect } from 'react';
import styles from '../styles/Modal.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import axios from '../utils/axios';

const PostModal = ({ post, onClose }) => {
  const { language } = useLanguage();

  useEffect(() => {
    if (post?._id) {
      const incrementViewCount = async () => {
        try {
          await axios.post(`/api/blog/posts/${post._id}/view`);
        } catch (error) {
          console.error('Error incrementing view count:', error);
        }
      };
      incrementViewCount();
    }
  }, [post]);
  
  if (!post) return null;

  return (
    <div className={styles.blogModalOverlay} onClick={onClose}>
      <div className={styles.blogModalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        {post.featuredImage && (
          <img 
            src={post.featuredImage.url} 
            alt={post.featuredImage.alt || post.title} 
            className={styles.blogModalImage}
          />
        )}
        
        <div className={styles.blogModalBody}>
          <h2 className={styles.blogModalTitle}>{post.title}</h2>
          
          <div 
            className={styles.blogModalText}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.blogModalMeta}>
            <span>
              {getTranslation(language, 'blog.by')} {post.author?.username || getTranslation(language, 'blog.unknown_author')}
            </span>
            <span>
              {new Date(post.createdAt).toLocaleDateString(language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal; 