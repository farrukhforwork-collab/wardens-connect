const User = require('../models/User');
const Role = require('../models/Role');
const Post = require('../models/Post');
const { hashSensitive, compareSensitive } = require('../utils/crypto');
const { getOnlineUserIds } = require('../services/socketService');
const { recordAudit } = require('../services/auditService');

const createUser = async (req, res, next) => {
  try {
    const { fullName, email, serviceId, cnic, password, roleName, station, city, phone } =
      req.body;
    if (!email || !serviceId || !cnic) {
      return res.status(400).json({
        message: 'Email, Service ID, and CNIC are required for invites'
      });
    }
    const role = await Role.findOne({ name: roleName || 'Warden' });
    if (!role) return res.status(400).json({ message: 'Role not found' });

    const cnicHash = cnic ? await hashSensitive(cnic) : undefined;
    const cnicLast4 = cnic ? cnic.slice(-4) : undefined;

    const passwordHash = password ? await hashSensitive(password) : undefined;

    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      serviceId,
      cnicHash,
      cnicLast4,
      passwordHash,
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

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      const match = await compareSensitive(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    user.passwordHash = await hashSensitive(newPassword);
    await user.save();

    await recordAudit({ actor: req.user.id, action: 'user.password.update', target: user.id });

    res.json({ message: 'Password updated' });
  } catch (error) {
    next(error);
  }
};

const listChatUsers = async (req, res, next) => {
  try {
    const onlineIds = new Set(getOnlineUserIds());
    const users = await User.find({ status: 'active' })
      .select('fullName avatarUrl rank station city role')
      .populate('role');

    const list = users
      .filter((u) => u.id !== req.user.id)
      .map((u) => ({
        _id: u.id,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        rank: u.rank,
        station: u.station,
        city: u.city,
        role: u.role ? { name: u.role.name } : null,
        isOnline: onlineIds.has(u.id)
      }));

    res.json({ users: list });
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
  updatePassword,
  getProfile,
  listChatUsers
};
