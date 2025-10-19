const db = require("../database");
const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;
const catchAsync = require("../utils/catchAsync");
const { getPagination, getPagingData } = require("../utils/pagination"); // Neu hinzufügen

// HINWEIS: Hier behalten wir try/catch wegen der Transaktions-Logik (t.rollback)
const create = async (req, res, next) => {
  const t = await db.sequelize.transaction();

  try {
    const { items, shipping_address } = req.body;

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
        user_id: req.userId,
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

    const result = await Order.findByPk(order.id, {
      include: [
        {
          model: db.User,
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

    res.status(201).send(result);
  } catch (error) {
    await t.rollback();
    next(error); // Fehler an den zentralen Handler weiterleiten
  }
};

const findAll = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    where: { user_id: req.userId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: OrderItem,
        as: "items",
        attributes: ["quantity", "price_at_time"],
      },
    ],
  });

  res.status(200).send(orders);
});

const findOne = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findOne({
    where: {
      id: orderId,
      user_id: req.userId,
    },
    include: [
      {
        model: db.User,
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

  if (!order) {
    return res
      .status(404)
      .send({ message: "Bestellung nicht gefunden oder Zugriff verweigert." });
  }

  res.status(200).send(order);
});

// Ruft alle Bestellungen für den angemeldeten Benutzer ab (mit Paginierung)
const findAllForUser = catchAsync(async (req, res, next) => {
  const { limit, offset, page } = getPagination(req.query);

  const data = await Order.findAndCountAll({
    where: { user_id: req.userId }, // Nur Bestellungen des aktuellen Benutzers
    limit,
    offset,
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "price"], // Nur relevante Produktinfos
          },
        ],
      },
    ],
    distinct: true,
  });

  const response = getPagingData(data, page, limit);
  res.send(response);
});

// Ruft alle Bestellungen für Admins ab (mit Paginierung)
const findAllForAdmin = catchAsync(async (req, res, next) => {
  const { limit, offset, page } = getPagination(req.query);

  const data = await Order.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.User,
        as: "customer",
        attributes: ["id", "firstName", "email"],
      },
      {
        model: OrderItem,
        as: "items",
        attributes: ["quantity"],
      },
    ],
    distinct: true,
  });

  const response = getPagingData(data, page, limit);
  res.send(response);
});

// =================================================================
// ADMIN-CONTROLLER-FUNKTIONEN
// =================================================================

const adminFindAll = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.User,
        as: "customer",
        attributes: ["id", "firstName", "email"],
      },
      {
        model: OrderItem,
        as: "items",
        attributes: ["quantity"],
      },
    ],
  });

  res.status(200).send(orders);
});

const updateStatus = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const order = await Order.findByPk(orderId);

  if (!order) {
    return res.status(404).send({ message: "Bestellung nicht gefunden." });
  }

  order.status = status;
  await order.save();

  res.status(200).send(order);
});

module.exports = {
  create,
  findAll,
  findOne,
  findAllForUser,
  findAllForAdmin,
  adminFindAll,
  updateStatus,
};
