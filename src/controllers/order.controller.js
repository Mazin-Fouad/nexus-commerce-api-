const catchAsync = require("../utils/catchAsync");
const orderService = require("../services/order.service");

const create = async (req, res, next) => {
  try {
    const result = await orderService.createOrder(req.userId, req.body);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

const findOne = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id, req.userId);

  if (!order) {
    return res
      .status(404)
      .send({ message: "Bestellung nicht gefunden oder Zugriff verweigert." });
  }

  res.status(200).send(order);
});

// Ruft alle Bestellungen für den angemeldeten Benutzer ab (mit Paginierung)
const findAllForUser = catchAsync(async (req, res, next) => {
  const response = await orderService.getUserOrders(req.userId, req.query);
  res.send(response);
});

// Ruft alle Bestellungen aller Benutzer ab (Nur Admin)
const findAllForAdmin = catchAsync(async (req, res, next) => {
  const response = await orderService.getAllOrders(req.query);
  res.send(response);
});

const updateStatus = catchAsync(async (req, res, next) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status
  );

  if (!order) {
    return res.status(404).send({ message: "Bestellung nicht gefunden." });
  }

  res.status(200).send(order);
});

module.exports = {
  create,
  findOne,
  findAllForUser,
  findAllForAdmin,
  updateStatus,
};
