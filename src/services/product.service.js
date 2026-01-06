const db = require("../database");
const { Op } = require("sequelize");
const redisClient = require("../config/redis");
const { clearCache } = require("./cache.service");
const { getPagination, getPagingData } = require("../utils/pagination.js");

const Product = db.Product;
const ProductImage = db.ProductImage;

/**
 * Erstellt ein neues Produkt mit Bildern
 * @param {Object} productData - Die Produktdaten
 * @param {Array} files - Hochgeladene Dateien
 * @returns {Object} Das erstellte Produkt
 */
const createProduct = async (productData, files) => {
  const t = await db.sequelize.transaction();

  try {
    const product = await Product.create(
      {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        sku: productData.sku,
      },
      { transaction: t }
    );

    if (files && files.length > 0) {
      const images = files.map((file, index) => ({
        product_id: product.id,
        image_url: file.path,
        alt_text: `Bild für ${product.name}`,
        is_primary: index === 0,
      }));

      await ProductImage.bulkCreate(images, { transaction: t });
    }

    await t.commit();
    await clearCache("products:*");

    return product;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Findet ein Produkt anhand der ID
 * @param {number} id - Die Produkt-ID
 * @returns {Object|null} Das gefundene Produkt oder null
 */
const getProductById = async (id) => {
  return await Product.findByPk(id, {
    include: [{ model: ProductImage, as: "images" }],
  });
};

/**
 * Aktualisiert ein Produkt
 * @param {number} id - Die Produkt-ID
 * @param {Object} updateData - Die neuen Daten
 * @param {Array} files - Neue Bilder
 * @returns {Object} Das aktualisierte Produkt
 */
const updateProduct = async (id, updateData, files) => {
  const t = await db.sequelize.transaction();

  try {
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return null;
    }

    await product.update(updateData, { transaction: t });

    if (files && files.length > 0) {
      const newImages = files.map((file) => ({
        product_id: product.id,
        image_url: file.path,
        alt_text: `Bild für ${product.name}`,
      }));
      await ProductImage.bulkCreate(newImages, { transaction: t });
    }

    if (updateData.imagesToDelete && updateData.imagesToDelete.length > 0) {
      await ProductImage.destroy({
        where: {
          id: updateData.imagesToDelete,
          product_id: id,
        },
        transaction: t,
      });
    }

    await t.commit();
    await clearCache("products:*");

    return product;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Löscht ein Produkt
 * @param {number} id - Die Produkt-ID
 * @returns {boolean} True bei Erfolg, sonst false
 */
const deleteProduct = async (id) => {
  const num = await Product.destroy({
    where: { id: id },
  });

  if (num == 1) {
    await clearCache("products:*");
    return true;
  }
  return false;
};

/**
 * Ruft alle Produkte ab (mit Cache, Filter, Sortierung, Pagination)
 * @param {Object} query - Die Query-Parameter (req.query)
 * @returns {Object} Die paginierten Daten
 */
const getAllProducts = async (query) => {
  const { limit, offset, page } = getPagination(query);
  const { name, minPrice, maxPrice, is_active, sort } = query;

  const cacheKey = `products:${JSON.stringify(query)}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (err) {
    console.error("Redis Fehler:", err);
  }

  const condition = {};
  if (name) condition.name = { [Op.like]: `%${name}%` };
  if (minPrice && maxPrice)
    condition.price = { [Op.between]: [minPrice, maxPrice] };
  else if (minPrice) condition.price = { [Op.gte]: minPrice };
  else if (maxPrice) condition.price = { [Op.lte]: maxPrice };
  if (is_active !== undefined) condition.is_active = is_active === "true";

  let order = [["createdAt", "DESC"]];
  if (sort) {
    const [field, direction] = sort.split(":");
    const allowedFields = ["price", "name", "createdAt", "stock_quantity"];
    const allowedDirections = ["ASC", "DESC"];
    if (
      allowedFields.includes(field) &&
      allowedDirections.includes(direction.toUpperCase())
    ) {
      order = [[field, direction.toUpperCase()]];
    }
  }

  const data = await Product.findAndCountAll({
    where: condition,
    limit,
    offset,
    order: order,
    include: [{ model: db.ProductImage, as: "images" }],
    distinct: true,
  });

  const response = getPagingData(data, page, limit);

  try {
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
  } catch (err) {
    console.error("Konnte Daten nicht in Redis speichern:", err);
  }

  return response;
};

module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
