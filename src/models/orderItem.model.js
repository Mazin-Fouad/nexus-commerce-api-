const { DataTypes, Model } = require("sequelize");

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - order_id
 *         - product_id
 *         - quantity
 *         - price_at_time
 *       properties:
 *         id:
 *           type: integer
 *           description: Die eindeutige ID des Bestellartikels.
 *           example: 1
 *         order_id:
 *           type: integer
 *           description: Die ID der zugehörigen Bestellung.
 *           example: 10
 *         product_id:
 *           type: integer
 *           description: Die ID des Produkts.
 *           example: 3
 *         quantity:
 *           type: integer
 *           description: Die bestellte Menge.
 *           minimum: 1
 *           example: 2
 *         price_at_time:
 *           type: number
 *           format: decimal
 *           description: Der Preis des Produkts zum Zeitpunkt der Bestellung.
 *           example: 149.99
 *         Product:
 *           $ref: '#/components/schemas/Product'
 *           description: Die Produktdetails (falls inkludiert).
 */

module.exports = (sequelize) => {
  class OrderItem extends Model {}

  OrderItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "products",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price_at_time: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "order_items",
      timestamps: false, // Oft haben Zwischentabellen keine createdAt/updatedAt Zeitstempel
    }
  );

  return OrderItem;
};
