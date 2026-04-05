const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  console.error(`[ERROR] ${timestamp} - Status: ${statusCode} - Message: ${message}`);

  res.status(statusCode).render('error', { message });
};

module.exports = errorHandler;