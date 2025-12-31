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

// Ruft alle Bestellungen aller Benutzer ab (Nur Admin)
const findAllForAdmin = catchAsync(async (req, res, next) => {
  const { limit, offset, page } = getPagination(req.query);

  // Filterung nach Status
  const { status, sort } = req.query;
  const condition = {};

  if (status) {
    condition.status = status;
  }

  // Sortierung
  let order = [["createdAt", "DESC"]]; // Standard: Neueste zuerst
  if (sort) {
    const [field, direction] = sort.split(":");
    if (["total", "createdAt", "status"].includes(field)) {
      order = [[field, direction.toUpperCase()]];
    }
  }

  const data = await Order.findAndCountAll({
    where: condition, // Filter anwenden
    limit,
    offset,
    order: order, // Sortierung anwenden
    include: [
      {
        model: db.User,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    distinct: true,
  });

  const response = getPagingData(data, page, limit);
  res.send(response);
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
  findOne,
  findAllForUser,
  findAllForAdmin,
  updateStatus,
};
