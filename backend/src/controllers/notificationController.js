const Notification = require('../models/Notification');

const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { isRead: true });
    res.json({ message: 'ok' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listNotifications, markRead };
