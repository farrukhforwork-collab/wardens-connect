const mongoose = require('mongoose');

const welfareTransactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    reason: { type: String },
    beneficiaryName: { type: String },
    beneficiaryAnonymized: { type: Boolean, default: false },
    proofDocs: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

welfareTransactionSchema.index({ transactionDate: -1 });

module.exports = mongoose.model('WelfareTransaction', welfareTransactionSchema);
