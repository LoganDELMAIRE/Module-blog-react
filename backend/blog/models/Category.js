const mongoose = require('mongoose');

const categorySchema = {
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String
};

const schema = new mongoose.Schema(categorySchema);

schema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug });
};

module.exports = { categorySchema: schema }; 