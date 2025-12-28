const redis = require("redis");
const logger = require("./logger.config");

// Erstelle den Redis-Client
const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => {
  logger.error("Redis Client Fehler: " + err);
});

client.on("connect", () => {
  logger.info("Verbindung zu Redis erfolgreich hergestellt.");
});

// Verbinde den Client (in neueren Redis-Versionen ist das asynchron)
(async () => {
  try {
    await client.connect();
  } catch (err) {
    logger.error("Konnte nicht mit Redis verbinden: " + err);
  }
})();

module.exports = client;
