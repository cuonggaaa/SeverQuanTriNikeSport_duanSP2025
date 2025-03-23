const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }
  },
  { collection: 'payment_methods', timestamps: true }
);

module.exports = mongoose.model('paymentMethodModel', paymentMethodSchema);
