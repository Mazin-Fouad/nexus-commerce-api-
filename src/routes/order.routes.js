const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const {
  createOrderRules,
  updateStatusRules,
  validate,
} = require("../validators/order.validator.js");

// =================================================================
// GESCHÜTZTE ROUTEN (Authentifizierung erforderlich)
// =================================================================

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Erstellt eine neue Bestellung
 *     description: Ermöglicht es authentifizierten Benutzern, eine neue Bestellung aufzugeben. Die Preise werden zum aktuellen Zeitpunkt aus der Produktdatenbank übernommen.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Bestellung wurde erfolgreich erstellt.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Ungültige Eingabedaten oder Produkt nicht verfügbar.
 *       401:
 *         description: Nicht authentifiziert.
 *       500:
 *         description: Interner Serverfehler.
 */
router.post(
  "/",
  [authMiddleware.verifyToken],
  createOrderRules(),
  validate,
  orderController.create
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Ruft alle Bestellungen des angemeldeten Benutzers ab (mit Paginierung)
 *     description: Gibt eine paginierte Liste aller Bestellungen zurück, die der aktuell angemeldete Benutzer aufgegeben hat.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Die Seitennummer
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Anzahl der Elemente pro Seite
 *     responses:
 *       200:
 *         description: Eine paginierte Liste von Bestellungen.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: Nicht authentifiziert.
 *       500:
 *         description: Interner Serverfehler.
 */
router.get("/", [authMiddleware.verifyToken], orderController.findAllForUser);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Ruft eine spezifische Bestellung ab
 *     description: Gibt die Details einer bestimmten Bestellung zurück. Benutzer können nur ihre eigenen Bestellungen abrufen.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID der Bestellung.
 *         example: 1
 *     responses:
 *       200:
 *         description: Die Bestelldaten wurden erfolgreich abgerufen.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Bestellung wurde nicht gefunden.
 *       401:
 *         description: Nicht authentifiziert.
 *       403:
 *         description: Zugriff verweigert (nicht Ihre Bestellung).
 *       500:
 *         description: Interner Serverfehler.
 */
router.get("/:id", [authMiddleware.verifyToken], orderController.findOne);

// =================================================================
// ADMIN-ROUTEN (Admin-Rolle erforderlich)
// =================================================================

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Ruft alle Bestellungen ab (Nur Admin, mit Paginierung)
 *     description: Ermöglicht es Administratoren, alle Bestellungen im System einzusehen, unabhängig vom Benutzer.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Die Seitennummer
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Anzahl der Elemente pro Seite
 *     responses:
 *       200:
 *         description: Eine paginierte Liste aller Bestellungen im System.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: Nicht authentifiziert.
 *       403:
 *         description: Zugriff verweigert. Admin-Rechte erforderlich.
 *       500:
 *         description: Interner Serverfehler.
 */
router.get(
  "/admin/all",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.findAllForAdmin
);

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   patch:
 *     summary: Aktualisiert den Status einer Bestellung (Nur Admin)
 *     description: Ermöglicht es Administratoren, den Status einer Bestellung zu ändern (z.B. von "pending" zu "shipped").
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID der Bestellung.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Bestellstatus wurde erfolgreich aktualisiert.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Bestellung wurde nicht gefunden.
 *       400:
 *         description: Ungültiger Status-Wert.
 *       401:
 *         description: Nicht authentifiziert.
 *       403:
 *         description: Zugriff verweigert. Admin-Rechte erforderlich.
 *       500:
 *         description: Interner Serverfehler.
 */
router.patch(
  "/admin/:id/status",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  updateStatusRules(),
  validate,
  orderController.updateStatus
);

module.exports = router;
