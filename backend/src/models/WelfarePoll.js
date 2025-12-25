const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { _id: false }
);

const welfarePollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    options: { type: [optionSchema], required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    closesAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WelfarePoll', welfarePollSchema);
