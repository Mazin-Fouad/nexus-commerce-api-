require("dotenv").config();

const express = require("express");
const db = require("./database");

// Importiere die Router
const userRouter = require("./routes/user.routes.js");
const productRouter = require("./routes/product.routes.js");
const orderRouter = require("./routes/order.routes.js");
const errorHandler = require("./middleware/error.middleware.js");
const logger = require("./config/logger.config.js"); // Logger importieren

const app = express();

// Middleware, um JSON-Bodies zu parsen
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Registriere die Router
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);

app.get("/api/v1/status", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({
      status: "ok",
      message: "Datenbankverbindung ist erfolgreich hergestellt.",
    });
  } catch (error) {
    console.error("Fehler bei der Authentifizierung mit der Datenbank:", error);
    res.status(500).json({
      status: "error",
      message: "Datenbankverbindung fehlgeschlagen.",
      details: error.message,
      original_error: error.original
        ? error.original.message
        : "Keine weiteren Details.",
    });
  }
});

// Registriere die zentrale Fehlerbehandlungs-Middleware (MUSS NACH ALLEN ROUTEN KOMMEN)
app.use(errorHandler);

// Starte den Server nur, wenn die Datei direkt ausgeführt wird (nicht beim Import in Tests)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    // Verwende den Logger für Info-Meldungen
    logger.info(`🚀 Server wurde gestartet und läuft auf Port ${PORT}`);
  });
}

// Exportiere die App für die Tests
module.exports = app;
