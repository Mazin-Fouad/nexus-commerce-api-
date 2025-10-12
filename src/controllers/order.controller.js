const db = require("../database");
const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;

const create = async (req, res) => {
  // 1. Eine Transaktion starten (unser "Einkaufswagen")
  const t = await db.sequelize.transaction();

  try {
    // 2. Eingaben validieren
    const { items, shipping_address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .send({ message: "Bestellung muss Artikel enthalten." });
    }

    // 3. Alle benötigten Produkt-IDs aus der Anfrage sammeln
    const productIds = items.map((item) => item.product_id);

    // 4. Alle Produkte auf einmal aus der DB holen, um Preise und Lagerbestände zu prüfen
    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t, // Sperrt die Zeilen für die Dauer der Transaktion
    });

    // 5. Gesamtpreis berechnen und OrderItems vorbereiten
    let grandTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);

      // Prüfen, ob Produkt existiert und auf Lager ist
      if (!product) {
        throw new Error(`Produkt mit ID ${item.product_id} nicht gefunden.`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Nicht genügend Lagerbestand für ${product.name}.`);
      }

      // Preis berechnen und zum Gesamtpreis addieren
      const priceAtTime = product.price;
      grandTotal += priceAtTime * item.quantity;

      // Daten für die OrderItem-Tabelle vorbereiten
      orderItemsData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: priceAtTime,
      });
    }

    // 6. Die Haupt-Bestellung (Order) in der Datenbank erstellen
    const order = await Order.create(
      {
        user_id: req.userId, // Kommt von unserer authMiddleware
        total: grandTotal,
        status: "pending",
        shipping_address: shipping_address,
      },
      { transaction: t }
    );

    // 7. Die Order-ID zu den OrderItem-Daten hinzufügen
    const finalOrderItems = orderItemsData.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    // 8. Alle OrderItems auf einmal in die Datenbank einfügen (sehr effizient)
    await OrderItem.bulkCreate(finalOrderItems, { transaction: t });

    // 9. Lagerbestand der Produkte aktualisieren
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      const newStock = product.stock_quantity - item.quantity;
      await product.update({ stock_quantity: newStock }, { transaction: t });
    }

    // 10. Wenn alles gut ging: Transaktion bestätigen (zur Kasse gehen)
    await t.commit();

    // 11. Die komplette Bestellung mit allen Details laden und zurücksenden
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
    // 12. Wenn irgendetwas schief ging: Transaktion abbrechen (Einkaufswagen stehen lassen)
    await t.rollback();
    res.status(500).send({
      message:
        error.message ||
        "Ein Fehler ist beim Erstellen der Bestellung aufgetreten.",
    });
  }
};

const findAll = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.userId }, // WICHTIG: Nur Bestellungen des angemeldeten Benutzers
      order: [["createdAt", "DESC"]], // Neueste Bestellungen zuerst
      include: [
        // Wir laden ein paar nützliche Infos mit
        {
          model: OrderItem,
          as: "items",
          attributes: ["quantity", "price_at_time"],
        },
      ],
    });

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Ein Fehler ist beim Abrufen der Bestellung aufgetreten.",
    });
  }
};

const findOne = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: req.userId, // SICHERHEIT: Stelle sicher, dass die Bestellung dem User gehört
      },
      include: [
        // Hier laden wir alle Details, wie bei der create-Antwort
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
      return res.status(404).send({
        message: "Bestellung nicht gefunden oder Zugriff verweigert.",
      });
    }

    res.status(200).send(order);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Ein Fehler ist beim Abrufen der Bestellung aufgetreten.",
    });
  }
};

// =================================================================
// ADMIN-CONTROLLER-FUNKTIONEN
// =================================================================

const adminFindAll = async (req, res) => {
  try {
    const orders = await Order.findAll({
      // KEINE user_id-Einschränkung hier, da Admins alles sehen dürfen
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
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Ein Fehler ist beim Abrufen aller Bestellungen aufgetreten.",
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // 1. Validieren, ob ein Status mitgeliefert wurde
    if (!status) {
      return res.status(400).send({ message: "Status fehlt." });
    }

    // 2. Die Bestellung finden
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).send({ message: "Bestellung nicht gefunden." });
    }

    // 3. Den Status aktualisieren und speichern
    order.status = status;
    await order.save();

    res.status(200).send(order);
  } catch (error) {
    // Fehlerbehandlung, falls z.B. der Status kein gültiger ENUM-Wert ist
    res.status(500).send({
      message:
        error.message ||
        "Ein Fehler ist beim Aktualisieren des Status aufgetreten.",
    });
  }
};

module.exports = {
  create,
  findAll,
  findOne,
  adminFindAll,
  updateStatus,
};
