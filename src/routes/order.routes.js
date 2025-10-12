const express = require("express");
const router = express.Router();

// Controller und Middleware importieren
const orderController = require("../controllers/order.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

// =================================================================
// GESCHÜTZTE ROUTEN (Authentifizierung erforderlich)
// =================================================================

// POST /api/v1/orders - Eine neue Bestellung aufgeben
router.post("/", [authMiddleware.verifyToken], orderController.create);

// GET /api/v1/orders - Die eigenen Bestellungen des angemeldeten Benutzers abrufen
router.get("/", [authMiddleware.verifyToken], orderController.findAll);

// GET /api/v1/orders/:id - Eine spezifische Bestellung abrufen
router.get("/:id", [authMiddleware.verifyToken], orderController.findOne);

// =================================================================
// ADMIN-ROUTEN (Admin-Rolle erforderlich)
// =================================================================

// GET /api/v1/orders/admin/all - Alle Bestellungen aller Kunden abrufen
router.get(
  "/admin/all",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.adminFindAll
);

// PATCH /api/v1/orders/admin/:id/status - Den Status einer Bestellung aktualisieren
router.patch(
  "/admin/:id/status",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.updateStatus
);

module.exports = router;
