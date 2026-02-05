const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { User } = require('../models/User');
const { Transaction } = require('../models/Transaction');
const { generateAccountNumber } = require('../utils/accountNumber');
const { sendBeneficiaryEmail, sendWithdrawalEmail } = require('../services/emailService');

const KEYWORD_OVERRIDE = 'Africa';

const ensureUniqueAccountNumber = async () => {
  let accountNumber = generateAccountNumber();
  let exists = await User.findOne({ accountNumber });
  while (exists) {
    accountNumber = generateAccountNumber();
    exists = await User.findOne({ accountNumber });
  }
  return accountNumber;
};

const requirePin = async (userId, pin, session) => {
  const user = await User.findById(userId).session(session ?? null);
  if (!user) throw new Error('User not found');
  if (!user.pinHash) throw new Error('PIN not set');
  const valid = await bcrypt.compare(pin, user.pinHash);
  if (!valid) throw new Error('Invalid PIN');
  return user;
};

const registerUser = async (name, email, password) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const accountNumber = await ensureUniqueAccountNumber();
  const user = await User.create({
    name,
    email,
    passwordHash,
    accountNumber,
    balanceCents: 0
  });

  return user;
};

const authenticateUser = async (identifier, password) => {
  // Try to find user by account number first, then by email
  const user = await User.findOne({
    $or: [
      { accountNumber: identifier },
      { email: identifier.toLowerCase() }
    ]
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  return user;
};


const getUserById = async (userId) => {
  return User.findById(userId);
};

const setPin = async (userId, pin) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.pinHash = await bcrypt.hash(pin, 10);
  await user.save();
  return user;
};

const createVirtualCard = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.virtualCard) return user.virtualCard;

  const cardNumber = `4556${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  const last4 = cardNumber.slice(-4);
  const expiryMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  const expiryYear = String(new Date().getFullYear() + 4).slice(-2);
  const cvv = String(Math.floor(100 + Math.random() * 900));

  user.virtualCard = { cardNumber, last4, expiryMonth, expiryYear, cvv };
  await user.save();
  return user.virtualCard;
};

const depositFunds = async (userId, amountCents, keyword) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    if (keyword !== KEYWORD_OVERRIDE) {
      const transaction = await Transaction.create([
        {
          userId: user._id,
          type: 'deposit-pending',
          amountCents,
          balanceAfterCents: user.balanceCents,
          status: 'pending',
          description: 'Deposit awaiting payment details'
        }
      ], { session });

      await session.commitTransaction();
      return { user, transaction: transaction[0], status: 'pending' };
    }

    user.balanceCents += amountCents;
    await user.save({ session });

    const transaction = await Transaction.create([
      {
        userId: user._id,
        type: 'deposit',
        amountCents,
        balanceAfterCents: user.balanceCents,
        status: 'completed',
        description: 'Deposit'
      }
    ], { session });

    await session.commitTransaction();

    return { user, transaction: transaction[0], status: 'completed' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const withdrawFunds = async (userId, amountCents, pin, beneficiary) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await requirePin(userId, pin, session);
    if (user.balanceCents < amountCents) {
      throw new Error('Insufficient funds');
    }

    user.balanceCents -= amountCents;
    await user.save({ session });

    const transaction = await Transaction.create([
      {
        userId: user._id,
        type: 'withdrawal',
        amountCents,
        balanceAfterCents: user.balanceCents,
        status: 'completed',
        beneficiaryName: beneficiary.name,
        beneficiaryEmail: beneficiary.email,
        beneficiaryBank: beneficiary.bank,
        beneficiaryAccount: beneficiary.account,
        beneficiaryRoutingNumber: beneficiary.routing,
        beneficiaryIbanNumber: beneficiary.iban,
      }
    ], { session });

    await session.commitTransaction();

   await sendWithdrawalEmail(
  User.email,
  user.name,
  amountCents,
  user.balanceCents,
  {
    name: beneficiary.name,
    bank: beneficiary.bank,
    account: beneficiary.account
  }
);
    return { user, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const transferFunds = async (fromUserId, toAccountNumber, amountCents, pin) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromUser = await requirePin(fromUserId, pin, session);
    const toUser = await User.findOne({ accountNumber: toAccountNumber }).session(session);
    if (!toUser) {
      throw new Error('Recipient account not found');
    }

    if (fromUser.balanceCents < amountCents) {
      throw new Error('Insufficient funds');
    }
    if (toUser.balanceCents < 100){
      throw new Error('recipient account needs to hold atleast $100 to recieve a transfer')
    }

    fromUser.balanceCents -= amountCents;
    toUser.balanceCents += amountCents;

    await fromUser.save({ session });
    await toUser.save({ session });

    const [fromTx, toTx] = await Transaction.create([
      {
        userId: toUser._id,
        type: 'transfer-in',
        amountCents,
        balanceAfterCents: toUser.balanceCents,
        counterpartyAccount: fromUser.accountNumber,
        status: 'completed',
        description: 'Transfer from another account'
      }
    ], { session });

    await session.commitTransaction();


    return { fromUser, toUser, fromTransaction: fromTx, toTransaction: toTx };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const externalTransfer = async (userId, amountCents, pin, beneficiary) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await requirePin(userId, pin, session);
    if (user.balanceCents < amountCents) {
      throw new Error('Insufficient funds');
    }

    user.balanceCents -= amountCents;
    await user.save({ session });

    const transaction = await Transaction.create([
      {
        userId: user._id,
        type: 'external-transfer',
        amountCents,
        balanceAfterCents: user.balanceCents,
        status: 'completed',
        beneficiaryName: beneficiary.name,
        beneficiaryEmail: beneficiary.email,
        beneficiaryBank: beneficiary.bank,
        beneficiaryAccount: beneficiary.account,
        beneficiaryIbanNumber:beneficiary.iban,
        beneficiaryRoutingNumber:beneficiary.routing,
        beneficiarySwiftCode: beneficiary.swift,
        description: 'External transfer'
      }
    ], { session });

    await session.commitTransaction();

    await sendBeneficiaryEmail(
  beneficiary, 
  user.name,
  amountCents
);

    return { user, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const listTransactions = async (userId) => {
  return Transaction.find({ userId }).sort({ createdAt: -1 });
};

module.exports = {
  registerUser,
  authenticateUser,
  getUserById,
  setPin,
  createVirtualCard,
  depositFunds,
  withdrawFunds,
  transferFunds,
  externalTransfer,
  listTransactions
};
