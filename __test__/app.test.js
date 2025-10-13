const request = require("supertest");
const app = require("../src/index");
const db = require("../src/database");

// Test-Suite für die grundlegende App-Funktionalität
describe("App Status", () => {
  // Nach allen Tests in dieser Datei die Datenbankverbindung schließen
  afterAll(async () => {
    await db.sequelize.close();
  });

  // Testfall: Soll den Status-Endpunkt erfolgreich abfragen
  it("sollte auf GET /api/v1/status mit 200 OK antworten", async () => {
    const response = await request(app)
      .get("/api/v1/status")
      .expect("Content-Type", /json/)
      .expect(200);

    // Überprüfe den Inhalt der Antwort
    expect(response.body.status).toBe("ok");
    expect(response.body.message).toBe(
      "Datenbankverbindung ist erfolgreich hergestellt."
    );
  });
});
