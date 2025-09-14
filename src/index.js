require("dotenv").config();

const express = require("express");
const db = require("./database");

// Importiere die Router
const userRouter = require("./routes/user.routes.js");
const productRouter = require("./routes/product.routes.js");

const app = express();

// Middleware, um JSON-Bodies zu parsen
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Registriere die Router
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

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
