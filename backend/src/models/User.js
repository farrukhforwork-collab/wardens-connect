const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    serviceId: { type: String, trim: true },
    cnicHash: { type: String },
    cnicLast4: { type: String },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    status: { type: String, enum: ['pending', 'active', 'blocked'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    avatarUrl: { type: String },
    phone: { type: String },
    station: { type: String },
    city: { type: String },
    isSuperAdmin: { type: Boolean, default: false },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ serviceId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
