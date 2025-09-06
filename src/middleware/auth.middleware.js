const jwt = require("jsonwebtoken");
const config = require("../../config/config.js");
const db = require("../database");
const User = db.User;

const verifyToken = async (req, res, next) => {
  // 1. Token aus dem Header extrahieren
  // Standard ist: "Authorization: Bearer <token>"
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "Kein Token bereitgestellt!" });
  }

  // "Bearer " vom Token-String entfernen
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    // 2. Token verifizieren
    const decoded = jwt.verify(token, config.development.jwtSecret);

    // 3. Benutzerinformationen an das Request-Objekt anhängen
    //    damit spätere Funktionen darauf zugreifen können.
    req.userId = decoded.id;

    // 4. Nächste Middleware oder Controller-Funktion aufrufen
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Nicht autorisiert! Token ist ungültig oder abgelaufen.",
    });
  }
};

module.exports = {
  verifyToken,
};
