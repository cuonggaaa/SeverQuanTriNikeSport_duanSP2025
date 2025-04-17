const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
    image: { type: String, required: false }
  },
  { collection: 'categorys', timestamps: true }
);

module.exports = mongoose.model('categoryModel', categorySchema);
