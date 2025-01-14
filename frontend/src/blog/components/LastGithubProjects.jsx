import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LastGithubProjects.css';

const LastGithubProjects = () => {
  const [latestRepos, setLatestRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get('https://api.github.com/users/LoganDelmaire/repos');
        const reposData = response.data;
        
        // Trier par date de mise à jour et prendre les 3 derniers
        const latest = reposData
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 3);
        
        setLatestRepos(latest);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des repos:', error);
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (loading) {
    return <div className="tempory"><p>Chargement...</p></div>;
  }

  if (!latestRepos.length) {
    return <div className="tempory"><p>Aucun projet disponible</p></div>;
  }

  return (
    <>
      {latestRepos.map(repo => (
        <article key={repo.id} className="repo-card">
          <div className="repo-content">
            <h3 className="repo-title">{repo.name}</h3>
            
            {repo.description && (
              <p className="repo-description">{repo.description}</p>
            )}

            <div className="repo-meta">
              {repo.language && (
                <span className="repo-language">
                  <span className={`language-dot ${repo.language.toLowerCase()}`}></span>
                  {repo.language}
                </span>
              )}
              
              <div className="repo-stats">
                <span className="repo-stars">⭐ {repo.stargazers_count}</span>
                <span className="repo-forks">🔄 {repo.forks_count}</span>
              </div>
            </div>

            <div className="repo-footer">
              <span className="repo-date">
                Mis à jour le {new Date(repo.updated_at).toLocaleDateString('fr-FR')}
              </span>
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="repo-link"
              >
                Voir sur GitHub →
              </a>
            </div>
          </div>
        </article>
      ))}
    </>
  );
};

export default LastGithubProjects; 