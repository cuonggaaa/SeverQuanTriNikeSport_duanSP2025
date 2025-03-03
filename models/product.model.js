const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    categorysId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categoryModel',
      required: true
    },
    name: { type: String, required: true },
    image: [{ type: String }],
    description: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, required: false , default: 0 },
    quantity: { type: Number, required: true, default: 9999 },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    size: { type: String, required: false },

  },
  { collection: 'products', timestamps: true }
);

module.exports = mongoose.model('productModel', productSchema);
