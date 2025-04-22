const mongoose = require('mongoose');

const Notificationchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true
    },
    content: { type: String, required: true, default: '' },
    status: { type: Number, required: true, default: 1 },
  },
  { collection: 'notification', timestamps: true }
);

module.exports = mongoose.model('notiModel', Notificationchema);
