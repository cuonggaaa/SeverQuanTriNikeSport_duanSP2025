const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
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
    },
    quantity: { type: Number, required: true }
  },
  { collection: 'carts', timestamps: true }
);

module.exports = mongoose.model('cartModel', cartSchema);
