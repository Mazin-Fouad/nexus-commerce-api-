const db = require("../database");
const User = db.User;
const jwt = require("jsonwebtoken");
const config = require("../../config/config.js");
const catchAsync = require("../utils/catchAsync"); // 1. Unseren neuen Wrapper importieren

// Erstelle und speichere einen neuen Benutzer
const create = catchAsync(async (req, res, next) => {
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  };

  const data = await User.create(user);

  // Konvertiere das Sequelize-Objekt in ein einfaches JavaScript-Objekt
  const userJson = data.toJSON();
  // Entferne das Passwortfeld manuell vor dem Senden
  delete userJson.password;

  res.status(201).send(userJson);
});

// Finde einen einzelnen Benutzer anhand seiner ID
const findOne = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const data = await User.findByPk(id);

  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Benutzer mit ID=${id} wurde nicht gefunden.`,
    });
  }
});

// Aktualisiere einen Benutzer anhand seiner ID
const update = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const num = await User.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Benutzer wurde erfolgreich aktualisiert.",
    });
  } else {
    res.send({
      message: `Kann Benutzer mit ID=${id} nicht aktualisieren. Eventuell wurde der Benutzer nicht gefunden oder req.body ist leer.`,
    });
  }
});

// Lösche einen Benutzer anhand seiner ID
const remove = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const num = await User.destroy({
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Benutzer wurde erfolgreich gelöscht!",
    });
  } else {
    res.send({
      message: `Kann Benutzer mit ID=${id} nicht löschen. Eventuell wurde der Benutzer nicht gefunden.`,
    });
  }
});

// Benutzer-Login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Wichtig: scope: null, um das Passwort zu laden (defaultScope schließt es aus)
  const user = await User.scope(null).findOne({ where: { email: email } });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).send({ message: "Ungültige Anmeldedaten." });
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, config.development.jwtSecret, {
    expiresIn: "3h",
  });

  res.send({
    message: "Login erfolgreich!",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    },
    accessToken: token,
  });
});

// 3. Der Export-Block bleibt unverändert
module.exports = {
  create,
  findOne,
  update,
  delete: remove,
  login,
};
