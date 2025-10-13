# Nexus Commerce API

Eine RESTful-API für eine E-Commerce-Plattform, die mit Node.js, Express, Sequelize und MySQL erstellt wurde.

## Aktueller Zustand

Die grundlegende Projektstruktur ist eingerichtet. Das **Benutzer-Modul (User)** ist vollständig mit CRUD-Endpunkten implementiert. Zusätzlich wurde ein komplettes Authentifizierungssystem mit Passwort-Hashing (`bcrypt`) und JSON Web Tokens (JWT) für die Autorisierung hinzugefügt.

Das Projekt wurde um ein vollständiges **Produkt-Modul** erweitert. Dieses Modul umfasst CRUD-Operationen für Produkte und die Möglichkeit, Bilder für jedes Produkt hochzuladen und zu verwalten.

Ein **Bestellungs-Modul** wurde implementiert, das es Benutzern ermöglicht, Bestellungen aufzugeben und Admins, diese zu verwalten.

Umfassende **Tests** mit Jest und Supertest wurden für alle Module implementiert.

## Technologien

- **Node.js:** Laufzeitumgebung für JavaScript
- **Express:** Web-Framework für Node.js
- **Sequelize:** ORM für Node.js zur Interaktion mit der Datenbank
- **MySQL:** Relationale Datenbank
- **Docker:** Zur Containerisierung der Anwendung und der Datenbank
- **jsonwebtoken:** Zur Erstellung und Verifizierung von JWTs
- **bcryptjs:** Zum sicheren Hashen von Passwörtern
- **Cloudinary & Multer:** Für das Hochladen und Speichern von Produktbildern
- **Jest & Supertest:** Für automatisierte Tests

## Erste Schritte

### Voraussetzungen

- Node.js
- Docker & Docker Compose

### Installation

1.  Klonen Sie das Repository:
    ```bash
    git clone https://github.com/ihrem-benutzernamen/nexus-commerce-api.git
    ```
2.  Installieren Sie die Abhängigkeiten:
    ```bash
    npm install
    ```
3.  Erstellen Sie eine `.env`-Datei im Stammverzeichnis und passen Sie die Werte an:

    ```
    # Datenbank-Konfiguration
    DB_HOST=127.0.0.1
    DB_USER=mein_benutzer
    DB_PASSWORD=mein_sicheres_passwort
    DB_NAME=nexus_commerce_db
    DB_ROOT_PASSWORD=mein_sicheres_root_passwort
    DB_PORT=3307

    # Server Port
    PORT=3000

    # JWT Secret
    JWT_SECRET="Ihr_super_geheimes_Geheimnis_hier_einfügen"

    # Cloudinary Konfiguration
    CLOUDINARY_CLOUD_NAME="Ihr_Cloud_Name"
    CLOUDINARY_API_KEY="Ihr_API_Key"
    CLOUDINARY_API_SECRET="Ihr_API_Secret"

    # Test Database
    TEST_DB_NAME=nexus_commerce_test
    TEST_DB_USER=mein_benutzer
    TEST_DB_PASSWORD=mein_sicheres_passwort
    TEST_DB_HOST=localhost
    TEST_DB_PORT=3307
    ```

4.  Starten Sie die Datenbank und Adminer mit Docker Compose:
    ```bash
    docker-compose up -d
    ```
5.  Führen Sie die Datenbank-Migrationen aus:
    ```bash
    npx sequelize-cli db:migrate
    ```
6.  Starten Sie den Entwicklungsserver:
    ```bash
    npm run dev
    ```
    Der Server läuft nun auf `http://localhost:3000`. Die Datenbank ist über Port `3307` erreichbar und Adminer unter `http://localhost:8080`.

## Tests

### Tests ausführen

Führen Sie alle Tests aus:

```bash
npm test
```

Tests im Watch-Modus ausführen:

```bash
npm test -- --watch
```

Test-Coverage generieren:

```bash
npm test -- --coverage
```

### Test-Struktur

