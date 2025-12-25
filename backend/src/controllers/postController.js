const Post = require('../models/Post');
const { getPagination } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');

const createPost = async (req, res, next) => {
  try {
    const { text, media, category, isOfficialNotice } = req.body;
    if (
      isOfficialNotice &&
      !['Admin', 'Super Admin'].includes(req.user.role?.name) &&
      !req.user.isSuperAdmin
    ) {
      return res.status(403).json({ message: 'Only admins can post official notices' });
    }
    const post = await Post.create({
      author: req.user.id,
      text,
      media: media || [],
      category,
      isOfficialNotice: Boolean(isOfficialNotice)
    });

    await createNotification({
      user: req.user.id,
      type: 'post.created',
      message: 'Your post was published',
      data: { postId: post.id }
    });

    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
};

const listPosts = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.official === 'true') filters.isOfficialNotice = true;
    if (req.query.category) filters.category = req.query.category;
    const { limit, skip } = getPagination(req.query);
    const posts = await Post.find(filters)
      .populate('author')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ posts });
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const exists = post.likes.includes(req.user.id);
    post.likes = exists
      ? post.likes.filter((id) => id.toString() !== req.user.id)
      : post.likes.concat(req.user.id);
    await post.save();
    res.json({ post });
  } catch (error) {
    next(error);
  }
};

const pinPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isPinned: true },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (error) {
    next(error);
  }
};

const removePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPost, listPosts, toggleLike, pinPost, removePost };
