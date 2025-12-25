const WelfareTransaction = require('../models/WelfareTransaction');

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

module.exports = { addTransaction, getDashboard };
