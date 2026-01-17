const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: Die eindeutige ID des Benutzers.
 *           example: 1
 *         firstName:
 *           type: string
 *           description: Der Vorname des Benutzers.
 *           example: "Max"
 *         lastName:
 *           type: string
 *           description: Der Nachname des Benutzers.
 *           example: "Mustermann"
 *         email:
 *           type: string
 *           format: email
 *           description: Die E-Mail-Adresse des Benutzers (muss eindeutig sein).
 *           example: "max.mustermann@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: Das Passwort des Benutzers (wird gehasht gespeichert).
 *           example: "sicheresPasswort123"
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           description: Die Rolle des Benutzers im System.
 *           default: "customer"
 *           example: "customer"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Der Zeitstempel der Erstellung.
 *           example: "2024-01-01T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Der Zeitstempel der letzten Aktualisierung.
 *           example: "2024-01-01T12:00:00.000Z"
 *     UserWithoutPassword:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             password:
 *               type: string
 *               readOnly: true
 *               description: Das Passwort wird in Responses nicht zurückgegeben.
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Die E-Mail-Adresse des Benutzers.
 *           example: "max.mustermann@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: Das Passwort des Benutzers.
 *           example: "sicheresPasswort123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Das JWT-Token für die Authentifizierung.
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/UserWithoutPassword'
module.exports = (sequelize) => {
  class User extends Model {
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("customer", "admin"),
        allowNull: false,
        defaultValue: "customer",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};
