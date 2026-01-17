const jwt = require("jsonwebtoken");
const config = require("../../config/config.js");
const db = require("../database");
const User = db.User;

const verifyToken = async (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "Kein Token bereitgestellt!" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, config.development.jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Nicht autorisiert! Token ist ungültig oder abgelaufen.",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).send({
        message: "Admin-Rolle erforderlich!",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Serverfehler bei der Überprüfung der Benutzerrolle.",
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
