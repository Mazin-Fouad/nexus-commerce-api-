const { DataTypes, Model } = require("sequelize");

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user_id
 *         - total
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Die eindeutige ID der Bestellung.
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: Die ID des Benutzers, der die Bestellung aufgegeben hat.
 *           example: 5
 *         total:
 *           type: number
 *           format: decimal
 *           description: Der Gesamtbetrag der Bestellung.
 *           example: 299.99
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *           description: Der aktuelle Status der Bestellung.
 *           default: "pending"
 *           example: "pending"
 *         shipping_address:
 *           type: string
 *           description: Die Lieferadresse für die Bestellung.
 *           example: "Musterstraße 123, 12345 Berlin, Deutschland"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Der Zeitstempel der Erstellung.
 *           example: "2024-01-15T14:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Der Zeitstempel der letzten Aktualisierung.
 *           example: "2024-01-15T14:30:00.000Z"
 *         OrderItems:
 *           type: array
 *           description: Die einzelnen Artikel in dieser Bestellung.
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - items
 *         - shipping_address
 *       properties:
 *         items:
 *           type: array
 *           description: Liste der Produkte und deren Mengen.
 *           items:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: Die ID des Produkts.
 *                 example: 3
 *               quantity:
 *                 type: integer
 *                 description: Die gewünschte Menge.
 *                 minimum: 1
 *                 example: 2
 *         shipping_address:
 *           type: string
 *           description: Die Lieferadresse.
 *           example: "Musterstraße 123, 12345 Berlin, Deutschland"
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *           description: Der neue Status der Bestellung.
 *           example: "shipped"
 */

module.exports = (sequelize) => {
  class Order extends Model {}

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
    }
  );

  return Order;
};
