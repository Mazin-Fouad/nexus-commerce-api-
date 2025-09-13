const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class ProductImage extends Model {}

  ProductImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onDelete: "CASCADE", // Wenn Produkt gelöscht wird, werden Bilder auch gelöscht
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alt_text: {
        type: DataTypes.STRING,
        allowNull: true, // Alternative Text für Barrierefreiheit
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Ist dies das Hauptbild?
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // Reihenfolge der Bilder
      },
    },
    {
      sequelize,
      modelName: "ProductImage",
      tableName: "product_images",
      indexes: [
        {
          fields: ["product_id"], // Index für Produktbilder-Abfragen
        },
        {
          fields: ["is_primary"], // Index für Hauptbilder
        },
      ],
    }
  );

  return ProductImage;
};
