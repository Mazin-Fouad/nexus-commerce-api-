"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Die 'up'-Funktion wird ausgeführt, wenn wir 'db:migrate' laufen lassen.
     * Sie beschreibt die Änderungen, die wir an der Datenbank vornehmen wollen.
     */
    await queryInterface.addColumn(
      "users", // 1. Name der Tabelle
      "role", // 2. Name der neuen Spalte
      {
        // 3. Definition der Spalte
        type: Sequelize.ENUM("customer", "admin"), // Ein ENUM-Typ, der nur diese beiden Werte erlaubt.
        allowNull: false, // Die Spalte darf nicht leer sein.
        defaultValue: "customer", // Jeder neue oder bestehende Benutzer wird standardmäßig 'customer'.
      }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Die 'down'-Funktion wird ausgeführt, wenn wir 'db:migrate:undo' laufen lassen.
     * Sie muss exakt das Gegenteil der 'up'-Funktion tun.
     */
    await queryInterface.removeColumn("users", "role");
  },
};
