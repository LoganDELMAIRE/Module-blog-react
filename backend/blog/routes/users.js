const express = require('express');
const router = express.Router();
const blogAuth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const logger = require('../utils/logger');

router.get('/', blogAuth, async (req, res) => {
  try {
    let query = {};
    const conn = req.app.get('blogConnection');
    const Role = conn.model('Role');
    const User = conn.model('User');
    
    if (req.user.role.name === 'moderator') {
      const restrictedRoles = await Role.find({ 
        name: { $in: ['super_admin', 'admin'] }
      });
      const restrictedRoleIds = restrictedRoles.map(role => role._id);
      query.role = { $nin: restrictedRoleIds };
    }
    else if (req.user.role.name === 'admin') {
      const superAdminRole = await Role.findOne({ name: 'super_admin' });
      if (superAdminRole) {
        query.role = { $ne: superAdminRole._id };
      }
    }
    
    const users = await User.find(query)
      .select('-password')
      .populate('role', 'name description');
      
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);  
    res.status(500).json({ message: error.message });
  }
});


router.post('/', blogAuth, async (req, res) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { username, email, password, role } = req.body;

    
    if (req.user.role === 'moderator' && (role === 'admin' || role === 'moderator')) {
      return res.status(403).json({ message: 'You cannot create admins or moderators' });
    }

    const user = new User({ username, email, role });
    await user.setPassword(password);
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email or username is already used' });
    }
    res.status(400).json({ message: error.message });
  }
});


router.put('/:id', blogAuth, checkRole(['admin', 'moderator']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const targetUser = await User.findById(req.params.id).populate('role');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    if (req.user.role.name === 'moderator') {
      if (['admin', 'moderator'].includes(targetUser.role.name)) {
        return res.status(403).json({ message: 'You cannot modify admins or moderators' });
      }
      if (role) {
        const targetRole = await Role.findById(role);
        if (['admin', 'moderator'].includes(targetRole.name)) {
          return res.status(403).json({ message: 'You cannot assign these roles' });
        }
      }
    }

    targetUser.username = username;
    targetUser.email = email;
    
    if (role && req.user.role.name === 'admin') {
      targetUser.role = role;
    }

    if (password) {
      await targetUser.setPassword(password);
    }

    await targetUser.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email or username is already used' });
    }
    res.status(400).json({ message: error.message });
  }
});


router.put('/change-password', blogAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    await user.setPassword(newPassword);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/:id', blogAuth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    if (req.user.role === 'user' || 
       (req.user.role === 'moderator' && 
       (targetUser.role === 'admin' || targetUser.role === 'moderator'))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 