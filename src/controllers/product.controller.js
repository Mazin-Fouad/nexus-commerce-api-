const db = require("../database");
const { Op } = require("sequelize");
const Product = db.Product;
const ProductImage = db.ProductImage;
const catchAsync = require("../utils/catchAsync"); // Wrapper importieren

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

// Rufe alle Produkte aus der Datenbank ab (mit Filterung)
const findAll = catchAsync(async (req, res, next) => {
  const { name } = req.query; // Erlaubt Filterung nach Name, z.B. /api/v1/products?name=Laptop
  const condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  const data = await Product.findAll({
    where: condition,
    include: [{ model: ProductImage, as: "images" }], // Lade die zugehörigen Bilder mit
    order: [["createdAt", "DESC"]], // Neueste Produkte zuerst
  });
  res.send(data);
});

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

module.exports = {
  create,
  findAll,
  findOne,
  update,
  delete: deleteProduct,
};
