const db = require("../database");
const { getPagination, getPagingData } = require("../utils/pagination");

const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;
const User = db.User;

const createOrder = async (userId, orderData) => {
  const t = await db.sequelize.transaction();

  try {
    const { items, shipping_address } = orderData;
    const products = await _getProductsForOrder(items, t);

    _validateStock(items, products);

    const grandTotal = _calculateTotal(items, products);
    const order = await _createOrderRecord(
      userId,
      grandTotal,
      shipping_address,
      t,
    );

    await _createOrderItems(order.id, items, products, t);
    await _updateProductStock(items, products, t);

    await t.commit();
    return await _getOrderWithDetails(order.id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- Helper Functions ---

const _getProductsForOrder = async (items, transaction) => {
  const productIds = items.map((item) => item.product_id);
  return await Product.findAll({
    where: { id: productIds },
    transaction,
  });
};

const _validateStock = (items, products) => {
  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) {
      throw new Error(`Produkt mit ID ${item.product_id} nicht gefunden.`);
    }
    if (product.stock_quantity < item.quantity) {
      throw new Error(`Nicht genügend Lagerbestand für ${product.name}.`);
    }
  }
};

const _calculateTotal = (items, products) => {
  return items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.product_id);
    return total + product.price * item.quantity;
  }, 0);
};

const _createOrderRecord = async (
  userId,
  total,
  shippingAddress,
  transaction,
) => {
  return await Order.create(
    {
      user_id: userId,
      total,
      status: "pending",
      shipping_address: shippingAddress,
    },
    { transaction },
  );
};

const _createOrderItems = async (orderId, items, products, transaction) => {
  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: product.price,
    };
  });
  await OrderItem.bulkCreate(orderItemsData, { transaction });
};

const _updateProductStock = async (items, products, transaction) => {
  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id);
    const newStock = product.stock_quantity - item.quantity;
    await product.update({ stock_quantity: newStock }, { transaction });
  }
};

const _getOrderWithDetails = async (orderId) => {
  return await Order.findByPk(orderId, {
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
