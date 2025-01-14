const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = {
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
};

const schema = new mongoose.Schema(userSchema);

schema.methods.setPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};

schema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = { userSchema: schema }; 