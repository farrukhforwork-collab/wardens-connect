const User = require('../models/User');
const Role = require('../models/Role');
const Post = require('../models/Post');
const { hashSensitive } = require('../utils/crypto');
const { recordAudit } = require('../services/auditService');

const createUser = async (req, res, next) => {
  try {
    const { fullName, email, serviceId, cnic, roleName, station, city, phone } = req.body;
    if (!email || !serviceId || !cnic) {
      return res.status(400).json({
        message: 'Email, Service ID, and CNIC are required for invites'
      });
    }
    const role = await Role.findOne({ name: roleName || 'Warden' });
    if (!role) return res.status(400).json({ message: 'Role not found' });

    const cnicHash = cnic ? await hashSensitive(cnic) : undefined;
    const cnicLast4 = cnic ? cnic.slice(-4) : undefined;

    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      serviceId,
      cnicHash,
      cnicLast4,
      role: role.id,
      station,
      city,
      phone
    });

    await recordAudit({ actor: req.user?.id, action: 'user.create', target: user.id });

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

const listPending = async (req, res, next) => {
  try {
    const users = await User.find({ status: 'pending' }).populate('role');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'active';
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save();

    await recordAudit({ actor: req.user.id, action: 'user.approve', target: user.id });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('role');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { roleName } = req.body;
    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(400).json({ message: 'Role not found' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: role.id },
      { new: true }
    ).populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    await recordAudit({ actor: req.user.id, action: 'user.role.update', target: user.id });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'blocked' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    await recordAudit({ actor: req.user.id, action: 'user.block', target: user.id });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const allowed = ['fullName', 'station', 'city', 'phone', 'avatarUrl', 'coverUrl'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).populate(
      'role'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    await recordAudit({ actor: req.user.id, action: 'user.profile.update', target: user.id });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const posts = await Post.find({ author: user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ user, posts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  listPending,
  approveUser,
  listUsers,
  updateUserRole,
  blockUser,
  updateMe,
  getProfile
};
