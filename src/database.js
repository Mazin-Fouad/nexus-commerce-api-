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
db.Order = require("./models/order.model.js")(sequelize);
db.OrderItem = require("./models/orderItem.model.js")(sequelize);

// Definiere die Beziehungen zwischen den Modellen

// --- Bestehende Beziehungen ---
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

// --- NEUE BEZIEHUNGEN FÜR BESTELLUNGEN ---

// Ein User kann viele Bestellungen haben (One-to-Many)
db.User.hasMany(db.Order, {
  foreignKey: "user_id",
  as: "orders",
});
db.Order.belongsTo(db.User, {
  foreignKey: "user_id",
  as: "customer",
});

// Eine Bestellung hat viele Bestell-Items (One-to-Many)
db.Order.hasMany(db.OrderItem, {
  foreignKey: "order_id",
  as: "items",
});
db.OrderItem.belongsTo(db.Order, {
  foreignKey: "order_id",
  as: "order",
});

// Ein Produkt ist in vielen OrderItems enthalten
db.Product.hasMany(db.OrderItem, { foreignKey: "product_id" });
db.OrderItem.belongsTo(db.Product, { foreignKey: "product_id" });

// Eine Bestellung hat viele Produkte ÜBER die Zwischentabelle OrderItem (Many-to-Many)
db.Order.belongsToMany(db.Product, {
  through: db.OrderItem,
  foreignKey: "order_id",
  otherKey: "product_id",
  as: "products",
});

// Ein Produkt kann in vielen Bestellungen sein ÜBER die Zwischentabelle OrderItem (Many-to-Many)
db.Product.belongsToMany(db.Order, {
  through: db.OrderItem,
  foreignKey: "product_id",
  otherKey: "order_id",
  as: "orders",
});

module.exports = db;
