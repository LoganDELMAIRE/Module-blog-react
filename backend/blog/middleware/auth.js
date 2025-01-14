const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const blogAuth = async (req, res, next) => {
  try {
    // get token from header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // get user from database
      const conn = req.app.get('blogConnection');
      const User = conn.model('User');
      const user = await User.findById(decoded.userId).populate('role');
      
      if (!user) {
        logger.error('User not found for token:', decoded);
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      req.userId = decoded.userId;
      
      next();
    } catch (error) {
      logger.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = blogAuth; 