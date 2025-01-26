import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import './LastPost.css';

const LastPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLastPosts = async () => {
      try {
        const response = await axios.get('/api/blog/posts?limit=3');
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des derniers articles:', error);
        setError('Impossible de charger les derniers articles');
        setLoading(false);
      }
    };

    fetchLastPosts();
  }, []);

  if (loading) {
    return (
      <div className="last-posts-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="last-posts-error">
        <p>{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="last-posts-empty">
        <p>Aucun article disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="last-posts">
      <div className="last-posts-grid">
        {posts.map(post => (
          <Link to={`/blog/article/${post._id}`} key={post._id} className="last-post-link">
            <article className="last-post-card">
              {post.coverImage && (
                <div className="last-post-image-container">
                  <img src={post.coverImage} alt={post.title} className="last-post-image" />
                </div>
              )}
              <div className="last-post-content">
                <h3>{post.title}</h3>
                <p className="last-post-excerpt">{post.excerpt}</p>
                <div className="last-post-meta">
                  <span className="last-post-date">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LastPost;
