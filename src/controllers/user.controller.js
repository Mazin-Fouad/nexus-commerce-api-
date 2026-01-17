const catchAsync = require("../utils/catchAsync");
const userService = require("../services/user.service");

const create = catchAsync(async (req, res, next) => {
  const user = await userService.createUser(req.body);
  res.status(201).send(user);
});

const findOne = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const data = await userService.getUserById(id);

  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Benutzer mit ID=${id} wurde nicht gefunden.`,
    });
  }
});

const update = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const success = await userService.updateUser(id, req.body);

  if (success) {
    res.send({
      message: "Benutzer wurde erfolgreich aktualisiert.",
    });
  } else {
    res.send({
      message: `Kann Benutzer mit ID=${id} nicht aktualisieren. Eventuell wurde der Benutzer nicht gefunden oder req.body ist leer.`,
    });
  }
});

const remove = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const success = await userService.deleteUser(id);

  if (success) {
    res.send({
      message: "Benutzer wurde erfolgreich gelöscht!",
    });
  } else {
    res.send({
      message: `Kann Benutzer mit ID=${id} nicht löschen. Eventuell wurde der Benutzer nicht gefunden.`,
    });
  }
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const result = await userService.loginUser(email, password);

  if (!result) {
    return res.status(401).send({ message: "Ungültige Anmeldedaten." });
  }

  res.send(result);
});

const findAll = catchAsync(async (req, res, next) => {
  const response = await userService.getAllUsers(req.query);
  res.send(response);
});

module.exports = {
  create,
  findAll,
  findOne,
  update,
  delete: remove,
  login,
};
