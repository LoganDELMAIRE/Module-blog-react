const express = require('express');
const router = express.Router();
const blogAuth = require('../middleware/auth');
const logger = require('../utils/logger');
router.get('/', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Tag = conn.model('Tag');
    
    const tags = await Tag.find().sort('name');
    res.json(tags);
  } catch (error) {
    logger.error('Error fetching tags:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Tag = conn.model('Tag');
    
    const tag = new Tag({
      name: req.body.name,
      slug: req.body.name.toLowerCase().replace(/ /g, '-')
    });
    
    const newTag = await tag.save();
    res.status(201).json(newTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Tag = conn.model('Tag');
    
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        slug: req.body.name.toLowerCase().replace(/ /g, '-')
      },
      { new: true }
    );
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.json(tag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Tag = conn.model('Tag');
    
    const tag = await Tag.findByIdAndDelete(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    logger.error('Error deleting tag:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 