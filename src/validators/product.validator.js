const { body, validationResult } = require("express-validator");

// Validierungsregeln für das Erstellen eines Produkts
const createProductRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Produktname ist ein Pflichtfeld.")
      .isLength({ min: 2, max: 255 })
      .withMessage("Produktname muss zwischen 2 und 255 Zeichen lang sein."),

    body("price")
      .isFloat({ min: 0.01 })
      .withMessage("Preis muss eine Zahl größer als 0 sein."),

    body("stock_quantity")
      .isInt({ min: 0 })
      .withMessage("Lagerbestand muss eine positive Ganzzahl sein."),

    body("description").optional().trim(),

    body("sku")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("SKU darf maximal 100 Zeichen lang sein."),
  ];
};

// Validierungsregeln für das Aktualisieren eines Produkts
const updateProductRules = () => {
  return [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Produktname muss zwischen 2 und 255 Zeichen lang sein."),

    body("price")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Preis muss eine Zahl größer als 0 sein."),

    body("stock_quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Lagerbestand muss eine positive Ganzzahl sein."),

    body("description").optional().trim(),

    body("sku")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("SKU darf maximal 100 Zeichen lang sein."),
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
  createProductRules,
  updateProductRules,
  validate,
};
