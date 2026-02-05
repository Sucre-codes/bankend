const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    amountCents: { type: Number, required: true, min: 1 },
    balanceAfterCents: { type: Number, required: true, min: 0 },
    status: { type: String, required: true },
    counterpartyAccount: { type: String },
    beneficiaryName: { type: String },
    beneficiaryEmail: { type: String },
    beneficiaryBank: { type: String },
    beneficiaryAccount: { type: String },
    beneficiaryRoutingNumber:{type: String},
    beneficiarySwiftCode:{type:String},
    beneficiaryIbanNumber:{type:String},
    description: { type: String }
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };