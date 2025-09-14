const express = require("express");
const router = express.Router();

// Importiere den Controller und die Middlewares
const productController = require("../controllers/product.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const upload = require("../config/cloudinary.config.js");

// =================================================================
// ÖFFENTLICHE ROUTEN (Keine Authentifizierung erforderlich)
// =================================================================

// GET /api/v1/products - Listet alle Produkte auf
router.get("/", productController.findAll);

// GET /api/v1/products/:id - Ruft ein einzelnes Produkt ab
router.get("/:id", productController.findOne);

// =================================================================
// GESCHÜTZTE ROUTEN (Authentifizierung erforderlich)
// =================================================================

// POST /api/v1/products - Erstellt ein neues Produkt
// Middleware-Kette: 1. Token prüfen -> 2. Bilder hochladen -> 3. Controller ausführen
router.post(
  "/",
  authMiddleware.verifyToken,
  upload.array("images", 5), // Erlaubt bis zu 5 Bilder im Feld 'images'
  productController.create
);

// PUT /api/v1/products/:id - Aktualisiert ein Produkt
router.put(
  "/:id",
  authMiddleware.verifyToken,
  upload.array("images", 5),
  productController.update
);

// DELETE /api/v1/products/:id - Löscht ein Produkt
router.delete("/:id", authMiddleware.verifyToken, productController.delete);

module.exports = router;
