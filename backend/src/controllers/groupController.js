const Group = require('../models/Group');

const createGroup = async (req, res, next) => {
  try {
    const { name, type, members, isReadOnly } = req.body;
    const group = await Group.create({
      name,
      type,
      isReadOnly: Boolean(isReadOnly),
      members: members || [req.user.id],
      admins: [req.user.id]
    });
    res.status(201).json({ group });
  } catch (error) {
    next(error);
  }
};

const listGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user.id });
    res.json({ groups });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, listGroups };
