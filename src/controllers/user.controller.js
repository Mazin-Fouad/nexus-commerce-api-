const db = require("../database");
const User = db.User;

// Erstelle und speichere einen neuen Benutzer
const create = async (req, res) => {
  // Validiere die Anfrage: Sind die nötigen Felder vorhanden?
  if (!req.body.firstName || !req.body.email || !req.body.password) {
    res.status(400).send({
      message: "Fehler: firstName, email und password dürfen nicht leer sein!",
    });
    return;
  }

  // Erstelle ein User-Objekt aus den Daten der Anfrage
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password, // In einem echten Projekt: Passwort hashen!
  };

  try {
    // Speichere den Benutzer in der Datenbank
    const data = await User.create(user);
    // Sende die erstellten Daten mit Status 201 (Created) zurück
    res.status(201).send(data);
  } catch (error) {
    // Sende eine Fehlermeldung, falls etwas schiefgeht
    res.status(500).send({
      message:
        error.message ||
        "Ein Fehler ist beim Erstellen des Benutzers aufgetreten.",
    });
  }
};

// Finde einen einzelnen Benutzer anhand seiner ID
const findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await User.findByPk(id);
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Benutzer mit ID=${id} wurde nicht gefunden.`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Fehler beim Abrufen des Benutzers mit ID=" + id,
    });
  }
};

// Aktualisiere einen Benutzer anhand seiner ID
const update = async (req, res) => {
  const id = req.params.id;

  try {
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
  } catch (error) {
    res.status(500).send({
      message: "Fehler beim Aktualisieren des Benutzers mit ID=" + id,
    });
  }
};

// Lösche einen Benutzer anhand seiner ID
const remove = async (req, res) => {
  const id = req.params.id;

  try {
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
  } catch (error) {
    res.status(500).send({
      message: "Fehler beim Löschen des Benutzers mit ID=" + id,
    });
  }
};

module.exports = {
  create,
  findOne,
  update,
  delete: remove,
};
