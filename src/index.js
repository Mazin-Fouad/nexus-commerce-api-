require("dotenv").config();
// 1. SENTRY IMPORTS (Ganz oben!)
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

// Middleware Imports
const requestLogger = require("./middleware/requestLogger.middleware");
const correlationIdMiddleware = require("./middleware/correlationId.middleware");
const errorHandler = require("./middleware/error.middleware");

// Router Imports
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const healthRoutes = require("./routes/health.routes");

const { sequelize } = require("./database");
const logger = require("./config/logger.config");
require("./config/redis"); // Redis initialisieren

const app = express();
const PORT = process.env.PORT || 3000;

// 2. SENTRY INITIALISIEREN
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(), // Profiling aktivieren
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // 100% der Transaktionen aufzeichnen (in Prod reduzieren!)
  // Profiling Settings
  profilesSampleRate: 1.0,
});

// 3. SENTRY REQUEST HANDLER (Muss die allererste Middleware sein!)
// Startet die Überwachung für jeden eingehenden Request.
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Security & Parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// 4. UNSER LOGGER-SETUP STARTEN
// Erst die ID generieren...
app.use(correlationIdMiddleware);
// ...dann loggen (damit die ID schon da ist)
app.use(requestLogger);

// Routen
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
// Health Check (unter beiden Pfaden erreichbar machen ist oft sinnvoll)
app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);

// Dokumentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sentry Debug-Route (Optional: Zum Testen, ob Sentry funktioniert)
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("Mein erster Sentry Test Fehler!");
});

// 5. SENTRY ERROR HANDLER (Muss VOR unserer eigenen Fehlerbehandlung kommen!)
app.use(Sentry.Handlers.errorHandler());

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    message: "Ressource nicht gefunden",
  });
});

// 6. EIGENER ERROR HANDLER (Als allerletztes)
app.use(errorHandler);

// Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Verbindung zur Datenbank erfolgreich hergestellt.");

    await sequelize.sync(); // Tabellen erstellen/aktualisieren

    app.listen(PORT, () => {
      logger.info(`Server läuft auf Port ${PORT}`);
      logger.info(
        `Dokumentation verfügbar unter http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    logger.error("Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
};

startServer();
