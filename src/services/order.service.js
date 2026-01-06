const db = require("../database");
const { getPagination, getPagingData } = require("../utils/pagination");

const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;
const User = db.User;

/**
 * Erstellt eine neue Bestellung
 * @param {number} userId - Die ID des Benutzers
 * @param {Object} orderData - Die Bestelldaten (items, shipping_address)
 * @returns {Object} Die erstellte Bestellung
 */
const createOrder = async (userId, orderData) => {
  const t = await db.sequelize.transaction();

  try {
    const { items, shipping_address } = orderData;

    const productIds = items.map((item) => item.product_id);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t,
    });

    let grandTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);

      if (!product) {
        throw new Error(`Produkt mit ID ${item.product_id} nicht gefunden.`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Nicht genügend Lagerbestand für ${product.name}.`);
      }

      const priceAtTime = product.price;
      grandTotal += priceAtTime * item.quantity;

      orderItemsData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: priceAtTime,
      });
    }

    const order = await Order.create(
      {
        user_id: userId,
        total: grandTotal,
        status: "pending",
        shipping_address: shipping_address,
      },
      { transaction: t }
    );

    const finalOrderItems = orderItemsData.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await OrderItem.bulkCreate(finalOrderItems, { transaction: t });

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      const newStock = product.stock_quantity - item.quantity;
      await product.update({ stock_quantity: newStock }, { transaction: t });
    }

    await t.commit();

    // Bestelldetails für die Antwort laden
    return await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "firstName", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, attributes: ["id", "name"] }],
        },
      ],
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Findet eine Bestellung eines Benutzers
 * @param {number} orderId - Die Bestell-ID
 * @param {number} userId - Die Benutzer-ID
 * @returns {Object|null} Die Bestellung oder null
 */
const getOrderById = async (orderId, userId) => {
  return await Order.findOne({
    where: {
      id: orderId,
      user_id: userId,
    },
    include: [
      {
        model: User,
        as: "customer",
        attributes: ["id", "firstName", "email"],
      },
      {
        model: OrderItem,
        as: "items",
        include: [
          { model: Product, attributes: ["id", "name", "description"] },
        ],
      },
    ],
  });
};

/**
 * Ruft alle Bestellungen eines Benutzers ab
 * @param {number} userId - Die Benutzer-ID
 * @param {Object} query - Query Parameter für Paginierung
 * @returns {Object} Paginierte Bestellungen
 */
const getUserOrders = async (userId, query) => {
  const { limit, offset, page } = getPagination(query);

  const data = await Order.findAndCountAll({
    where: { user_id: userId },
    limit,
    offset,
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price"],
          },
        ],
      },
    ],
    distinct: true,
  });

  return getPagingData(data, page, limit);
};

/**
 * Ruft alle Bestellungen ab (Admin)
 * @param {Object} query - Query Parameter (Status, Sortierung, Paginierung)
 * @returns {Object} Paginierte Bestellungen
 */
const getAllOrders = async (query) => {
  const { limit, offset, page } = getPagination(query);
  const { status, sort } = query;
  const condition = {};

  if (status) {
    condition.status = status;
  }

  let order = [["createdAt", "DESC"]];
  if (sort) {
    const [field, direction] = sort.split(":");
    if (["total", "createdAt", "status"].includes(field)) {
      order = [[field, direction.toUpperCase()]];
    }
  }

  const data = await Order.findAndCountAll({
    where: condition,
    limit,
    offset,
    order: order,
    include: [
      {
        model: User,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    distinct: true,
  });

  return getPagingData(data, page, limit);
};

/**
 * Aktualisiert den Status einer Bestellung
 * @param {number} orderId - Die Bestell-ID
 * @param {string} status - Der neue Status
 * @returns {Object|null} Die aktualisierte Bestellung oder null
 */
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    return null;
  }

  order.status = status;
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
