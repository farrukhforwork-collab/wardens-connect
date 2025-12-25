const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['post', 'comment', 'message'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'reviewed', 'actioned'], default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
