const { body, validationResult } = require("express-validator");

// Validierungsregeln für das Erstellen einer Bestellung
const createOrderRules = () => {
  return [
    body("items")
      .isArray({ min: 1 })
      .withMessage("Bestellung muss mindestens einen Artikel enthalten."),

    body("items.*.product_id")
      .isInt({ min: 1 })
      .withMessage("Produkt-ID muss eine positive Ganzzahl sein."),

    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Menge muss mindestens 1 sein."),

    body("shipping_address")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Lieferadresse muss mindestens 10 Zeichen lang sein."),
  ];
};

// Validierungsregeln für das Aktualisieren eines Bestellstatus (Admin)
const updateStatusRules = () => {
  return [
    body("status")
      .notEmpty()
      .withMessage("Status ist erforderlich.")
      .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
      .withMessage("Ungültiger Status-Wert."),
  ];
};

// Middleware zur Fehlerüberprüfung
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
  createOrderRules,
  updateStatusRules,
  validate,
};
