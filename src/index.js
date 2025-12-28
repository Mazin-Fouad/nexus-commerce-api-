require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");

const db = require("./database");

// NEU: Redis initialisieren (Jetzt aktiv!)
require("./config/redis");

const userRoutes = require("./routes/user.routes.js");
const productRoutes = require("./routes/product.routes.js");
const orderRoutes = require("./routes/order.routes.js");
// NEU: Health Route importieren
const healthRoutes = require("./routes/health.routes.js");
const errorHandler = require("./middleware/error.middleware.js");
const logger = require("./config/logger.config.js"); // Logger importieren

// NEU: Swagger-Importe
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config.js");
// NEU: Import
const { apiLimiter } = require("./middleware/rateLimit.middleware.js");

const requestLogger = require("./middleware/requestLogger.middleware.js");

const app = express();

// NEU: Setze Security HTTP Headers (Muss ganz oben stehen)
app.use(helmet());

// NEU: Request Logger aktivieren (Damit wir jede Anfrage sehen)
app.use(requestLogger);

// Middleware
app.use(express.json());

// ENTFERNT: app.use(xss()); <-- Das brauchen wir nicht mehr global

// NEU: Verhindert HTTP Parameter Pollution
app.use(hpp());

// NEU: Professionelle CORS Konfiguration
const whitelist = ["http://localhost:3000", "http://localhost:8080"]; // Hier später deine Frontend-URL eintragen
const corsOptions = {
  origin: function (origin, callback) {
    // !origin erlaubt Anfragen ohne Origin (z.B. Postman oder Server-zu-Server)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Zugriff durch CORS verweigert"));
    }
  },
  credentials: true, // Erlaubt Cookies/Authorization Header
};

app.use(cors(corsOptions)); // Hier die Optionen übergeben!

// NEU: Rate Limiting global aktivieren
app.use("/api/v1", apiLimiter);

const PORT = process.env.PORT || 3000;

// Registriere die Router
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/health", healthRoutes);

// NEU: Route für die API-Dokumentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ENTFERNT: Der alte app.get("/api/v1/status"...) Block kann jetzt weg!
// Wir haben jetzt einen viel besseren /health Endpunkt.

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
