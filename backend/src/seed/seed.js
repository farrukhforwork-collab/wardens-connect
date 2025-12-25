const mongoose = require('mongoose');
const env = require('../config/env');
const Role = require('../models/Role');
const User = require('../models/User');
const { hashSensitive } = require('../utils/crypto');

const seed = async () => {
  await mongoose.connect(env.mongoUri);

  await Role.deleteMany();
  await User.deleteMany();

  const roles = await Role.insertMany([
    { name: 'Super Admin', permissions: ['*'] },
    { name: 'Admin', permissions: ['users.approve', 'welfare.manage'] },
    { name: 'Moderator', permissions: ['reports.review'] },
    { name: 'Warden', permissions: ['posts.create'] }
  ]);

  const superRole = roles.find((r) => r.name === 'Super Admin');
  const cnicHash = await hashSensitive('12345-6789012-3');

  await User.create({
    fullName: 'HQ Super Admin',
    email: 'superadmin@wardens.local',
    serviceId: 'HQ-0001',
    cnicHash,
    cnicLast4: '0123',
    role: superRole.id,
    status: 'active',
    isSuperAdmin: true
  });

  console.log('Seed complete');
  await mongoose.disconnect();
};

seed();
