const { Sequelize } = require("sequelize");
const allConfigs = require("../config/config.js");

const config = allConfigs.development;

const sequelize = new Sequelize(config);

// Ein Objekt, das unsere Modelle und die Verbindung sammelt
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Lade und initialisiere das User-Modell
db.User = require("./models/user.model.js")(sequelize);

// Synchronisiere alle definierten Modelle mit der Datenbank
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log(
      "✅ Alle Modelle wurden erfolgreich mit der MySQL-Datenbank synchronisiert."
    );
  })
  .catch((error) => {
    console.error("Fehler bei der Synchronisation der Modelle:", error);
  });

module.exports = db;
