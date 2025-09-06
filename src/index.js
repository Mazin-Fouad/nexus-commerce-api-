require("dotenv").config();

const express = require("express");
const db = require("./database");

// Importiere den User-Router
const userRouter = require("./routes/user.routes.js");

const app = express();

// Middleware, um JSON-Bodies zu parsen
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Hallo Mazin, der Server läuft!" });
});

// Registriere den User-Router für alle Anfragen, die mit /api/v1/users beginnen
app.use("/api/v1/users", userRouter);

app.get("/api/v1/status", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({
      status: "ok",
      message: "Datenbankverbindung ist erfolgreich hergestellt.",
    });
  } catch (error) {
    console.error("Fehler bei der Authentifizierung mit der Datenbank:", error);
    res.status(500).json({
      status: "error",
      message: "Datenbankverbindung fehlgeschlagen.",
      details: error.message,
      original_error: error.original
        ? error.original.message
        : "Keine weiteren Details.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server wurde gestartet und läuft auf Port ${PORT}`);
});
