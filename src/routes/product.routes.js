const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const upload = require("../config/cloudinary.config.js");
const {
  createProductRules,
  updateProductRules,
  validate,
} = require("../validators/product.validator.js");

// =================================================================
// ÖFFENTLICHE ROUTEN (Keine Authentifizierung erforderlich)
// =================================================================

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Ruft eine Liste aller Produkte ab
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Eine Liste von Produkten.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Interner Serverfehler.
 */
router.get("/", productController.findAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Ruft ein einzelnes Produkt anhand seiner ID ab
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Die ID des Produkts.
 *     responses:
 *       200:
 *         description: Die Produktdaten.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produkt wurde nicht gefunden.
 *       500:
 *         description: Interner Serverfehler.
 */
router.get("/:id", productController.findOne);

// =================================================================
// GESCHÜTZTE ROUTEN (Nur Admin - Authentifizierung erforderlich)
// =================================================================

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Erstellt ein neues Produkt (Nur Admin)
 *     description: Ermöglicht es Administratoren, ein neues Produkt mit optionalen Bildern zu erstellen. Bilder werden über Multipart-Formdata hochgeladen.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock_quantity
 *             properties:
 *               name:
 *                 type: string
 *                 description: Der Name des Produkts.
 *                 example: "Laptop Pro"
 *               description:
 *                 type: string
 *                 description: Eine detaillierte Beschreibung des Produkts.
 *                 example: "Ein leistungsstarker Laptop für Profis."
 *               price:
 *                 type: number
 *                 format: decimal
 *                 description: Der Preis des Produkts.
 *                 example: 1499.99
 *               stock_quantity:
 *                 type: integer
 *                 description: Die verfügbare Lagermenge.
 *                 example: 50
 *               sku:
 *                 type: string
 *                 description: Die Stock Keeping Unit (SKU).
 *                 example: "LP-PRO-2024"
 *               is_active:
 *                 type: boolean
 *                 description: Gibt an, ob das Produkt aktiv ist.
 *                 default: true
 *                 example: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Bis zu 5 Produktbilder (JPG, PNG, etc.).
 *     responses:
 *       201:
 *         description: Produkt wurde erfolgreich erstellt.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ungültige Eingabedaten oder Validierungsfehler.
 *       401:
 *         description: Nicht authentifiziert.
 *       403:
 *         description: Zugriff verweigert. Admin-Rechte erforderlich.
 *       500:
 *         description: Interner Serverfehler.
 */
router.post(
  "/",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  upload.array("images", 5),
  createProductRules(),
  validate,
  productController.create
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Aktualisiert ein bestehendes Produkt (Nur Admin)
 *     description: Ermöglicht es Administratoren, die Daten eines Produkts zu aktualisieren, einschließlich neuer Bilder.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des Produkts.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop Pro 2024"
 *               description:
 *                 type: string
 *                 example: "Aktualisierte Beschreibung."
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 1399.99
 *               stock_quantity:
 *                 type: integer
 *                 example: 45
 *               sku:
 *                 type: string
 *                 example: "LP-PRO-2024-V2"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Bis zu 5 neue Produktbilder.
 *     responses:
 *       200:
 *         description: Produkt wurde erfolgreich aktualisiert.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produkt wurde nicht gefunden.
 *       400:
 *         description: Ungültige Eingabedaten.
 *       401:
 *         description: Nicht authentifiziert.
 *       403:
 *         description: Zugriff verweigert. Admin-Rechte erforderlich.
 *       500:
 *         description: Interner Serverfehler.
 */
router.put(
  "/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  upload.array("images", 5),
  updateProductRules(),
  validate,
  productController.update
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Löscht ein Produkt (Nur Admin)
 *     description: Entfernt ein Produkt permanent aus dem System.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des zu löschenden Produkts.
 *         example: 1
 *     responses:
 *       200:
 *         description: Produkt wurde erfolgreich gelöscht.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produkt wurde erfolgreich gelöscht."
 *       404:
 *         description: Produkt wurde nicht gefunden.
 *       401:
 *         description: Nicht authentifiziert.
 *       403:
 *         description: Zugriff verweigert. Admin-Rechte erforderlich.
 *       500:
 *         description: Interner Serverfehler.
 */
router.delete(
  "/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  productController.delete
);

module.exports = router;
