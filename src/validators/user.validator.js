const { body, validationResult } = require("express-validator");

// Definiert die Validierungsregeln für das Erstellen eines neuen Benutzers
const createUserRules = () => {
  return [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("Vorname ist ein Pflichtfeld."),

    body("email")
      .isEmail()
      .withMessage("Bitte eine gültige E-Mail-Adresse angeben."),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Das Passwort muss mindestens 8 Zeichen lang sein."),
  ];
};

// Validierungsregeln für den Login
const loginRules = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Bitte eine gültige E-Mail-Adresse angeben."),

    body("password").notEmpty().withMessage("Passwort ist erforderlich."),
  ];
};

// Eine Middleware, die die Validierungsergebnisse prüft
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    errors: extractedErrors,
  });
};

module.exports = {
  createUserRules,
  loginRules,
  validate,
};
