const { v4: uuidv4 } = require("uuid");

const correlationIdMiddleware = (req, res, next) => {
  // 1. Prüfen, ob der Request schon eine ID hat (z.B. vom Frontend oder Load Balancer)
  // Falls nicht, generieren wir eine ganz neue UUID.
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

  // 2. Wir speichern die ID im Request-Objekt
  // Das ist wichtig, damit unser Logger und Sentry später darauf zugreifen können.
  req.correlationId = correlationId;

  // 3. Wir senden die ID auch im Header zurück an den User
  // Das hilft enorm beim Debuggen im Browser (Network Tab).
  res.setHeader("x-correlation-id", correlationId);

  next();
};

module.exports = correlationIdMiddleware;
