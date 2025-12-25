const WelfareTransaction = require('../models/WelfareTransaction');
const WelfarePoll = require('../models/WelfarePoll');

const formatPoll = (poll, userId) => {
  const options = poll.options.map((option) => ({
    label: option.label,
    votes: option.votes.length
  }));
  const winner = options.reduce(
    (best, option) => {
      if (!best || option.votes > best.votes) return option;
      if (option.votes === best.votes) return null;
      return best;
    },
    null
  );
  const hasVoted = poll.options.some((option) =>
    option.votes.some((vote) => vote.toString() === userId)
  );

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    status: poll.status,
    createdAt: poll.createdAt,
    closesAt: poll.closesAt || null,
    options,
    winner,
    hasVoted
  };
};

const addTransaction = async (req, res, next) => {
  try {
    const transaction = await WelfareTransaction.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const month = req.query.month;
    let rangeStart;
    let rangeEnd;

    if (month) {
      const [year, monthValue] = month.split('-').map((value) => parseInt(value, 10));
      if (Number.isNaN(year) || Number.isNaN(monthValue)) {
        return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
      }
      rangeStart = new Date(Date.UTC(year, monthValue - 1, 1));
      rangeEnd = new Date(Date.UTC(year, monthValue, 1));
    }

    const match = rangeStart
      ? { transactionDate: { $gte: rangeStart, $lt: rangeEnd } }
      : {};
    const transactions = await WelfareTransaction.find(match).sort({ transactionDate: -1 });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      transactions,
      month: month || null
    });
  } catch (error) {
    next(error);
  }
};

const listPolls = async (req, res, next) => {
  try {
    const polls = await WelfarePoll.find().sort({ createdAt: -1 });
    const formatted = polls.map((poll) => formatPoll(poll, req.user.id));
    res.json({ polls: formatted });
  } catch (error) {
    next(error);
  }
};

const createPoll = async (req, res, next) => {
  try {
    const { title, description, options, closesAt } = req.body;
    if (!title || !options || options.length < 2) {
      return res.status(400).json({ message: 'Title and at least two options are required.' });
    }
    const poll = await WelfarePoll.create({
      title,
      description,
      options: options.map((label) => ({ label })),
      createdBy: req.user.id,
      closesAt: closesAt ? new Date(closesAt) : null
    });
    res.status(201).json({ poll: formatPoll(poll, req.user.id) });
  } catch (error) {
    next(error);
  }
};

const votePoll = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const poll = await WelfarePoll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.status !== 'open') {
      return res.status(400).json({ message: 'Poll is closed' });
    }
    const alreadyVoted = poll.options.some((option) =>
      option.votes.some((vote) => vote.toString() === req.user.id)
    );
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }
    if (optionIndex === undefined || !poll.options[optionIndex]) {
      return res.status(400).json({ message: 'Invalid option' });
    }
    poll.options[optionIndex].votes.push(req.user.id);
    await poll.save();
    res.json({ poll: formatPoll(poll, req.user.id) });
  } catch (error) {
    next(error);
  }
};

const closePoll = async (req, res, next) => {
  try {
    const poll = await WelfarePoll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    poll.status = 'closed';
    await poll.save();
    res.json({ poll: formatPoll(poll, req.user.id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransaction,
  getDashboard,
  listPolls,
  createPoll,
  votePoll,
  closePoll
};
