const mongoose = require('mongoose');

const roleSchema = {
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      required: true
    }],
    excludeRoles: [{
      type: String
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
};

const schema = new mongoose.Schema(roleSchema);

schema.statics.findByName = function(name) {
  return this.findOne({ name: name });
};

module.exports = { roleSchema: schema }; 