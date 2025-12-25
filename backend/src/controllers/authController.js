const User = require('../models/User');
const { signToken } = require('../services/tokenService');
const { compareSensitive } = require('../utils/crypto');

const login = async (req, res, next) => {
  try {
    const { email, serviceId, cnic } = req.body;
    let user;

    if (email) {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: 'Password is required for email login' });
      }
      user = await User.findOne({ email: email.toLowerCase() }).populate('role');
      if (user && !user.passwordHash) {
        return res.status(400).json({ message: 'Password not set. Use Service ID + CNIC.' });
      }
      if (user) {
        const match = await compareSensitive(password, user.passwordHash);
        if (!match) user = null;
      }
    } else if (serviceId && cnic) {
      user = await User.findOne({ serviceId }).populate('role');
      if (user) {
        const match = await compareSensitive(cnic, user.cnicHash);
        if (!match) user = null;
      }
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    const token = signToken({ id: user.id, role: user.role?.name });
    user.lastLoginAt = new Date();
    await user.save();

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, me };
