const express = require("express");
const router = express.Router();

// Importiere die Controller-Funktionen
const userController = require("../controllers/user.controller.js");
// Importiere die Auth-Middleware
const authMiddleware = require("../middleware/auth.middleware.js");

// Definiere die Routen für das User-Modul
// Eine POST-Anfrage an / wird die create-Funktion im Controller aufrufen
router.post("/", userController.create);

// Login-Route (braucht keine Authentifizierung)
router.post("/login", userController.login);

// Eine GET-Anfrage an /:id wird die findOne-Funktion aufrufen
// HIER wird die Middleware eingesetzt!
router.get("/:id", authMiddleware.verifyToken, userController.findOne);

// Eine PUT-Anfrage an /:id wird die update-Funktion aufrufen
router.put("/:id", authMiddleware.verifyToken, userController.update);

// Eine DELETE-Anfrage an /:id wird die delete-Funktion aufrufen
router.delete("/:id", authMiddleware.verifyToken, userController.delete);

module.exports = router;
