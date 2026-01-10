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

// Format für die Ausgabe (wie der Text aussieht)
const printFormat = winston.format.printf((info) => {
  const idString = info.correlationId ? `[${info.correlationId}] ` : "";
  return `${info.timestamp} ${idString}${info.level}: ${info.message}`;
});

// Erstelle den Logger
const logger = winston.createLogger({
  levels: logLevels,
  // Standard-Format für alle Transports (Timestamp ist immer wichtig)
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printFormat // Hier kein Colorize, damit Dateien sauber bleiben
  ),
  transports: [
    // 1. Konsole: Hier wollen wir Farben!
    new winston.transports.Console({
      level: "trace",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.colorize({ all: true }), // Nur für Konsole bunt
        printFormat
      ),
    }),
    // 2. Datei für Fehler (persistent)
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    // 3. Datei für Alles (persistent)
    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
  exitOnError: false, // Die Anwendung soll bei einem Fehler nicht beendet werden
});

module.exports = logger;
