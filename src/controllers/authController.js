const { authenticateUser, registerUser } = require('../lib/accountService');
const { signToken } = require('../utils/jwt');


const register = async (req, res) => {
  try {
       const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    const token = signToken({ userId: user.id });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountNumber: user.accountNumber,
        balanceCents: user.balanceCents,
        pinSet: Boolean(user.pinHash),
        profilePicture: user.profilePicture,
        virtualCard: user.virtualCard ?? null
      }
    });
  } catch (error) {res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await authenticateUser(identifier, password);
    const token = signToken({ userId: user.id });
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountNumber: user.accountNumber,
        balanceCents: user.balanceCents,
        pinSet: Boolean(user.pinHash),
        profilePicture: user.profilePicture,
        virtualCard: user.virtualCard ?? null
      }
    });
  } catch (error) { res.status(401).json({ message: error.message });
  }
};

module.exports = { register, login };