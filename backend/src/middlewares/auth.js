const { verifyToken } = require('../services/tokenService');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing token' });
    }
    const token = header.replace('Bearer ', '');
    const payload = verifyToken(token);
    const user = await User.findById(payload.id).populate('role');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account not active' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
