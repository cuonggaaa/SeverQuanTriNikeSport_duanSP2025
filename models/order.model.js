const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'voucherModel',
      required: false
    },
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'paymentMethodModel',
      required: true
    },
    cartId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cartModel',
        required: true
      }
    ],
    totalAmount: { type: Number, required: true },
    cartData: { type: Object },
    address: { type: String },
    status: {
      type: String,
      enum: [
        'Pending', // chờ xử lý
        'Processing', // đang xử lý
        'Shipped', // đang vận chuyển
        'Delivered', // đã giao hàng
        'Cancelled', // đẫ hủy
        'Returned' // đã trả lại
      ],
      default: 'Pending'
    }
  },
  { collection: 'orders', timestamps: true }
);

module.exports = mongoose.model('orderModel', orderSchema);
