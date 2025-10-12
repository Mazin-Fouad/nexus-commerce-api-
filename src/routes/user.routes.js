const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const {
  createUserRules,
  loginRules,
  validate,
} = require("../validators/user.validator.js");

// Erstelle einen neuen Benutzer
router.post("/", createUserRules(), validate, userController.create);

// Finde einen Benutzer anhand seiner ID
router.get("/:id", userController.findOne);

// Aktualisiere einen Benutzer anhand seiner ID
router.put("/:id", userController.update);

// Lösche einen Benutzer anhand seiner ID
router.delete("/:id", userController.delete);

// Benutzer-Login
router.post("/login", loginRules(), validate, userController.login);

module.exports = router;
