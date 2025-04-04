const mongoose = require('mongoose');

const pushNotificationsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true
    },

    title: { type: String, required: true },
    message: { type: String, required: true },
    imageUrl: { type: String, required: false },
  },
  { collection: 'push_notifications', timestamps: true }
);

module.exports = mongoose.model(
  'pushNotificationsModel',
  pushNotificationsSchema
);
