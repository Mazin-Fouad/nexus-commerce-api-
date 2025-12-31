const request = require("supertest");
const app = require("../src/index");
const db = require("../src/database");

describe("Product Endpoints", () => {
  let authToken;
  let adminToken;
  let testProductId;

  beforeAll(async () => {
    // Erstelle einen Admin-Benutzer für die Tests
    const adminUser = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    };

    await db.User.create(adminUser);

    // Login als Admin
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "admin@test.com",
      password: "admin123",
    });

    adminToken = loginRes.body.accessToken;

    // Erstelle einen normalen Benutzer
    const normalUser = {
      firstName: "Normal",
      lastName: "User",
      email: "user@test.com",
      password: "user123",
    };

    await db.User.create(normalUser);

    const userLoginRes = await request(app).post("/api/v1/users/login").send({
      email: "user@test.com",
      password: "user123",
    });

    authToken = userLoginRes.body.accessToken;
  });

  beforeEach(async () => {
    await db.ProductImage.destroy({ where: {} });
    await db.Product.destroy({ where: {} });
  });

  afterAll(async () => {
    await db.ProductImage.destroy({ where: {} });
    await db.Product.destroy({ where: {} });
    await db.Order.destroy({ where: {} });
    await db.User.destroy({ where: {} });
    await db.sequelize.close();
  });

  describe("GET /api/v1/products", () => {
    it("sollte alle Produkte abrufen (öffentlich)", async () => {
      // Erstelle Testprodukte
      await db.Product.bulkCreate([
        {
          name: "Produkt 1",
          description: "Beschreibung 1",
          price: 19.99,
          stock_quantity: 10,
          sku: "PROD-001",
        },
        {
          name: "Produkt 2",
          description: "Beschreibung 2",
          price: 29.99,
          stock_quantity: 5,
          sku: "PROD-002",
        },
      ]);

      const res = await request(app)
        .get("/api/v1/products")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty("name");
      expect(res.body.data[0]).toHaveProperty("price");
    });

    it("sollte Produkte nach Namen filtern können", async () => {
      await db.Product.create({
        name: "Laptop Dell XPS",
        description: "High-End Laptop",
        price: 1299.99,
        stock_quantity: 3,
        sku: "LAPTOP-001",
      });

      const res = await request(app)
        .get("/api/v1/products?name=Laptop")
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toContain("Laptop");
    });
  });

  describe("GET /api/v1/products/:id", () => {
    it("sollte ein einzelnes Produkt abrufen", async () => {
      const product = await db.Product.create({
        name: "Test Produkt",
        description: "Test Beschreibung",
        price: 49.99,
        stock_quantity: 20,
        sku: "TEST-001",
      });

      const res = await request(app)
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(res.body.id).toBe(product.id);
      expect(res.body.name).toBe("Test Produkt");
    });

    it("sollte 404 zurückgeben für nicht existierendes Produkt", async () => {
      const res = await request(app).get("/api/v1/products/99999").expect(404);

      expect(res.body.message).toContain("nicht gefunden");
    });
  });

  describe("POST /api/v1/products", () => {
    it("sollte ein neues Produkt erstellen (nur Admin)", async () => {
      const newProduct = {
        name: "Neues Produkt",
        description: "Eine neue Beschreibung",
        price: 79.99,
        stock_quantity: 15,
        sku: "NEW-001",
      };

      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newProduct)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe(newProduct.name);
      expect(Number(res.body.price)).toBe(newProduct.price);

      testProductId = res.body.id;
    });

    it("sollte fehlschlagen ohne Admin-Rechte", async () => {
      const newProduct = {
        name: "Produkt ohne Admin",
        description: "Sollte fehlschlagen",
        price: 99.99,
        stock_quantity: 10,
      };

      await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newProduct)
        .expect(403);
    });

    it("sollte fehlschlagen ohne Token", async () => {
      const newProduct = {
        name: "Produkt ohne Token",
        description: "Sollte fehlschlagen",
        price: 99.99,
        stock_quantity: 10,
      };

      await request(app).post("/api/v1/products").send(newProduct).expect(403);
    });

    it("sollte Validierungsfehler bei ungültigen Daten zurückgeben", async () => {
      const invalidProduct = {
        name: "A", // Zu kurz
        price: -10, // Negativer Preis
      };

      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /api/v1/products/:id", () => {
    it("sollte ein Produkt aktualisieren (nur Admin)", async () => {
      const product = await db.Product.create({
        name: "Altes Produkt",
        description: "Alte Beschreibung",
        price: 50.0,
        stock_quantity: 10,
        sku: "OLD-001",
      });

      const updates = {
        name: "Aktualisiertes Produkt",
        price: 60.0,
      };

      const res = await request(app)
        .put(`/api/v1/products/${product.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(res.body.name).toBe(updates.name);
      expect(parseFloat(res.body.price)).toBe(updates.price);
    });

    it("sollte 404 zurückgeben für nicht existierendes Produkt", async () => {
      await request(app)
        .put("/api/v1/products/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Test" })
        .expect(404);
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    it("sollte ein Produkt löschen (nur Admin)", async () => {
      const product = await db.Product.create({
        name: "Zu löschendes Produkt",
        description: "Wird gelöscht",
        price: 25.0,
        stock_quantity: 5,
        sku: "DEL-001",
      });

      const res = await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toContain("erfolgreich gelöscht");

      // Verifiziere, dass das Produkt wirklich gelöscht wurde
      const deletedProduct = await db.Product.findByPk(product.id);
      expect(deletedProduct).toBeNull();
    });

    it("sollte fehlschlagen ohne Admin-Rechte", async () => {
      const product = await db.Product.create({
        name: "Produkt",
        price: 25.0,
        stock_quantity: 5,
      });

      await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
