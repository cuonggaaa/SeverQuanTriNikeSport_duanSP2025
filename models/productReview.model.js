const mongoose = require('mongoose');
const APIError = require('../helpers/APIError');

const productReviewSchema = new mongoose.Schema(
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
    rating: { type: Number, required: true },
    status: { type: Number, required: true, default: 1 },
    reviewText: { type: String, required: true }
  },
  { collection: 'product_reviews', timestamps: true }
);

productReviewSchema.statics = {
  async get(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError('Invalid ID format');
    }

    try {
      const data = await this.findById(id).exec();
      if (data) {
        return data;
      }
      throw new APIError('No such data exists!');
    } catch (error) {
      throw new APIError(error.message || 'An error occurred during the query');
    }
  }
};

module.exports = mongoose.model('productReviewsModel', productReviewSchema);
