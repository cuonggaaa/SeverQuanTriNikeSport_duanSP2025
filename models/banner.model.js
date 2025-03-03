const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    image: { type: String, required: true },
    description: { type: String, required: false }
  },
  { collection: 'banners', timestamps: true }
);

module.exports = mongoose.model('bannerModel', bannerSchema);
