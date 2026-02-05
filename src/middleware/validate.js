const validateBody = (schema) => (req, res, next) => {
  const result = schema(req.body);
  if (result.errors) {
    res.status(400).json({ message: 'Validation error', errors: result.errors });
    return;
  }
  // Create a new object with validated data
  req.body = result.value;
  next();
};

module.exports = { validateBody };