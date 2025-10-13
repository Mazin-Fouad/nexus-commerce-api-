const request = require("supertest");
const app = require("../src/index");
const db = require("../src/database");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

describe("Authentication & Authorization", () => {
  let testUser;
  let adminUser;
  let validToken;
  let adminToken;

  beforeAll(async () => {
    // Erstelle normalen Testbenutzer
    testUser = await db.User.create({
      firstName: "Test",
      lastName: "User",
      email: "auth.test@example.com",
      password: "password123",
      role: "customer",
    });

    // Erstelle Admin-Benutzer
    adminUser = await db.User.create({
      firstName: "Admin",
      lastName: "Test",
      email: "admin.auth@example.com",
      password: "admin123",
      role: "admin",
    });

    // Generiere gültige Tokens
    validToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      config.development.jwtSecret,
      { expiresIn: "3h" }
    );

    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      config.development.jwtSecret,
      { expiresIn: "3h" }
    );
  });

  afterAll(async () => {
    await db.Order.destroy({ where: {} });
    await db.User.destroy({ where: {} });
    await db.sequelize.close();
  });

  describe("Login-Funktionalität", () => {
    it("sollte erfolgreich einloggen mit gültigen Credentials", async () => {
      const res = await request(app).post("/api/v1/users/login").send({
        email: "auth.test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body.message).toBe("Login erfolgreich!");
      expect(res.body.user.email).toBe("auth.test@example.com");
    });

    it("sollte fehlschlagen mit falscher E-Mail", async () => {
      const res = await request(app).post("/api/v1/users/login").send({
        email: "wrong@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Ungültige Anmeldedaten");
    });

    it("sollte fehlschlagen mit falschem Passwort", async () => {
      const res = await request(app).post("/api/v1/users/login").send({
        email: "auth.test@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Ungültige Anmeldedaten");
    });

    it("sollte Validierungsfehler bei fehlenden Daten zurückgeben", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "test@example.com",
          // password fehlt
        })
        .expect(400);

      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("Token-Validierung", () => {
    it("sollte geschützte Route mit gültigem Token erlauben", async () => {
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);
    });

    it("sollte geschützte Route ohne Token ablehnen", async () => {
      const res = await request(app).get("/api/v1/orders").expect(403);

      expect(res.body.message).toContain("Kein Token");
    });

    it("sollte geschützte Route mit ungültigem Token ablehnen", async () => {
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", "Bearer invalid_token_here")
        .expect(401);

      expect(res.body.message).toContain("Nicht autorisiert");
    });

    it("sollte geschützte Route mit abgelaufenem Token ablehnen", async () => {
      const expiredToken = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        config.development.jwtSecret,
        { expiresIn: "0s" } // Sofort abgelaufen
      );

      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body.message).toContain("Nicht autorisiert");
    });
  });

  describe("Admin-Autorisierung", () => {
    it("sollte Admin-Route mit Admin-Token erlauben", async () => {
      const product = await db.Product.create({
        name: "Admin Test Product",
        price: 99.99,
        stock_quantity: 10,
        sku: "ADMIN-001",
      });

      await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });

    it("sollte Admin-Route mit normalem Benutzer-Token ablehnen", async () => {
      const product = await db.Product.create({
        name: "User Test Product",
        price: 49.99,
        stock_quantity: 5,
        sku: "USER-001",
      });

      const res = await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set("Authorization", `Bearer ${validToken}`)
        .expect(403);

      expect(res.body.message).toContain("Admin-Rolle erforderlich");
    });

    it("sollte Admin-Endpunkt für Bestellungen nur mit Admin-Token erlauben", async () => {
      await request(app)
        .get("/api/v1/orders/admin/all")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      await request(app)
        .get("/api/v1/orders/admin/all")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(403);
    });
  });

  describe("Passwort-Sicherheit", () => {
    it("sollte Passwort nicht im Klartext zurückgeben", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .expect(200);

      expect(res.body).not.toHaveProperty("password");
    });

    it("sollte Passwort hashen beim Erstellen", async () => {
      const newUser = await db.User.create({
        firstName: "Hash",
        lastName: "Test",
        email: "hash.test@example.com",
        password: "plaintext",
      });

      expect(newUser.password).not.toBe("plaintext");
      expect(newUser.password.length).toBeGreaterThan(20);
    });
  });
});
