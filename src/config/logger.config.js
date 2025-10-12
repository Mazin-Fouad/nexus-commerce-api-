const winston = require("winston");

// Definiere die verschiedenen Log-Levels und ihre Farben
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const logColors = {
  fatal: "red",
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
  trace: "magenta",
};

winston.addColors(logColors);

// Definiere das Format für die Log-Ausgaben
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }), // Färbe die Ausgabe basierend auf dem Level
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Erstelle den Logger
const logger = winston.createLogger({
  levels: logLevels,
  format: logFormat,
  transports: [
    // In der Entwicklung wollen wir alle Logs in der Konsole sehen
    new winston.transports.Console({
      level: "trace", // Zeige alle Logs bis zum Level 'trace' an
    }),
    // In Produktion könnte man hier einen File-Transport hinzufügen:
    // new winston.transports.File({ filename: 'error.log', level: 'error' })
  ],
  exitOnError: false, // Die Anwendung soll bei einem Fehler nicht beendet werden
});

module.exports = logger;
