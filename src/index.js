require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./database");

// NEU: Redis initialisieren (Jetzt aktiv!)
require("./config/redis");

const userRoutes = require("./routes/user.routes.js");
const productRoutes = require("./routes/product.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const errorHandler = require("./middleware/error.middleware.js");
const logger = require("./config/logger.config.js"); // Logger importieren

// NEU: Swagger-Importe
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config.js");

const app = express();

// Middleware, um JSON-Bodies zu parsen
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Registriere die Router
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);

// NEU: Route für die API-Dokumentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
