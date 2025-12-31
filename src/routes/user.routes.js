const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const {
  createUserRules,
  loginRules,
  validate,
} = require("../validators/user.validator.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const { authLimiter } = require("../middleware/rateLimit.middleware.js");

// =================================================================
// ÖFFENTLICHE ROUTEN (Keine Authentifizierung erforderlich)
// =================================================================

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Registriert einen neuen Benutzer
 *     description: Erstellt einen neuen Benutzer-Account im System. Das Passwort wird automatisch gehasht.
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Max"
 *               lastName:
 *                 type: string
 *                 example: "Mustermann"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "max.mustermann@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "sicheresPasswort123"
 *     responses:
 *       201:
 *         description: Benutzer wurde erfolgreich erstellt.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWithoutPassword'
 *       400:
 *         description: Ungültige Eingabedaten oder E-Mail bereits registriert.
 *       500:
 *         description: Interner Serverfehler.
 */
router.post("/", createUserRules(), validate, userController.create);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Meldet einen Benutzer an
 *     description: Authentifiziert einen Benutzer und gibt ein JWT-Token zurück.
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login erfolgreich. JWT-Token wird zurückgegeben.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Ungültige Anmeldedaten (E-Mail oder Passwort falsch).
 *       400:
 *         description: Validierungsfehler bei den Eingabedaten.
 *       500:
 *         description: Interner Serverfehler.
 */
router.post(
  "/login",
  authLimiter,
  loginRules(),
  validate,
  userController.login
);

// =================================================================
// GESCHÜTZTE ROUTEN (Authentifizierung erforderlich)
// =================================================================

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Ruft die Daten eines Benutzers ab
 *     description: Gibt die Details eines spezifischen Benutzers zurück (ohne Passwort).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des Benutzers.
 *         example: 1
 *     responses:
 *       200:
 *         description: Die Benutzerdaten wurden erfolgreich abgerufen.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWithoutPassword'
 *       404:
 *         description: Benutzer wurde nicht gefunden.
 *       401:
 *         description: Nicht authentifiziert. Token fehlt oder ist ungültig.
 *       500:
 *         description: Interner Serverfehler.
 */
router.get("/:id", userController.findOne);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Aktualisiert die Daten eines Benutzers
 *     description: Ermöglicht die Aktualisierung der Benutzerdaten. Das Passwort wird automatisch gehasht, falls es geändert wird.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des Benutzers.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Max"
 *               lastName:
 *                 type: string
 *                 example: "Mustermann"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "max.mustermann@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "neuesPasswort456"
 *     responses:
 *       200:
 *         description: Benutzer wurde erfolgreich aktualisiert.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWithoutPassword'
 *       404:
 *         description: Benutzer wurde nicht gefunden.
 *       400:
 *         description: Ungültige Eingabedaten.
 *       401:
 *         description: Nicht authentifiziert.
 *       500:
 *         description: Interner Serverfehler.
 */
router.put("/:id", userController.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Löscht einen Benutzer
 *     description: Entfernt einen Benutzer permanent aus dem System.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Die ID des zu löschenden Benutzers.
 *         example: 1
 *     responses:
 *       200:
 *         description: Benutzer wurde erfolgreich gelöscht.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Benutzer wurde erfolgreich gelöscht."
 *       404:
 *         description: Benutzer wurde nicht gefunden.
 *       401:
 *         description: Nicht authentifiziert.
 *       500:
 *         description: Interner Serverfehler.
 */
router.delete("/:id", userController.delete);

module.exports = router;
