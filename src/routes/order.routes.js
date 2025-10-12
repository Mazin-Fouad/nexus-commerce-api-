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

router.post(
  "/",
  [authMiddleware.verifyToken],
  createOrderRules(),
  validate,
  orderController.create
);

router.get("/", [authMiddleware.verifyToken], orderController.findAll);
router.get("/:id", [authMiddleware.verifyToken], orderController.findOne);

// =================================================================
// ADMIN-ROUTEN (Admin-Rolle erforderlich)
// =================================================================

router.get(
  "/admin/all",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.adminFindAll
);

router.patch(
  "/admin/:id/status",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  updateStatusRules(),
  validate,
  orderController.updateStatus
);

module.exports = router;
