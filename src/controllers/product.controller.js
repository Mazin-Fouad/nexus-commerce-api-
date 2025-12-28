const db = require("../database");
const Product = db.Product;
const catchAsync = require("../utils/catchAsync");
const { getPagination, getPagingData } = require("../utils/pagination.js");
// Wir brauchen die Operatoren für komplexe Abfragen (z.B. LIKE, >=, <=)
const { Op } = require("sequelize");

// Erstelle und speichere ein neues Produkt mit Bildern
const create = async (req, res, next) => {
  const t = await db.sequelize.transaction();

  try {
    const product = await Product.create(
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock_quantity: req.body.stock_quantity,
        sku: req.body.sku,
      },
      { transaction: t } // Wichtig: Füge diesen Schritt zur Transaktion hinzu
    );

    // 3. Verarbeite die hochgeladenen Bilder
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file, index) => ({
        product_id: product.id,
        image_url: file.path, // 'path' enthält die URL von Cloudinary
        alt_text: `Bild für ${product.name}`,
        is_primary: index === 0, // Markiere das erste Bild als Hauptbild
      }));

      // Speichere alle Bilder in der 'product_images'-Tabelle
      await ProductImage.bulkCreate(images, { transaction: t });
    }

    // 4. Wenn alles gut gegangen ist, committe die Transaktion
    await t.commit();

    // Lade das erstellte Produkt mit seinen Bildern, um es zurückzugeben
    const result = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: "images" }],
    });

    res.status(201).send(result);
  } catch (error) {
    // 5. Wenn ein Fehler auftritt, mache alle Änderungen rückgängig
    await t.rollback();
    // Wir leiten den Fehler manuell an den nächsten Fehler-Handler weiter
    // Damit wird trotzdem unser zentraler errorHandler genutzt!
    next(error);
  }
};

// Finde ein einzelnes Produkt anhand seiner ID
const findOne = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const data = await Product.findByPk(id, {
    include: [{ model: ProductImage, as: "images" }], // Lade auch hier die Bilder
  });

  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Produkt mit ID=${id} wurde nicht gefunden.`,
    });
  }
});

// Aktualisiere ein Produkt anhand seiner ID
// HINWEIS: Auch hier behalten wir try/catch wegen der Transaktions-Logik
const update = async (req, res, next) => {
  const id = req.params.id;
  const t = await db.sequelize.transaction();

  try {
    // 1. Finde das Produkt, das aktualisiert werden soll
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).send({ message: "Produkt nicht gefunden." });
    }

    // 2. Aktualisiere die Text-Felder des Produkts
    await product.update(req.body, { transaction: t });

    // 3. Verarbeite neu hochgeladene Bilder
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        product_id: product.id,
        image_url: file.path,
        alt_text: `Bild für ${product.name}`,
      }));
      await ProductImage.bulkCreate(newImages, { transaction: t });
    }

    // 4. Verarbeite zu löschende Bilder (optional)
    // Der Client kann ein Array von Bild-IDs im Body senden, die gelöscht werden sollen
    if (req.body.imagesToDelete && req.body.imagesToDelete.length > 0) {
      await ProductImage.destroy({
        where: {
          id: req.body.imagesToDelete,
          product_id: id, // Sicherheitscheck: Nur Bilder dieses Produkts löschen
        },
        transaction: t,
      });
    }

    // 5. Committe die Transaktion
    await t.commit();

    // Lade das aktualisierte Produkt mit allen Bildern und sende es zurück
    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: "images" }],
    });

    res.send(updatedProduct);
  } catch (error) {
    await t.rollback();
    next(error); // Fehler an den zentralen Handler weiterleiten
  }
};

// Lösche ein Produkt anhand seiner ID
const deleteProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const num = await Product.destroy({
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Produkt wurde erfolgreich gelöscht!",
    });
  } else {
    res.send({
      message: `Kann Produkt mit ID=${id} nicht löschen. Eventuell wurde es nicht gefunden.`,
    });
  }
});

// Rufe alle Produkte ab (mit Paginierung, Filterung und Sortierung)
const findAll = catchAsync(async (req, res, next) => {
  const { limit, offset, page } = getPagination(req.query);

  // 1. Filterung vorbereiten (WHERE Clause)
  const { name, minPrice, maxPrice, is_active } = req.query;
  const condition = {};

  // Suche nach Name (Teilübereinstimmung, case-insensitive oft Standard in MySQL)
  if (name) {
    condition.name = { [Op.like]: `%${name}%` };
  }

  // Filter nach Preisspanne
  if (minPrice && maxPrice) {
    condition.price = { [Op.between]: [minPrice, maxPrice] };
  } else if (minPrice) {
    condition.price = { [Op.gte]: minPrice }; // >= minPrice
  } else if (maxPrice) {
    condition.price = { [Op.lte]: maxPrice }; // <= maxPrice
  }

  // Filter nach Status (falls explizit angegeben, sonst zeigen wir alles oder nur aktive)
  if (is_active !== undefined) {
    condition.is_active = is_active === "true";
  }

  // 2. Sortierung vorbereiten (ORDER BY Clause)
  // Format in URL: ?sort=price:asc oder ?sort=createdAt:desc
  const { sort } = req.query;
  let order = [["createdAt", "DESC"]]; // Standard: Neueste zuerst

  if (sort) {
    const [field, direction] = sort.split(":");
    // Einfacher Schutz: Nur erlaubte Felder zulassen
    const allowedFields = ["price", "name", "createdAt", "stock_quantity"];
    const allowedDirections = ["ASC", "DESC"];

    if (
      allowedFields.includes(field) &&
      allowedDirections.includes(direction.toUpperCase())
    ) {
      order = [[field, direction.toUpperCase()]];
    }
  }

  // findAndCountAll gibt ein Objekt mit { count, rows } zurück
  const data = await Product.findAndCountAll({
    where: condition, // Hier fügen wir unsere Filter ein
    limit,
    offset,
    order: order, // Hier fügen wir die Sortierung ein
    include: [{ model: db.ProductImage, as: "images" }],
    distinct: true,
  });

  const response = getPagingData(data, page, limit);

  res.send(response);
});

module.exports = {
  create,
  findAll,
  findOne,
  update,
  delete: deleteProduct,
};
