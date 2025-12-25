const User = require('../models/User');
const Role = require('../models/Role');
const { hashSensitive } = require('../utils/crypto');

const requestAccess = async (req, res, next) => {
  try {
    const { fullName, email, serviceId, rank, cnic, password, station, city, phone } = req.body;

    if (!fullName || !email || !serviceId || !cnic || !password) {
      return res.status(400).json({
        message: 'Full name, email, service ID, CNIC, and password are required'
      });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { serviceId }]
    });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const role = await Role.findOne({ name: 'Warden' });
    if (!role) return res.status(400).json({ message: 'Role not found' });

    const cnicHash = await hashSensitive(cnic);
    const cnicLast4 = cnic.slice(-4);

    const passwordHash = await hashSensitive(password);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      serviceId,
      rank,
      cnicHash,
      cnicLast4,
      passwordHash,
      role: role.id,
      station,
      city,
      phone,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Request submitted. Admin approval required.',
      userId: user.id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { requestAccess };
