const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    usageLimit: { type: Number, required: false },
    image: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'Active', // hoạt động
        'Inactive', // không hoạt động
        'Expired', // hết hạn
        'Cancelled' // đã bị hủy
      ],
      default: 'Active'
    },
    discountValue: { type: Number, required: false }
  },
  { collection: 'vouchers' }
);

module.exports = mongoose.model('voucherModel', voucherSchema);
