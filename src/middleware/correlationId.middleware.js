const correlationIdMiddleware = async (req, res, next) => {
  const { v4: uuidv4 } = await import("uuid");
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  next();
};

module.exports = correlationIdMiddleware;
