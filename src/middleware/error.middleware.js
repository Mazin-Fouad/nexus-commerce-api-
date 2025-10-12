const logger = require("../config/logger.config.js"); // Logger importieren

const errorHandler = (err, req, res, next) => {
  // Logge den Fehler für den Entwickler.
  // Wir verwenden jetzt unseren professionellen Logger statt console.error.
  logger.error(err.stack);

  // Setze einen Standard-Statuscode und eine Standard-Nachricht,
  // falls der Fehler keine spezifischen Informationen enthält.
  const statusCode = err.statusCode || 500;
  const message = err.message || "Ein interner Serverfehler ist aufgetreten.";

  // Sende eine standardisierte JSON-Antwort an den Client.
  // Der Client sollte niemals den vollen 'err.stack' sehen, da dies ein Sicherheitsrisiko ist.
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

module.exports = errorHandler;
