const path = require('path');
const { spawn } = require('child_process');
const env = require('../config/env');

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

module.exports = { seedDatabase };