Die Tests befinden sich im `__test__` Verzeichnis:

- `__test__/app.test.js` - Tests für die grundlegende App-Funktionalität
- `__test__/user.test.js` - Tests für Benutzer-Endpunkte
- `__test__/product.test.js` - Tests für Produkt-Endpunkte
- `__test__/order.test.js` - Tests für Bestellungs-Endpunkte
- `__test__/auth.test.js` - Tests für Authentifizierung und Autorisierung

### Test-Datenbank

Die Tests verwenden eine separate Test-Datenbank (`nexus_commerce_test`), um die Produktionsdaten nicht zu beeinträchtigen. Diese wird automatisch vor jedem Testlauf bereinigt.

## API-Endpunkte

### Status

- **`GET /api/v1/status`**: Überprüft den Status der Datenbankverbindung.

### Authentifizierung (`/api/v1/users`)

- **`POST /` (Registrierung)**: Erstellt einen neuen Benutzer.
  - **Body (JSON):** `{ "firstName": "Max", "lastName": "Mustermann", "email": "max@test.de", "password": "secret" }`
- **`POST /login` (Login)**: Authentifiziert einen Benutzer und gibt einen JWT zurück.
  - **Body (JSON):** `{ "email": "max@test.de", "password": "secret" }`

### Benutzer-Routen (`/api/v1/users`)

Diese Routen erfordern einen gültigen JWT im `Authorization`-Header (`Bearer <Token>`).

- **`GET /:id`**: Ruft einen einzelnen Benutzer anhand seiner ID ab.
- **`PUT /:id`**: Aktualisiert einen Benutzer anhand seiner ID.
- **`DELETE /:id`**: Löscht einen Benutzer anhand seiner ID.

### Produkt-Routen (`/api/v1/products`)

#### Öffentliche Routen

- **`GET /`**: Listet alle Produkte auf.
- **`GET /:id`**: Ruft ein einzelnes Produkt anhand seiner ID ab.

#### Geschützte Routen (Admin)

Diese Routen erfordern einen gültigen JWT im `Authorization`-Header und Admin-Rechte.

- **`POST /`**: Erstellt ein neues Produkt.
  - **Body (form-data):** `name`, `description`, `price`, `stock_quantity`, `sku` und bis zu 5 `images`.
- **`PUT /:id`**: Aktualisiert ein Produkt anhand seiner ID.
  - **Body (form-data):** Felder wie bei `POST`.
- **`DELETE /:id`**: Löscht ein Produkt anhand seiner ID.

### Bestellungs-Routen (`/api/v1/orders`)

#### Kunden-Routen (Authentifizierung erforderlich)

- **`POST /`**: Erstellt eine neue Bestellung.
  - **Body (JSON):** `{ "items": [{"product_id": 1, "quantity": 2}], "shipping_address": "Straße 1, Stadt" }`
- **`GET /`**: Ruft alle eigenen Bestellungen ab.
- **`GET /:id`**: Ruft eine spezifische eigene Bestellung ab.

#### Admin-Routen (Admin-Rechte erforderlich)

- **`GET /admin/all`**: Ruft alle Bestellungen aller Kunden ab.
- **`PATCH /admin/:id/status`**: Aktualisiert den Status einer Bestellung.
  - **Body (JSON):** `{ "status": "shipped" }`

## Datenbankschema

### Tabelle: `users`

- `id` (INTEGER, PK, AI)
- `firstName` (STRING, Not Null)
- `lastName` (STRING, Not Null)
- `email` (STRING, Not Null, Unique)
- `password` (STRING, Not Null) - Speichert einen sicheren Hash.
- `role` (ENUM('customer', 'admin'), Default: 'customer')
- `createdAt`, `updatedAt` (DATE)

### Tabelle: `products`

- `id` (INTEGER, PK, AI)
- `name` (STRING, Not Null)
- `description` (TEXT)
- `price` (DECIMAL, Not Null)
- `stock_quantity` (INTEGER, Not Null)
- `sku` (STRING, Unique)
- `is_active` (BOOLEAN, Default: `true`)
- `createdAt`, `updatedAt` (DATE)

