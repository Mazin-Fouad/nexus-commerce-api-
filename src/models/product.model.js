const { DataTypes, Model } = require("sequelize");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock_quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: Die eindeutige ID des Produkts.
 *         name:
 *           type: string
 *           description: Der Name des Produkts.
 *         description:
 *           type: string
 *           description: Eine Beschreibung des Produkts.
 *         price:
 *           type: number
 *           format: decimal
 *           description: Der Preis des Produkts.
 *         stock_quantity:
 *           type: integer
 *           description: Die verfügbare Lagermenge.
 *         sku:
 *           type: string
 *           description: Die Stock Keeping Unit (SKU).
 *         is_active:
 *           type: boolean
 *           description: Gibt an, ob das Produkt aktiv ist.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Der Zeitstempel der Erstellung.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Der Zeitstempel der letzten Aktualisierung.
 *       example:
 *         id: 1
 *         name: "Laptop Pro"
 *         description: "Ein leistungsstarker Laptop für Profis."
 *         price: "1499.99"
 *         stock_quantity: 50
 *         sku: "LP-PRO-2024"
 *         is_active: true
 *         createdAt: "2024-01-01T12:00:00.000Z"
 *         updatedAt: "2024-01-01T12:00:00.000Z"
 */
module.exports = (sequelize) => {
  class Product extends Model {}

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
          len: [2, 255],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
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
    },
  );

  return Product;
};
