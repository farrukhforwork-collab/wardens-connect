const Message = require('../models/Message');
const { getIo } = require('../services/socketService');

const sendMessage = async (req, res, next) => {
  try {
    const { to, group, text, attachment } = req.body;
    const message = await Message.create({
      from: req.user.id,
      to,
      group,
      text,
      attachment
    });

    const io = getIo();
    if (io) {
      if (to) io.to(`user:${to}`).emit('message:new', message);
      if (group) io.to(`group:${group}`).emit('group:message', message);
    }

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const { withUser, groupId } = req.query;
    let query = {};
    if (withUser) {
      query = {
        $or: [
          { from: req.user.id, to: withUser },
          { from: withUser, to: req.user.id }
        ]
      };
    }
    if (groupId) {
      query = { group: groupId };
    }
    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(200);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, listMessages };