### Tabelle: `product_images`

- `id` (INTEGER, PK, AI)
- `product_id` (INTEGER, FK zu `products.id`)
- `image_url` (STRING, Not Null)
- `alt_text` (STRING)
- `is_primary` (BOOLEAN, Default: `false`)
- `sort_order` (INTEGER, Default: `0`)
- `createdAt`, `updatedAt` (DATE)

### Tabelle: `orders`

- `id` (INTEGER, PK, AI)
- `user_id` (INTEGER, FK zu `users.id`)
- `total` (DECIMAL, Not Null)
- `status` (ENUM: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
- `shipping_address` (TEXT)
- `createdAt`, `updatedAt` (DATE)

### Tabelle: `order_items`

- `id` (INTEGER, PK, AI)
- `order_id` (INTEGER, FK zu `orders.id`)
- `product_id` (INTEGER, FK zu `products.id`, nullable)
- `quantity` (INTEGER, Not Null)
- `price_at_time` (DECIMAL, Not Null)

## Projektstruktur

```
nexus-commerce-api/
├── __test__/
│   ├── app.test.js            # Tests für App-Status
│   ├── user.test.js           # Tests für Benutzer-Endpunkte
│   ├── product.test.js        # Tests für Produkt-Endpunkte
│   ├── order.test.js          # Tests für Bestellungs-Endpunkte
│   └── auth.test.js           # Tests für Authentifizierung
├── config/
│   └── config.js              # Sequelize-Konfiguration
├── migrations/                # Datenbank-Migrationen
├── src/
│   ├── config/
│   │   ├── cloudinary.config.js  # Cloudinary & Multer-Konfiguration
│   │   └── logger.config.js      # Winston Logger-Konfiguration
│   ├── controllers/
│   │   ├── user.controller.js    # Logik für die User-Routen
│   │   ├── product.controller.js # Logik für die Produkt-Routen
│   │   └── order.controller.js   # Logik für die Bestellungs-Routen
│   ├── middleware/
│   │   ├── auth.middleware.js    # Middleware für JWT-Authentifizierung
│   │   └── error.middleware.js   # Zentrale Fehlerbehandlung
│   ├── models/
│   │   ├── user.model.js          # Sequelize-Modell für User
│   │   ├── product.model.js       # Sequelize-Modell für Produkte
│   │   ├── productImages.model.js # Sequelize-Modell für Produktbilder
│   │   ├── order.model.js         # Sequelize-Modell für Bestellungen
│   │   └── orderItem.model.js     # Sequelize-Modell für Bestellpositionen
│   ├── routes/
│   │   ├── user.routes.js         # Express-Routen für User
│   │   ├── product.routes.js      # Express-Routen für Produkte
│   │   └── order.routes.js        # Express-Routen für Bestellungen
│   ├── utils/
│   │   └── catchAsync.js          # Utility für asynchrone Fehlerbehandlung
│   ├── validators/
│   │   ├── user.validator.js      # Validierung für User-Endpunkte
│   │   ├── product.validator.js   # Validierung für Produkt-Endpunkte
│   │   └── order.validator.js     # Validierung für Bestellungs-Endpunkte
│   ├── database.js            # Datenbankverbindung und Synchronisation
│   └── index.js               # Haupt-Einstiegspunkt der Anwendung
├── .env                       # Umgebungsvariablen
├── .gitignore
├── docker-compose.yml         # Docker-Konfiguration für DB und Adminer
├── jest.config.js             # Jest-Konfiguration
├── jest.setup.js              # Jest Setup-Datei
├── package.json
└── README.md
```

## Mitwirken

Pull-Requests sind willkommen. Für größere Änderungen öffnen Sie bitte zuerst ein Issue, um zu besprechen, was Sie ändern möchten.

## Lizenz

[MIT](https://choosealicense.com/licenses/mit/)
