const mongoose = require('mongoose');

const postSchema = {
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date,
    required: function() {
      return this.status === 'scheduled';
    },
    validate: {
      validator: function(value) {
        if (this.status !== 'scheduled') return true;
        return value && value > new Date();
      },
      message: 'La date de programmation doit être dans le futur'
    }
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  featuredImage: {
    url: String,
    public_id: String,
    alt: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  }
};

const schema = new mongoose.Schema(postSchema);

// Middleware pour mettre à jour la date de modification
schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware pour vérifier et publier les articles programmés
schema.pre('save', async function(next) {
  if (this.status === 'scheduled' && this.scheduledDate) {
    const now = new Date();
    if (this.scheduledDate <= now) {
      this.status = 'published';
      this.scheduledDate = null;
    }
  }
  next();
});

// Middleware pour s'assurer que scheduledDate est null si le status n'est pas 'scheduled'
schema.pre('save', function(next) {
  if (this.status !== 'scheduled') {
    this.scheduledDate = null;
  }
  next();
});

schema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug });
};

// Méthode statique pour publier les articles programmés
schema.statics.publishScheduledPosts = async function() {
  const now = new Date();
  const result = await this.updateMany(
    {
      status: 'scheduled',
      scheduledDate: { $lte: now }
    },
    {
      $set: { status: 'published' },
      $unset: { scheduledDate: '' }
    }
  );
  return result;
};

module.exports = { postSchema: schema }; 