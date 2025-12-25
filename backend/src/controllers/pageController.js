const Page = require('../models/Page');

const createPage = async (req, res, next) => {
  try {
    const { name, type, description, coverUrl } = req.body;
    const page = await Page.create({
      name,
      type,
      description,
      coverUrl,
      admins: [req.user.id],
      moderators: []
    });
    res.status(201).json({ page });
  } catch (error) {
    next(error);
  }
};

const listPages = async (req, res, next) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json({ pages });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPage, listPages };
