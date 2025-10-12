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

router.get("/", productController.findAll);
router.get("/:id", productController.findOne);

// =================================================================
// GESCHÜTZTE ROUTEN (Authentifizierung erforderlich)
// =================================================================

router.post(
  "/",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  upload.array("images", 5),
  createProductRules(),
  validate,
  productController.create
);

router.put(
  "/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  upload.array("images", 5),
  updateProductRules(),
  validate,
  productController.update
);

router.delete(
  "/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  productController.delete
);

module.exports = router;
