"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Wenn eine Order gelöscht wird, werden die Items auch gelöscht.
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // <-- HIER VON false AUF true ÄNDERN
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // Wichtig: Wenn ein Produkt gelöscht wird, bleibt der Eintrag in der Bestellung erhalten.
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price_at_time: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      // Diese Tabelle hat keine createdAt/updatedAt Zeitstempel, wie im Modell definiert.
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("order_items");
  },
};
