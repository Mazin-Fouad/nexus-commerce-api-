require("dotenv").config();
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

const requestLogger = require("./middleware/requestLogger.middleware");
const correlationIdMiddleware = require("./middleware/correlationId.middleware");
const errorHandler = require("./middleware/error.middleware");

const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const healthRoutes = require("./routes/health.routes");

const { sequelize } = require("./database");
const logger = require("./config/logger.config");
require("./config/redis");

const app = express();
const PORT = process.env.PORT || 3000;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const sentryRequestHandler = Sentry.Handlers?.requestHandler?.();
const sentryTracingHandler = Sentry.Handlers?.tracingHandler?.();
const sentryErrorHandler = Sentry.Handlers?.errorHandler?.();

if (sentryRequestHandler) app.use(sentryRequestHandler);
if (sentryTracingHandler) app.use(sentryTracingHandler);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(correlationIdMiddleware);
app.use(requestLogger);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (sentryErrorHandler) app.use(sentryErrorHandler);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Ressource nicht gefunden",
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Verbindung zur Datenbank erfolgreich hergestellt.");

    await sequelize.sync();

    app.listen(PORT, () => {
      logger.info(`Server läuft auf Port ${PORT}`);
      logger.info(
        `Dokumentation verfügbar unter http://localhost:${PORT}/api-docs`,
      );
    });
  } catch (error) {
    logger.error("Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
};

startServer();
