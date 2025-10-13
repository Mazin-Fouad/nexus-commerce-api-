const request = require("supertest");
const app = require("../src/index");
const db = require("../src/database");

// Test-Suite für die Benutzer-Authentifizierung
describe("User Authentication Endpoints", () => {
  // Diese Funktion wird VOR JEDEM einzelnen Test in dieser Suite ausgeführt.
  // Wir leeren die 'users'-Tabelle, um sicherzustellen, dass jeder Test mit
  // einer sauberen Datenbank startet und Tests sich nicht gegenseitig beeinflussen.
  beforeEach(async () => {
    // ÄNDERUNG: Wir verwenden 'where: {}', um alle Einträge zu löschen.
    // Dies respektiert die Fremdschlüssel-Beziehungen und ist zuverlässiger.
    await db.Order.destroy({ where: {} }); // Zuerst die abhängigen Daten löschen
    await db.User.destroy({ where: {} }); // Dann die Haupt-Daten
  });

  // Diese Funktion wird ausgeführt, nachdem ALLE Tests in dieser Suite beendet sind.
  afterAll(async () => {
    await db.sequelize.close();
  });

  // Testfall für die erfolgreiche Registrierung
  it("sollte einen neuen Benutzer erfolgreich registrieren (POST /api/v1/users)", async () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      email: "test.user@example.com",
      password: "password123",
    };

    const res = await request(app)
      .post("/api/v1/users")
      .send(newUser) // .send() schickt die Daten im Request-Body
      .expect("Content-Type", /json/)
      .expect(201); // 201 Created ist der korrekte Status für eine erfolgreiche Erstellung

    // Überprüfen, ob die Antwort die erwarteten Felder enthält
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(newUser.email);

    // SEHR WICHTIG: Überprüfen, dass das Passwort NICHT im Klartext zurückgegeben wird
    expect(res.body).not.toHaveProperty("password");

    // Zusätzlicher Check: Existiert der Benutzer wirklich in der Datenbank?
    const dbUser = await db.User.findByPk(res.body.id);
    expect(dbUser).not.toBeNull();
    expect(dbUser.email).toBe(newUser.email);
  });

  // Testfall für eine fehlgeschlagene Registrierung (fehlende Daten)
  it("sollte mit Status 400 fehlschlagen, wenn Daten fehlen", async () => {
    const incompleteUser = {
      firstName: "Test",
      // email und password fehlen
    };

    const res = await request(app)
      .post("/api/v1/users")
      .send(incompleteUser)
      .expect("Content-Type", /json/)
      .expect(400); // 400 Bad Request, weil die Validierung fehlschlagen sollte

    // Überprüfen, ob die Fehlerantwort das 'errors'-Array enthält
    expect(res.body).toHaveProperty("errors");
  });
});
