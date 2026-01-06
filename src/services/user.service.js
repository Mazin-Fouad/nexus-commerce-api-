const db = require("../database");
const User = db.User;
const jwt = require("jsonwebtoken");
const config = require("../../config/config.js"); // Wichtig für Login
const { getPagination, getPagingData } = require("../utils/pagination");

/**
 * Erstellt einen neuen Benutzer
 * @param {Object} userData - Die Benutzerdaten
 * @returns {Object} Der erstellte Benutzer (ohne Passwort)
 */
const createUser = async (userData) => {
  const user = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
  };

  const data = await User.create(user);

  // Konvertiere das Sequelize-Objekt in ein einfaches JavaScript-Objekt
  const userJson = data.toJSON();
  // Entferne das Passwortfeld manuell vor dem Senden
  delete userJson.password;

  return userJson;
};

/**
 * Findet einen Benutzer anhand seiner ID
 * @param {number} id - Die Benutzer-ID
 * @returns {Object|null} Der gefundene Benutzer oder null
 */
const getUserById = async (id) => {
  return await User.findByPk(id);
};

/**
 * Aktualisiert einen Benutzer
 * @param {number} id - Die Benutzer-ID
 * @param {Object} updateData - Die zu aktualisierenden Daten
 * @returns {boolean} True bei Erfolg, sonst false
 */
const updateUser = async (id, updateData) => {
  const num = await User.update(updateData, {
    where: { id: id },
  });

  return num == 1;
};

/**
 * Löscht einen Benutzer
 * @param {number} id - Die Benutzer-ID
 * @returns {boolean} True bei Erfolg, sonst false
 */
const deleteUser = async (id) => {
  const num = await User.destroy({
    where: { id: id },
  });

  return num == 1;
};

/**
 * Führt den Login durch
 * @param {string} email - Die E-Mail
 * @param {string} password - Das Passwort
 * @returns {Object|null} Das Login-Ergebnis (Token, User-Info) oder null bei Fehler
 */
const loginUser = async (email, password) => {
  // Wichtig: scope: null, um das Passwort zu laden (defaultScope schließt es aus)
  const user = await User.scope(null).findOne({ where: { email: email } });

  if (!user || !(await user.comparePassword(password))) {
    return null;
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, config.development.jwtSecret, {
    expiresIn: "3h",
  });

  return {
    message: "Login erfolgreich!",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    },
    accessToken: token,
  };
};

/**
 * Ruft alle Benutzer ab (mit Paginierung)
 * @param {Object} query - Die Query-Parameter (für Paginierung)
 * @returns {Object} Die paginierten Benutzerdaten
 */
const getAllUsers = async (query) => {
  const { limit, offset, page } = getPagination(query);

  const data = await User.findAndCountAll({
    limit,
    offset,
    attributes: { exclude: ["password"] },
  });

  return getPagingData(data, page, limit);
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  getAllUsers,
};
