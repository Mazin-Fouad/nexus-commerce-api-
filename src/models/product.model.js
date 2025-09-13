const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Product extends Model {
    // Später können hier Instanzmethoden hinzugefügt werden
  }

  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 255], // Mindestens 2, maximal 255 Zeichen
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2), // 10 Stellen insgesamt, 2 Nachkommastellen
        allowNull: false,
        validate: {
          min: 0.01, // Mindestpreis
        },
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0, // Negative Bestände nicht erlaubt
        },
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true, // SKU muss eindeutig sein
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Produkt ist standardmäßig aktiv
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      indexes: [
        {
          fields: ["name"], // Index für Produktnamen-Suche
        },
        {
          fields: ["sku"], // Index für SKU-Suche
        },
        {
          fields: ["is_active"], // Index für aktive Produkte
        },
      ],
    }
  );

  return Product;
};
