const Report = require('../models/Report');

const createReport = async (req, res, next) => {
  try {
    const report = await Report.create({
      ...req.body,
      reportedBy: req.user.id
    });
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
};

const listReports = async (req, res, next) => {
  try {
    const reports = await Report.find().populate('reportedBy').sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, listReports };
