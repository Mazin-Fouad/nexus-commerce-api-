const { Sequelize } = require("sequelize");
const allConfigs = require("../config/config.js");

const config = allConfigs.development;

const sequelize = new Sequelize(config);

// Ein Objekt, das unsere Modelle und die Verbindung sammelt
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Lade und initialisiere alle Modelle
db.User = require("./models/user.model.js")(sequelize);
db.Product = require("./models/product.model.js")(sequelize);
db.ProductImage = require("./models/productImages.model.js")(sequelize);

// Definiere die Beziehungen zwischen den Modellen
// Ein Produkt hat viele Bilder
db.Product.hasMany(db.ProductImage, {
  foreignKey: "product_id",
  as: "images", // Alias für die Beziehung
});

// Ein Bild gehört zu einem Produkt
db.ProductImage.belongsTo(db.Product, {
  foreignKey: "product_id",
  as: "product",
});

// Synchronisiere alle definierten Modelle mit der Datenbank
// sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log(
//       "✅ Alle Modelle wurden erfolgreich mit der MySQL-Datenbank synchronisiert."
//     );
//   })
//   .catch((error) => {
//     console.error("Fehler bei der Synchronisation der Modelle:", error);
//   });

// Der sequelize.sync()-Block wird hier komplett entfernt.
// Die Datenbankstruktur wird von nun an nur noch durch Migrationen verwaltet.

module.exports = db;
