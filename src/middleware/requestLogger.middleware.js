const logger = require("../config/logger.config");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Wir hören auf das 'finish' Event der Response
  // Das wird gefeuert, wenn die Antwort an den Client gesendet wurde
  res.on("finish", () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      // Fehler oder Warnungen (4xx, 5xx)
      logger.warn(message, { correlationId: req.correlationId });
    } else {
      // Erfolgreiche Anfragen (2xx, 3xx)
      logger.info(message, { correlationId: req.correlationId });
    }
  });

  next();
};

module.exports = requestLogger;
