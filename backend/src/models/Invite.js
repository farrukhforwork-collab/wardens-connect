const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    serviceId: { type: String, required: true, trim: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

inviteSchema.index({ token: 1 });

module.exports = mongoose.model('Invite', inviteSchema);
