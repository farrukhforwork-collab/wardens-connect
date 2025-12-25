const Message = require('../models/Message');
const { getIo } = require('../services/socketService');
const { encryptMessage, decryptMessage } = require('../utils/cryptoMessage');

const sendMessage = async (req, res, next) => {
  try {
    const { to, group, text, attachment } = req.body;
    if (!to && !group) {
      return res.status(400).json({ message: 'Message target is required' });
    }
    if (to && group) {
      return res.status(400).json({ message: 'Use either direct or group message' });
    }
    const encryptedText = text ? encryptMessage(text) : null;
    const message = await Message.create({
      from: req.user.id,
      to,
      group,
      text: null,
      encryptedText,
      attachment
    });

    const payload = {
      ...message.toObject(),
      text
    };

    const io = getIo();
    if (io) {
      if (to) io.to(`user:${to}`).emit('message:new', payload);
      if (group) io.to(`group:${group}`).emit('group:message', payload);
    }

    res.status(201).json({ message: payload });
  } catch (error) {
    next(error);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const { withUser, groupId } = req.query;
    let query = {};
    if (withUser) {
      if (withUser === req.user.id) {
        return res.status(400).json({ message: 'Invalid user' });
      }
      const exists = await Message.exists({
        $or: [
          { from: req.user.id, to: withUser },
          { from: withUser, to: req.user.id }
        ]
      });
      if (!exists) {
        return res.status(403).json({ message: 'Not authorized' });
      }
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
    if (withUser && groupId) {
      return res.status(400).json({ message: 'Use either withUser or groupId' });
    }
    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(200);
    const decrypted = messages.map((msg) => {
      const payload = msg.toObject();
      if (payload.encryptedText) {
        payload.text = decryptMessage(payload.encryptedText);
      }
      return payload;
    });
    res.json({ messages: decrypted });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, listMessages };
