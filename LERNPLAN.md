# Lernplan: Nexus Commerce API (Vollständiger Plan)

## Status Quo

- **Projekt:** `nexus-commerce-api-`
- **Stand:** Grundgerüst mit Node.js, Express und Sequelize ist aufgesetzt.
- **Commit:** `2181624d`

---

## Kapitel 3: Benutzer-Modul (User CRUD)

**Ziel:** Die grundlegende Verwaltung von Benutzern implementieren.

- [x] **3.1: Benutzer-Modell erstellen (`models/User.js`)**
- [x] **3.2: Datenbank-Synchronisation (Modell zur DB)**
- [x] **3.3: API-Routen-Struktur (`routes/userRoutes.js`)**
- [x] **3.4: Controller-Struktur (`controllers/userController.js`)**
- [x] **3.5: Route & Controller verbinden (GET all users)**
- [x] **3.6: Routen in der App registrieren (`index.js`)**
- [x] **3.7: CRUD-Endpunkte implementieren:**
  - [x] `POST /api/users` (Create)
  - [x] `GET /api/users/:id` (Read)
  - [x] `PUT /api/users/:id` (Update)
  - [x] `DELETE /api/users/:id` (Delete)

---

## Kapitel 4: Authentifizierung & Sicherheit

**Ziel:** Benutzer-Login ermöglichen und Passwörter sicher speichern.

- [x] **4.1: Passwort-Hashing mit `bcrypt`**
  - `bcrypt` installieren (`npm install bcryptjs`).
  - Das `User`-Modell anpassen, um Passwörter vor dem Speichern automatisch zu hashen.
- [x] **4.2: Login-Endpunkt erstellen (`POST /api/users/login`)**
  - Eine Methode im `User`-Modell erstellen, um das eingegebene Passwort mit dem Hash in der DB zu vergleichen.
  - Controller-Logik für den Login schreiben.
- [x] **4.3: JSON Web Tokens (JWT) für Sessions**
  - `jsonwebtoken` installieren (`npm install jsonwebtoken`).
  - Beim erfolgreichen Login einen JWT generieren und an den Client zurückgeben.
- [x] **4.4: Middleware für Routenschutz**
  - Eine Middleware-Funktion erstellen, die den JWT aus dem Request-Header validiert.
  - Routen, die eine Anmeldung erfordern, mit dieser Middleware schützen.

---

## Kapitel 5: Produkt-Modul (Product CRUD)

**Ziel:** Produkte im Shop verwalten können.

- [x] **5.1: Produkt-Modelle erstellen (`Product.js`, `ProductImage.js`)**
  - `Product`-Modell mit Feldern wie `name`, `description`, `price`, `stock`.
  - `ProductImage`-Modell für die 1-zu-n-Beziehung der Bilder.
- [x] **5.2: Datenbank-Synchronisation für Produkte**
- [x] **5.3: Bild-Upload mit Cloudinary einrichten**
  - `cloudinary` und `multer-storage-cloudinary` installieren.
  - Cloudinary-Konfiguration mit API-Keys aus `.env` erstellen.
  - Multer-Middleware für den Upload zu Cloudinary konfigurieren.
- [x] **5.4: CRUD-Endpunkte für Produkte (`/api/products`)**
  - Routen, Controller und Logik für das Erstellen, Lesen, Aktualisieren und Löschen von Produkten.
  - Integration des Bild-Uploads in die `POST`- und `PUT`-Routen.
- [x] **5.5: Produkt-Routen schützen**
  - Sicherstellen, dass nur authentifizierte Benutzer (z.B. Admins) Produkte erstellen/ändern können.

---

## Kapitel 6: Datenbank-Migrationen & Rollenbasierte Zugriffskontrolle (RBAC)

**Ziel:** Die Datenbankverwaltung auf professionelle Migrationen umstellen und gleichzeitig die Benutzerrollen für die Zugriffskontrolle einführen.

- [x] **6.1: `sequelize-cli` installieren und initialisieren**
  - `npm install --save-dev sequelize-cli`
  - `npx sequelize-cli init` ausführen, um die Ordnerstruktur zu erstellen.
- [x] **6.2: Konfiguration anpassen**
  - Die generierte `config/config.json` an die bestehende Projektstruktur und `.env`-Variablen anpassen.
- [x] **6.3: `sequelize.sync()` entfernen**
  - Den `sequelize.sync()`-Aufruf aus `src/database.js` entfernen. Die DB wird von nun an nur noch über Migrationen verwaltet.
- [x] **6.4: Migration für `role`-Spalte erstellen**
  - Eine neue Migration generieren: `npx sequelize-cli migration:generate --name add-role-to-users-table`
  - Die Migration so schreiben, dass sie eine `role`-Spalte (`ENUM('customer', 'admin')`) zur `users`-Tabelle hinzufügt.
- [x] **6.5: Migration ausführen**
  - `npx sequelize-cli db:migrate` ausführen, um die Änderung in der Datenbank anzuwenden.
- [x] **6.6: Benutzer-Modell anpassen**
  - Dem `User`-Modell das `role`-Feld hinzufügen, damit Sequelize davon weiß.
- [x] **6.7: Admin-Middleware erstellen**
  - Eine neue Middleware `isAdmin` in `auth.middleware.js` erstellen, die prüft, ob der angemeldete Benutzer die Rolle 'admin' hat.
- [x] **6.8: Produkt-Routen absichern**
  - Die `isAdmin`-Middleware zu den `POST`, `PUT` und `DELETE` Routen in `product.routes.js` hinzufügen.

