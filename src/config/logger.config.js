const winston = require("winston");

// Definiere die verschiedenen Log-Levels
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
  // Wenn wir eine Correlation ID haben, zeigen wir sie in eckigen Klammern an
  const idString = info.correlationId ? `[${info.correlationId}] ` : "";
  return `${info.timestamp} ${idString}${info.level}: ${info.message}`;
});

// Erstelle den Logger
const logger = winston.createLogger({
  levels: logLevels,
  // Basis-Format
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }), // Stack Trace bei Fehlern beibehalten
    winston.format.json() // Standardmäßig JSON für einfache Verarbeitung durch Tools
  ),
  transports: [
    // 1. Konsole (Bunt und Lesbar für dich)
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        printFormat // Hier nutzen wir unser lesbares Format
      ),
    }),

    // 2. Fehler-Datei (Dokumentation aller Fehler)
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      format: winston.format.combine(winston.format.uncolorize(), printFormat),
    }),

    // 3. Alle Logs Datei (Vollständige Historie/Blackbox)
    new winston.transports.File({
      filename: "combined.log",
      format: winston.format.combine(winston.format.uncolorize(), printFormat),
    }),
  ],
});

module.exports = logger;
