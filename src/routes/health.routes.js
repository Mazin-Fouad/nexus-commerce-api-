const express = require("express");
const router = express.Router();
const healthController = require("../controllers/health.controller");

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System Health Check
 *     description: Prüft die Verbindung zur Datenbank und Redis sowie die Uptime.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System läuft normal.
 *       503:
 *         description: Ein Systemdienst (DB oder Redis) ist nicht erreichbar.
 */
router.get("/", healthController.getHealthStatus);

module.exports = router;
