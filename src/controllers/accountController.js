const {
  createVirtualCard,
  depositFunds,
  externalTransfer,
  getUserById,
  listTransactions,
  setPin,
  transferFunds,
  withdrawFunds
} = require('../lib/accountService');

const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      accountNumber: user.accountNumber,
      balanceCents: user.balanceCents,
      pinSet: Boolean(user.pinHash),
      profilePicture: user.profilePicture,
      virtualCard: user.virtualCard ?? null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setPinHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { pin } = req.body;
    const user = await setPin(userId, pin);
    res.status(200).json({ pinSet: Boolean(user.pinHash) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createCard = async (req, res) => {
  try {
    const userId = req.userId;
    const card = await createVirtualCard(userId);
    res.status(201).json({ virtualCard: card });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deposit = async (req, res) => {
  try {
    const userId = req.userId;
    const { amountCents, keyword } = req.body;
    const result = await depositFunds(userId, amountCents, keyword);
    res.status(200).json({
      balanceCents: result.user.balanceCents,
      status: result.status
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const withdraw = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      amountCents,
      pin,
      beneficiaryName,
      beneficiaryEmail,
      beneficiaryBank,
      beneficiaryAccount,
      beneficiaryRoutingNumber,
      beneficiarySwiftCode,
      beneficiaryIbanNumber
    } = req.body;
    
    const result = await withdrawFunds(userId, amountCents, pin, {
      name: beneficiaryName,
      email: beneficiaryEmail,
      bank: beneficiaryBank,
      account: beneficiaryAccount,
      routing: beneficiaryRoutingNumber || null,
      iban: beneficiaryIbanNumber || null,
      swift: beneficiarySwiftCode || null
    });
    
    res.status(200).json({
      balanceCents: result.user.balanceCents,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const transfer = async (req, res) => {
  try {
    const userId = req.userId;
    const { amountCents, toAccountNumber, pin } = req.body;
    const result = await transferFunds(userId, toAccountNumber, amountCents, pin);
    res.status(200).json({
      balanceCents: result.fromUser.balanceCents,
      transaction: result.fromTransaction
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const externalTransferHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      amountCents, 
      pin, 
      beneficiaryName, 
      beneficiaryEmail, 
      beneficiaryBank, 
      beneficiaryAccount,
      beneficiaryRoutingNumber,
      beneficiarySwiftCode,
      beneficiaryIbanNumber
    } = req.body;
    
    const result = await externalTransfer(userId, amountCents, pin, {
      name: beneficiaryName,
      email: beneficiaryEmail,
      bank: beneficiaryBank,
      account: beneficiaryAccount,
      routing: beneficiaryRoutingNumber || null,
      iban: beneficiaryIbanNumber || null,
      swift: beneficiarySwiftCode || null
    });
    
    res.status(200).json({
      balanceCents: result.user.balanceCents,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  const userId = req.userId;
  const data = await listTransactions(userId);
  res.status(200).json({ transactions: data });
};

module.exports = {
  getProfile,
  setPinHandler,
  createCard,
  deposit,
  withdraw,
  transfer,
  externalTransferHandler,
  getTransactions
};