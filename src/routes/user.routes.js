const express = require("express");
const router = express.Router();

// Importiere die Controller-Funktionen
const userController = require("../controllers/user.controller.js");

// Definiere die Routen für das User-Modul
// Eine POST-Anfrage an / wird die create-Funktion im Controller aufrufen
router.post("/", userController.create);

// Eine GET-Anfrage an /:id wird die findOne-Funktion aufrufen
router.get("/:id", userController.findOne);

// Eine PUT-Anfrage an /:id wird die update-Funktion aufrufen
router.put("/:id", userController.update);

// Eine DELETE-Anfrage an /:id wird die delete-Funktion aufrufen
router.delete("/:id", userController.delete);

module.exports = router;
