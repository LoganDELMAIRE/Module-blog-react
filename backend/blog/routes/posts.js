const express = require('express');
const router = express.Router();
const blogAuth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const upload = require('../middleware/upload');

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

router.post('/', blogAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    const { title, content, excerpt, categories, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const conn = req.app.get('blogConnection');
    const Post = conn.model('Post');
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const post = new Post({
      title,
      content,
      excerpt,
      slug,
      categories: categories ? JSON.parse(categories) : [],
      tags: tags ? JSON.parse(tags) : [],
      author: req.user.id,
      featuredImage: req.file ? {
        url: req.file.path,
        filename: req.file.filename
      } : null
    });

    await post.save();
    res.status(201).json(post);
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
    
    if (post.author.toString() !== req.userId && req.user.role !== 'admin') {
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
        slug: req.body.title.toLowerCase().replace(/ /g, '-'),
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