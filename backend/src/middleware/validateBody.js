function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const error = new Error(issue?.message || "Invalid request body");
      error.statusCode = 400;
      return next(error);
    }

    req.body = parsed.data;
    return next();
  };
}

module.exports = { validateBody };
