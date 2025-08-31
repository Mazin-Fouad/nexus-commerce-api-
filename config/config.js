// Lade die .env-Datei, damit wir auf die Variablen zugreifen können
require("dotenv").config();

// Dies ist ein sauberes Konfigurationsobjekt.
// Es enthält alle Einstellungen, die Sequelize für die Verbindung braucht.
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
