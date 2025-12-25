const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document'], required: true },
    name: { type: String },
    size: { type: Number }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true },
    media: [mediaSchema],
    category: {
      type: String,
      enum: ['departmental', 'personal', 'welfare', 'training', 'achievements'],
      default: 'personal'
    },
    isOfficialNotice: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    visibility: { type: String, enum: ['all', 'department', 'station'], default: 'all' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reportCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
