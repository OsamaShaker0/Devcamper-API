let errorHandler = (err, req, res, next) => {
  // mongoose bad ObjectId
  if (err.name === 'CastError') {
    err.message = `Resource Not found`;
    err.statusCode = 404;
  }
  // mongoose duplicate key
  if (err.code === 11000) {
    // console.log(err)
    err.message = `Duplicate field value entered`;
    err.statusCode = 400;
  }
  // mongoose validation error
  if (err.name === 'ValidationError') {
    err.message = Object.values(err.errors).map((val) => val.message);
    err.statusCode = 400;
  }
  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};

module.exports = errorHandler;
