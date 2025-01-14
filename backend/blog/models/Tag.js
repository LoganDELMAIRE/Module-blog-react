const mongoose = require('mongoose');

const tagSchema = {
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
  }
};

const schema = new mongoose.Schema(tagSchema);

schema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug });
};

module.exports = { tagSchema: schema }; 