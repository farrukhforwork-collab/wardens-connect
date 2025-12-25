const path = require('path');
const { spawn } = require('child_process');
const env = require('../config/env');
const User = require('../models/User');
const Role = require('../models/Role');
const { hashSensitive } = require('../utils/crypto');
const { recordAudit } = require('../services/auditService');

const seedDatabase = async (req, res, next) => {
  try {
    const provided = req.headers['x-seed-key'];
    if (!env.seedSecret || provided !== env.seedSecret) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const backendRoot = path.resolve(__dirname, '..', '..');
    const child = spawn(process.execPath, ['src/seed/seed.js'], {
      cwd: backendRoot,
      env: process.env
    });

    let stderr = '';
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) return res.json({ message: 'Seed complete' });
      return res.status(500).json({ message: 'Seed failed', detail: stderr.trim() });
    });
  } catch (error) {
    return next(error);
  }
};

const createSuperAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, serviceId, blockUserId } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
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

    const role = await Role.findOne({ name: 'Super Admin' });
    if (!role) return res.status(400).json({ message: 'Role not found' });

    const passwordHash = await hashSensitive(password);
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      serviceId,
      passwordHash,
      role: role.id,
      status: 'active',
      isSuperAdmin: true
    });

    await recordAudit({ actor: req.user.id, action: 'superadmin.create', target: user.id });

    if (blockUserId) {
      const toBlock = await User.findById(blockUserId);
      if (toBlock) {
        toBlock.status = 'blocked';
        await toBlock.save();
        await recordAudit({
          actor: req.user.id,
          action: 'user.block',
          target: toBlock.id
        });
      }
    }

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { seedDatabase, createSuperAdmin };
