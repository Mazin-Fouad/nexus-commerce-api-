const request = require("supertest");
const app = require("../src/index");
const db = require("../src/database");

describe("Order Endpoints", () => {
  let authToken;
  let adminToken;
  let userId;
  let adminId;
  let testProduct;

  beforeAll(async () => {
    // Erstelle Admin-Benutzer
    const admin = await db.User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin.order@test.com",
      password: "admin123",
      role: "admin",
    });
    adminId = admin.id;

    const adminLoginRes = await request(app).post("/api/v1/users/login").send({
      email: "admin.order@test.com",
      password: "admin123",
    });
    adminToken = adminLoginRes.body.accessToken;

    // Erstelle normalen Benutzer
    const user = await db.User.create({
      firstName: "Customer",
      lastName: "User",
      email: "customer@test.com",
      password: "customer123",
    });
    userId = user.id;

    const userLoginRes = await request(app).post("/api/v1/users/login").send({
      email: "customer@test.com",
      password: "customer123",
    });
    authToken = userLoginRes.body.accessToken;

    // Erstelle Testprodukt
    testProduct = await db.Product.create({
      name: "Test Order Product",
      description: "Produkt für Bestelltests",
      price: 99.99,
      stock_quantity: 100,
      sku: "ORDER-TEST-001",
    });
  });

  beforeEach(async () => {
    await db.OrderItem.destroy({ where: {} });
    await db.Order.destroy({ where: {} });
  });

  afterAll(async () => {
    await db.OrderItem.destroy({ where: {} });
    await db.Order.destroy({ where: {} });
    await db.Product.destroy({ where: {} });
    await db.User.destroy({ where: {} });
    await db.sequelize.close();
  });

  describe("POST /api/v1/orders", () => {
    it("sollte eine neue Bestellung erstellen", async () => {
      const orderData = {
        items: [
          {
            product_id: testProduct.id,
            quantity: 2,
          },
        ],
        shipping_address: "Teststraße 123, 12345 Teststadt",
      };

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.status).toBe("pending");
      expect(res.body.total).toBe("199.98"); // 2 * 99.99
      expect(res.body.items).toHaveLength(1);
    });

    it("sollte Lagerbestand nach Bestellung reduzieren", async () => {
      const initialStock = testProduct.stock_quantity;

      const orderData = {
        items: [
          {
            product_id: testProduct.id,
            quantity: 5,
          },
        ],
        shipping_address: "Teststraße 456, 54321 Teststadt",
      };

      await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      // Lade das Produkt neu und prüfe den Lagerbestand
      await testProduct.reload();
      expect(testProduct.stock_quantity).toBe(initialStock - 5);
    });

    it("sollte fehlschlagen bei unzureichendem Lagerbestand", async () => {
      const orderData = {
        items: [
          {
            product_id: testProduct.id,
            quantity: 1000, // Mehr als verfügbar
          },
        ],
        shipping_address: "Teststraße 789, 98765 Teststadt",
      };

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData)
        .expect(500);

      expect(res.body.message).toContain("Lagerbestand");
    });

    it("sollte fehlschlagen bei nicht existierendem Produkt", async () => {
      const orderData = {
        items: [
          {
            product_id: 99999,
            quantity: 1,
          },
        ],
        shipping_address: "Teststraße 101, 10101 Teststadt",
      };

      await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(orderData)
        .expect(500);
    });

    it("sollte fehlschlagen ohne Authentifizierung", async () => {
      const orderData = {
        items: [
          {
            product_id: testProduct.id,
            quantity: 1,
          },
        ],
        shipping_address: "Teststraße 202, 20202 Teststadt",
      };

      await request(app).post("/api/v1/orders").send(orderData).expect(403);
    });

    it("sollte Validierungsfehler bei ungültigen Daten zurückgeben", async () => {
      const invalidOrderData = {
        items: [], // Leeres Array
        shipping_address: "Test", // Zu kurz
      };

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidOrderData)
        .expect(400);

      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("GET /api/v1/orders", () => {
    it("sollte alle eigenen Bestellungen abrufen", async () => {
      // Erstelle zwei Bestellungen für den Benutzer
      await db.Order.bulkCreate([
        {
          user_id: userId,
          total: 99.99,
          status: "pending",
          shipping_address: "Adresse 1",
        },
        {
          user_id: userId,
          total: 199.98,
          status: "processing",
          shipping_address: "Adresse 2",
        },
      ]);

      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("status");
    });

    it("sollte keine Bestellungen anderer Benutzer anzeigen", async () => {
      // Erstelle Bestellung für einen anderen Benutzer
      const otherUser = await db.User.create({
        firstName: "Other",
        lastName: "User",
        email: "other@test.com",
        password: "other123",
      });

      await db.Order.create({
        user_id: otherUser.id,
        total: 299.99,
        status: "shipped",
        shipping_address: "Andere Adresse",
      });

      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Sollte nur die Bestellungen des eingeloggten Benutzers zeigen
      res.body.forEach((order) => {
        expect(order.user_id).toBe(userId);
      });
    });
  });

  describe("GET /api/v1/orders/:id", () => {
    it("sollte eine spezifische eigene Bestellung abrufen", async () => {
      const order = await db.Order.create({
        user_id: userId,
        total: 149.99,
        status: "delivered",
        shipping_address: "Spezifische Adresse",
      });

      const res = await request(app)
        .get(`/api/v1/orders/${order.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(order.id);
      expect(res.body.total).toBe("149.99");
      expect(res.body).toHaveProperty("customer");
    });

    it("sollte 404 zurückgeben für nicht existierende Bestellung", async () => {
      await request(app)
        .get("/api/v1/orders/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("sollte 404 zurückgeben für fremde Bestellung", async () => {
      // Erstelle Bestellung für anderen Benutzer
      const otherUser = await db.User.create({
        firstName: "Another",
        lastName: "User",
        email: "another@test.com",
        password: "another123",
      });

      const foreignOrder = await db.Order.create({
        user_id: otherUser.id,
        total: 399.99,
        status: "pending",
        shipping_address: "Fremde Adresse",
      });

      await request(app)
        .get(`/api/v1/orders/${foreignOrder.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("GET /api/v1/orders/admin/all", () => {
    it("sollte alle Bestellungen abrufen (nur Admin)", async () => {
      // Erstelle Bestellungen für verschiedene Benutzer
      await db.Order.bulkCreate([
        {
          user_id: userId,
          total: 99.99,
          status: "pending",
        },
        {
          user_id: adminId,
          total: 199.98,
          status: "shipped",
        },
      ]);

      const res = await request(app)
        .get("/api/v1/orders/admin/all")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it("sollte fehlschlagen ohne Admin-Rechte", async () => {
      await request(app)
        .get("/api/v1/orders/admin/all")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe("PATCH /api/v1/orders/admin/:id/status", () => {
    it("sollte den Status einer Bestellung aktualisieren (nur Admin)", async () => {
      const order = await db.Order.create({
        user_id: userId,
        total: 249.99,
        status: "pending",
        shipping_address: "Status Update Adresse",
      });

      const res = await request(app)
        .patch(`/api/v1/orders/admin/${order.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "shipped" })
        .expect(200);

      expect(res.body.status).toBe("shipped");
    });

    it("sollte fehlschlagen ohne Admin-Rechte", async () => {
      const order = await db.Order.create({
        user_id: userId,
        total: 149.99,
        status: "pending",
      });

      await request(app)
        .patch(`/api/v1/orders/admin/${order.id}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "processing" })
        .expect(403);
    });

    it("sollte Validierungsfehler bei ungültigem Status zurückgeben", async () => {
      const order = await db.Order.create({
        user_id: userId,
        total: 99.99,
        status: "pending",
      });

      const res = await request(app)
        .patch(`/api/v1/orders/admin/${order.id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "invalid_status" })
        .expect(400);

      expect(res.body).toHaveProperty("errors");
    });
  });
});
