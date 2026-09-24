const Log = require('../models/Log');

const errorHandler = async (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  // Attempt to log critical error asynchronously
  try {
    await Log.create({
      level: 'ERROR',
      category: 'SYSTEM',
      message: err.message || 'Internal Server Error',
      details: {
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
      },
      ip: req.ip,
      userId: req.user?._id
    });
  } catch (logErr) {
    // Non-blocking fallback
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Internal Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
