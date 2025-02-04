const express = require('express');
const router = express.Router();
const blogAuth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const upload = require('../middleware/upload');

// Route pour récupérer tous les articles
router.get('/', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Post = conn.model('Post');
    
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('categories')
      .populate('tags')
      .sort({ createdAt: -1 });
      
    res.json(posts);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route pour récupérer un article spécifique
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching post with ID:', req.params.id); // Debug log
    const conn = req.app.get('blogConnection');
    const Post = conn.model('Post');
    
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('categories')
      .populate('tags');
    
    console.log('Found post:', post); // Debug log
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Incrémenter le compteur de vues
    post.views = (post.views || 0) + 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Error details:', error); // Debug log
    logger.error('Error fetching post:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', blogAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    const { title, content, excerpt, categories, tags, status, scheduledDate } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const conn = req.app.get('blogConnection');
    const Post = conn.model('Post');
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const postData = {
      title,
      content,
      excerpt,
      slug,
      status: status || 'draft',
      categories: categories ? JSON.parse(categories) : [],
      tags: tags ? JSON.parse(tags) : [],
      author: req.user.id,
      featuredImage: req.file ? {
        url: req.file.path,
        filename: req.file.filename
      } : null
    };

    // Ajouter la date programmée si le statut est 'scheduled'
    if (status === 'scheduled' && scheduledDate) {
      postData.scheduledDate = new Date(scheduledDate);
    }

    const post = new Post(postData);
    await post.save();
    
    // Récupérer l'article avec les relations peuplées
    const savedPost = await Post.findById(post._id)
      .populate('author', 'username')
      .populate('categories')
      .populate('tags');

    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Post = conn.model('Post');
    
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('categories')
      .populate('tags');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author._id.toString() !== req.user._id.toString() && 
        req.user.role.name !== 'admin' && 
        req.user.role.name !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (post.featuredImage?.public_id && 
        req.body.featuredImage?.public_id && 
        req.body.featuredImage.public_id !== post.featuredImage.public_id) {
      try {
        await cloudinary.uploader.destroy(post.featuredImage.public_id);
      } catch (error) {
        logger.error('Error deleting old image:', error);
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: req.body.status,
        categories: req.body.categories,
        tags: req.body.tags,
        featuredImage: req.body.featuredImage || post.featuredImage,
        updatedAt: Date.now()
      },
      { 
        new: true,
        runValidators: true 
      }
    )
    .populate('author', 'username')
    .populate('categories')
    .populate('tags');

    res.json(updatedPost);
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Post = conn.model('Post');
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (post.featuredImage && post.featuredImage.public_id) {
      try {
        await cloudinary.uploader.destroy(post.featuredImage.public_id);
      } catch (error) {
        logger.error('Error deleting image:', error);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Post = conn.model('Post');
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ views: post.views });
  } catch (error) {
    logger.error('Error incrementing view count:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 