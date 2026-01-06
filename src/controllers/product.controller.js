const catchAsync = require("../utils/catchAsync");
const productService = require("../services/product.service");

// Erstelle und speichere ein neues Produkt mit Bildern
const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.files);
    res.status(201).send(product);
  } catch (error) {
    next(error);
  }
};

// Finde ein einzelnes Produkt anhand seiner ID
const findOne = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const data = await productService.getProductById(id);

  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Produkt mit ID=${id} wurde nicht gefunden.`,
    });
  }
});

// Aktualisiere ein Produkt anhand seiner ID
const update = async (req, res, next) => {
  const id = req.params.id;

  try {
    const product = await productService.updateProduct(id, req.body, req.files);
    
    if (!product) {
      return res.status(404).send({ message: "Produkt nicht gefunden." });
    }

    res.send(product);
  } catch (error) {
    next(error);
  }
};

// Lösche ein Produkt anhand seiner ID
const deleteProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const success = await productService.deleteProduct(id);

  if (success) {
    res.send({
      message: "Produkt wurde erfolgreich gelöscht!",
    });
  } else {
    res.send({
      message: `Kann Produkt mit ID=${id} nicht löschen. Eventuell wurde es nicht gefunden.`,
    });
  }
});

// Rufe alle Produkte ab (mit Paginierung, Filterung, Sortierung UND Caching)
const findAll = catchAsync(async (req, res, next) => {
  const response = await productService.getAllProducts(req.query);
  res.send(response);
});

module.exports = {
  create,
  findAll,
  findOne,
  update,
  delete: deleteProduct,
};
