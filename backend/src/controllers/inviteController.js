const crypto = require('crypto');
const Invite = require('../models/Invite');
const Role = require('../models/Role');
const User = require('../models/User');
const { hashSensitive } = require('../utils/crypto');
const { recordAudit } = require('../services/auditService');
const env = require('../config/env');

const createInvite = async (req, res, next) => {
  try {
    const { email, serviceId, roleName, expiresInDays } = req.body;
    if (!email || !serviceId) {
      return res.status(400).json({ message: 'Email and Service ID are required' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { serviceId }]
    });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const role = await Role.findOne({ name: roleName || 'Warden' });
    if (!role) return res.status(400).json({ message: 'Role not found' });

    const token = crypto.randomBytes(24).toString('hex');
    const days = Math.max(parseInt(expiresInDays || '7', 10), 1);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const invite = await Invite.create({
      token,
      email: email.toLowerCase(),
      serviceId,
      role: role.id,
      createdBy: req.user.id,
      expiresAt
    });

    await recordAudit({ actor: req.user.id, action: 'invite.create', target: invite.id });

    const link = `${env.clientUrl}/invite/${token}`;
    res.status(201).json({ invite, link });
  } catch (error) {
    next(error);
  }
};

const getInvite = async (req, res, next) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token }).populate('role');
    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    if (invite.usedAt) return res.status(400).json({ message: 'Invite already used' });
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite expired' });
    }
    res.json({
      invite: {
        email: invite.email,
        serviceId: invite.serviceId,
        role: invite.role?.name
      }
    });
  } catch (error) {
    next(error);
  }
};

const registerWithInvite = async (req, res, next) => {
  try {
    const { fullName, cnic, password, station, city, phone } = req.body;
    if (!fullName || !cnic || !password) {
      return res.status(400).json({ message: 'Full name, CNIC, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const invite = await Invite.findOne({ token: req.params.token }).populate('role');
    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    if (invite.usedAt) return res.status(400).json({ message: 'Invite already used' });
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite expired' });
    }

    const existing = await User.findOne({
      $or: [{ email: invite.email }, { serviceId: invite.serviceId }]
    });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const cnicHash = await hashSensitive(cnic);
    const cnicLast4 = cnic.slice(-4);
    const passwordHash = await hashSensitive(password);
    const user = await User.create({
      fullName,
      email: invite.email,
      serviceId: invite.serviceId,
      cnicHash,
      cnicLast4,
      passwordHash,
      role: invite.role.id,
      station,
      city,
      phone,
      status: 'pending'
    });

    invite.usedAt = new Date();
    invite.usedBy = user.id;
    await invite.save();

    await recordAudit({ actor: req.user?.id, action: 'invite.used', target: invite.id });

    res.status(201).json({ message: 'Application submitted for approval' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createInvite, getInvite, registerWithInvite };