---

## Kapitel 7: Bestellungs-Modul (Orders)

**Ziel:** Benutzer sollen Produkte bestellen und Admins diese verwalten können.

- [x] **7.1: Order-Modelle und Migrationen erstellen (`Order.js`, `OrderItem.js`)**
  - `Order`-Modell für die Bestellung selbst.
  - `OrderItem`-Modell als Zwischentabelle für die Many-to-Many-Beziehung.
  - Entsprechende Migrationen für die neuen Tabellen erstellen und ausführen.
- [x] **7.2: Beziehungen zwischen Modellen definieren**
  - `User` <-> `Order` (One-to-Many)
  - `Order` <-> `Product` (Many-to-Many via `OrderItem`)
- [x] **7.3: Kunden-Endpunkte für Bestellungen (`/api/orders`)**
  - `POST /api/orders`: Eine neue Bestellung aufgeben.
  - `GET /api/orders`: Die eigenen Bestellungen einsehen.
  - `GET /api/orders/:id`: Eine spezifische eigene Bestellung einsehen.
- [x] **7.4: Admin-Funktionen für Bestellungen**
  - `GET /api/orders/admin/all`: Alle Bestellungen aller Kunden einsehen.
  - `PATCH /api/orders/admin/:id/status`: Den Status einer Bestellung ändern.

---

## Kapitel 8: Fehlerbehandlung & Validierung

**Ziel:** Die API robuster und sicherer machen.

- [x] **8.1: Zentrale Fehlerbehandlungs-Middleware**
  - Winston Logger einrichten für professionelles Logging.
  - Error-Handler Middleware erstellen, die alle Fehler abfängt und standardisierte Antworten sendet.
- [x] **8.2: Asynchrone Fehler behandeln (Wrapper)**
  - `catchAsync` Utility-Funktion erstellen, um try-catch-Blöcke zu eliminieren.
  - Alle einfachen Controller-Funktionen mit dem Wrapper refaktorieren.
  - Manuelle try-catch-Blöcke nur bei Transaktionen beibehalten (für explizites rollback).
- [x] **8.3: Eingabevalidierung mit `express-validator`**
  - `express-validator` installieren.
  - Validator-Dateien für User, Product und Order erstellen.
  - Validierung in allen Routen integrieren.
  - Manuelle Validierungschecks aus Controllern entfernen.

---

## Kapitel 9: Ausblick & Optimierung

**Ziel:** Das Projekt für die Produktion vorbereiten.

- [x] **9.1: Testing mit `Jest` & `Supertest`**
  - Jest und Supertest installieren.
  - Test-Datenbank konfigurieren.
  - Tests für alle Module erstellen:
    - App-Status Tests
    - Benutzer-Tests (CRUD, Registrierung, Login)
    - Produkt-Tests (CRUD, Admin-Schutz)
    - Bestellungs-Tests (Erstellung, Lagerbestand, Admin-Funktionen)
    - Auth-Tests (Token-Validierung, Admin-Autorisierung)
  - Jest-Konfiguration und Setup-Dateien erstellen.
- [ ] **9.2: API-Dokumentation mit `Swagger`**

---

## Kapitel 10: Caching & Performance

**Ziel:** Intelligentes Caching für E-Commerce implementieren.

- [ ] **10.1: Redis Setup**
- [ ] **10.2: Selektives Produkt-Caching**
- [ ] **10.3: Cache Invalidation bei Updates**

---

## Kapitel 11: API-Design & Standards

**Ziel:** Einheitliche und verständliche API-Strukturen schaffen.

- [ ] **11.1: API Versioning (`/api/v1`)**
- [ ] **11.2: Rate Limiting**
- [ ] **11.3: CORS richtig konfigurieren**

---

## Kapitel 12: Sicherheit

**Ziel:** Die API gegen gängige Sicherheitsrisiken absichern.

- [ ] **12.1: Input Sanitization (XSS-Schutz)**
- [ ] **12.2: Helmet.js für Security Headers**
- [ ] **12.3: OWASP Top 10 Grundlagen**

---

## Kapitel 13: Monitoring & Logging

**Ziel:** Die API-Performance und -Sicherheit überwachen.

- [ ] **13.1: Structured Logging (z.B. Winston)**
- [ ] **13.2: Health Check Endpoints**

---

## Kapitel 14: Frontend Integration

**Ziel:** Ein Frontend für die API bereitstellen.

- [ ] **14.1: #t/Vue.js Frontend erstellen**
- [ ] **14.2: State Management (Redux/Zustand)**
- [ ] **14.3: HTTP Client (Axios/Fetch)**
- [ ] **14.4: Authentication Flow im Frontend**

---

## Kapitel 15: DevOps & Deployment

**Ziel:** Die API für den produktiven Einsatz bereitstellen.

- [ ] **15.1: Docker für Production**
- [ ] **15.2: CI/CD Pipeline (GitHub Actions)**
- [ ] **15.3: Cloud Deployment (AWS/Vercel)**

---

## Kapitel 16: Advanced Patterns

**Ziel:** Fortgeschrittene Architekturmuster und -techniken kennenlernen.

- [ ] **16.1: Microservices Architecture (Überblick)**
- [ ] **16.2: Event-Driven Architecture (Überblick)**
- [ ] **16.3: GraphQL als REST Alternative (Überblick)**
- [ ] **16.4: WebSockets für Real-time Features**
