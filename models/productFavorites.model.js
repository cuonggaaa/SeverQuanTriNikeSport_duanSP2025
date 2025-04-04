const mongoose = require('mongoose');

const productFavoritesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'productModel',
      required: true
    }
  },
  { collection: 'product_favorites', timestamps: true }
);

module.exports = mongoose.model(
  'productFavoritesModel',
  productFavoritesSchema
);
