const rateLimit = require("express-rate-limit");

// Generelles Limit für alle API-Routen
// Erlaubt 100 Anfragen pro 15 Minuten pro IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Limit pro IP
  standardHeaders: true, // Sendet RateLimit Header (X-RateLimit-Limit etc.)
  legacyHeaders: false, // Deaktiviert die alten X-RateLimit-* Header
  message: {
    status: 429,
    message:
      "Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.",
  },
});

// Strenges Limit für Auth-Routen (Login/Register)
// Erlaubt nur 5 Versuche pro Stunde pro IP
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      "Zu viele Login-Versuche. Bitte versuchen Sie es in einer Stunde erneut.",
  },
});

module.exports = { apiLimiter, authLimiter };
