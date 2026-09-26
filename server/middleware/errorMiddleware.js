// Malformed JSON payloads from express.json() surface here with status 400
const malformedJsonError = (err, req, res, next) => {
  if (err.status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
};

const isDatabaseError = (err) =>
  err.code === 'MONGO_URI_MISSING' ||
  (err.name === 'MongooseError' && err.message?.includes('buffering timed out')) ||
  [
    'MongoNetworkError',
    'MongoParseError',
    'MongoServerSelectionError',
    'MongoTimeoutError',
    'MongooseServerSelectionError',
  ].includes(err.name);

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Centralized error handler
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  if (isDatabaseError(err)) {
    statusCode = 503;
    message = 'Database temporarily unavailable';
  }

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose: duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'Value';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose: validation failure
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { malformedJsonError, notFound, errorHandler };