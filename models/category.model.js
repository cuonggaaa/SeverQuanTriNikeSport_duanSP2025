const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: false }
  },
  { collection: 'categorys', timestamps: true }
);

module.exports = mongoose.model('categoryModel', categorySchema);
