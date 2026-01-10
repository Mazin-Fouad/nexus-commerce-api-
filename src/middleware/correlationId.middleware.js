const { v4: uuidv4 } = require("uuid");

/**
 * Middleware to attach a unique correlation ID to every request.
 * If the request already has an 'x-correlation-id' header, it uses that.
 * Otherwise, it generates a new UUID.
 */
const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

  // Attach to request object for use in other middlewares/controllers
  req.correlationId = correlationId;

  // Return it in response header so the client knows the ID
  res.setHeader("x-correlation-id", correlationId);

  next();
};

module.exports = correlationIdMiddleware;
