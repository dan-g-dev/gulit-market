export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    // Log full detail server-side; never leak internals to the client.
    console.error(err);
  }
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
    details: statusCode === 500 ? undefined : err.details,
  });
}
