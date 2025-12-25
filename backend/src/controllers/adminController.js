const env = require('../config/env');
const { runSeed } = require('../seed/seed');

const seedDatabase = async (req, res, next) => {
  try {
    const provided = req.headers['x-seed-key'];
    if (!env.seedSecret || provided !== env.seedSecret) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await runSeed();
    return res.json({ message: 'Seed complete' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { seedDatabase };
