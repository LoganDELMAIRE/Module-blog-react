const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const User = require('../models/User');
const blogAuth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const logger = require('../utils/logger');

router.get('/', blogAuth, async (req, res) => {
  try {
    const conn = req.app.get('blogConnection');
    const Role = conn.model('Role');
    
    let roles;
    if (req.user.role.name === 'super_admin') {
      roles = await Role.find();
    } else if (req.user.role.name === 'admin') {
      roles = await Role.find({ name: { $ne: 'super_admin' } });
    } else {
      roles = await Role.find({ 
        name: { $nin: ['super_admin', 'admin', 'moderator'] }
      });
    }
    
    res.json(roles);
  } catch (error) {
    logger.error('Error fetching roles:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post('/', blogAuth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = new Role({
      name,
      description,
      permissions
    });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.put('/:id', blogAuth, checkRole(['admin']), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ message: 'System roles cannot be modified' });
    }

    const { name, description, permissions } = req.body;
    role.name = name;
    role.description = description;
    role.permissions = permissions;

    await role.save();
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/:id', blogAuth, checkRole(['admin']), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ message: 'System roles cannot be deleted' });
    }

    
    const usersWithRole = await User.countDocuments({ role: role._id });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: 'This role cannot be deleted because it is used by users'
      });
    }

    await Role.deleteOne({ _id: req.params.id });
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    logger.error('Error deleting role:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 