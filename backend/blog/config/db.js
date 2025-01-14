const mongoose = require('mongoose');
const logger = require('../utils/logger');
const connectDB = async () => {
  try {
    const blogUri = process.env.MONGODB_BLOG_URI;
    const conn = await mongoose.createConnection(blogUri);
    logger.info('MongoDB Blog connected');  

    // create models on connection
    const { postSchema } = require('../models/Post');
    const { categorySchema } = require('../models/Category');
    const { tagSchema } = require('../models/Tag');
    const { userSchema } = require('../models/User');
    const { roleSchema } = require('../models/Role');
    const { settingsSchema } = require('../models/Settings');

    // register models
    conn.model('Post', postSchema);
    conn.model('Category', categorySchema);
    conn.model('Tag', tagSchema);
    conn.model('User', userSchema);
    conn.model('Role', roleSchema);
    conn.model('Settings', settingsSchema);
    
    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB Blog:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 