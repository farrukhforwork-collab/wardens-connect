const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'department',
        'welfare',
        'training',
        'sports',
        'memorial',
        'community'
      ],
      default: 'community'
    },
    description: { type: String },
    coverUrl: { type: String },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
