const Comment = require('../models/Comment');

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user.id,
      text
    });
    await comment.populate('author');
    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

const listComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author')
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, listComments };
