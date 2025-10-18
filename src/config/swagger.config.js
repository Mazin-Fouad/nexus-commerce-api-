const swaggerJSDoc = require("swagger-jsdoc");

// 1. Grundlegende Metadaten über unsere API
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Nexus Commerce API",
    version: "1.0.0",
    description:
      "Eine RESTful-API für eine E-Commerce-Plattform, dokumentiert mit Swagger. Diese API ermöglicht die Verwaltung von Benutzern, Produkten und Bestellungen.",
    contact: {
      name: "API Support",
      email: "support@nexuscommerce.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Lokaler Entwicklungsserver",
    },
    {
      url: "https://api.nexuscommerce.com/api/v1",
      description: "Produktionsserver",
    },
  ],
  // 2. Sicherheits-Schemas definieren
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Geben Sie Ihr JWT-Token ein (wird automatisch nach dem Login erhalten)",
      },
    },
  },
  // 3. Globale Sicherheitsanforderungen (kann pro Endpoint überschrieben werden)
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// 2. Optionen für das swagger-jsdoc-Paket
const options = {
  swaggerDefinition,
  // Pfade zu den Dateien, die API-Endpunkt-Dokumentationen enthalten
  apis: ["./src/routes/*.js", "./src/models/*.js"], // Wir fügen auch Modelle hinzu, um Schemas zu definieren
};

// 3. Initialisiere swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
