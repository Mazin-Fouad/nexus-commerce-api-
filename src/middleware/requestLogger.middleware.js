const logger = require("../config/logger.config");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Wir hören auf das 'finish' Event der Response
  // Das wird gefeuert, wenn die Antwort an den Client gesendet wurde
  res.on("finish", () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    // Wir packen die ID in ein Objekt und geben sie als 2. Argument an den Logger.
    // Unser Log-Format aus Schritt 3 weiß dann, wie es das anzeigen soll.
    const meta = { correlationId: req.correlationId };

    if (res.statusCode >= 400) {
      // Fehler oder Warnungen (4xx, 5xx)
      logger.warn(message, meta);
    } else {
      // Erfolgreiche Anfragen (2xx, 3xx)
      logger.info(message, meta);
    }
  });

  next();
};

module.exports = requestLogger;
