const Notification = require('../models/Notification');

const createNotification = async ({ user, type, message, data }) => {
  return Notification.create({ user, type, message, data });
};

module.exports = { createNotification };
