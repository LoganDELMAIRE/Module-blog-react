const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const blogAuth = require('../middleware/auth');
const logger = require('../utils/logger');

router.get('/check-setup', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Role = conn.model('Role');
    const User = conn.model('User');
    
    const roleCount = await Role.find().countDocuments();
    const userCount = await User.find().countDocuments();
    
    res.json({
      needsSetup: roleCount === 0 || userCount === 0
    });
  } catch (error) {
    logger.error('Error check-setup:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const conn = req.app.get('blogConnection');
    const User = conn.model('User');
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await user.checkPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      expiresIn: 24 * 60 * 60 * 1000
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// check authentication
router.get('/me', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const User = conn.model('User');
    const user = await User.findById(req.userId).populate('role');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// initial setup
router.post('/setup', async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Role = conn.model('Role');
    const User = conn.model('User');

    // check if already configured
    const roleCount = await Role.find().countDocuments();
    const userCount = await User.find().countDocuments();
    
    if (roleCount > 0 || userCount > 0) {
      return res.status(400).json({ message: 'Blog already configured' });
    }

    // create admin role
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrateur du blog',
      isSystem: true,
      permissions: [{
        resource: '*',
        actions: ['*']
      }]
    });

    const { username, email, password } = req.body;
    const user = new User({
      username,
      email,
      role: adminRole._id
    });
    await user.setPassword(password);
    await user.save();

    res.json({ message: 'Initial setup successful' });
  } catch (error) {
    logger.error('Error setup:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 