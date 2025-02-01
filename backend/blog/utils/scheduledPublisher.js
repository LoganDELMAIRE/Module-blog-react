const mongoose = require('mongoose');
const { postSchema } = require('../models/Post');
const logger = require('./logger');

let Post;

async function initializeModel(connection) {
  try {
    // Vérifie si le modèle existe déjà
    if (mongoose.connection.models['Post']) {
      Post = mongoose.connection.models['Post'];
    } else {
      // Crée le modèle s'il n'existe pas
      Post = connection.model('Post', postSchema);
    }
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation du modèle Post:', error);
  }
}

async function publishScheduledPosts() {
  try {
    if (!Post) {
      logger.error('Le modèle Post n\'est pas initialisé');
      return;
    }

    const now = new Date();
    const result = await Post.updateMany(
      {
        status: 'scheduled',
        scheduledDate: { $lte: now }
      },
      {
        $set: { status: 'published' },
        $unset: { scheduledDate: '' }
      }
    ).exec(); // Ajout de .exec() pour s'assurer que la promesse est résolue

    if (result.modifiedCount > 0) {
      logger.info(`${result.modifiedCount} articles programmés ont été publiés automatiquement`);
    }
  } catch (error) {
    logger.error('Erreur lors de la publication automatique des articles:', error);
  }
}

function startScheduler(connection, interval = 60000) {
  // Initialise le modèle avec la connexion fournie
  initializeModel(connection);

  // Vérifie immédiatement s'il y a des articles à publier
  publishScheduledPosts();

  // Configure l'intervalle de vérification
  const intervalId = setInterval(publishScheduledPosts, interval);

  logger.info('Planificateur de publication démarré');

  // Retourne l'ID de l'intervalle pour pouvoir l'arrêter si nécessaire
  return intervalId;
}

module.exports = {
  publishScheduledPosts,
  startScheduler
}; 