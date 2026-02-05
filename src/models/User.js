const mongoose = require('mongoose');
const { Schema } = mongoose;

const virtualCardSchema = new Schema(
  {
    cardNumber: { type: String, required: true },
    last4: { type: String, required: true },
    expiryMonth: { type: String, required: true },
    expiryYear: { type: String, required: true },
    cvv: { type: String, required: true }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    pinHash: { type: String },
    accountNumber: { type: String, required: true, unique: true },
    balanceCents: { type: Number, required: true, min: 0 },
    virtualCard: { type: virtualCardSchema },
    profilePicture: { type: String }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = { User };