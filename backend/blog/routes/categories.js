const express = require('express');
const router = express.Router();
const blogAuth = require('../middleware/auth');
const logger = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Category = conn.model('Category');
    
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Category = conn.model('Category');
    
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      slug: req.body.name.toLowerCase().replace(/ /g, '-')
    });
    
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Category = conn.model('Category');
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        slug: req.body.name.toLowerCase().replace(/ /g, '-')
      },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Category = conn.model('Category');
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 