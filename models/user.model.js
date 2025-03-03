const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: {
      type: String,
      required: true
    },
    email: { type: String, required: true },
    is_admin: { type: Boolean, required: true, default: false },
    password: { type: String, required: true }
  },
  {
    collection: 'users',
    timestamps: true
  }
);

module.exports = mongoose.model('userModel', userSchema);
