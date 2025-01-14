//Its full config for backend plugin blog, it's plug and play if you want use this plugin for blog project only, 
//but you can change it to fit your needs and your project
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectBlogDB = require('./blog/config/db');
const blogAuth = require('./blog/middleware/auth');
const checkRole = require('./blog/middleware/checkRole');
const logger = require('./blog/utils/logger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cors config
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

// Helmet protection disable
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Debug mode middleware
if (process.env.DEBUG_MODE === 'true') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
}

let blogConnection;

const initializeServer = async () => {
  try {
    blogConnection = await connectBlogDB();
    app.set('blogConnection', blogConnection);

    // Routes
    app.use('/api/blog/auth', require('./blog/routes/auth'));
    app.use('/api/blog/posts', require('./blog/routes/posts'));
    app.use('/api/blog/categories', require('./blog/routes/categories'));
    app.use('/api/blog/tags', require('./blog/routes/tags'));
    app.use('/api/blog/upload', blogAuth, require('./blog/routes/upload'));
    app.use('/api/blog/settings', require('./blog/routes/settings'));
    app.use('/api/blog/users', blogAuth, checkRole(['admin', 'moderator']), require('./blog/routes/users'));
    app.use('/api/blog/roles', blogAuth, checkRole(['admin']), require('./blog/routes/roles'));

    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    app.use((err, req, res, next) => {
      logger.error('Server error:', err);
      res.status(500).json({ message: 'Internal server error' });
    });

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

initializeServer(); 