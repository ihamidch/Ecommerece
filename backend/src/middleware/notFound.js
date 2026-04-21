function notFound(req, res) {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { notFound };
