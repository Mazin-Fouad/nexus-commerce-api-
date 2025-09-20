# Nexus Commerce API

Eine RESTful-API für eine E-Commerce-Plattform, die mit Node.js, Express, Sequelize und MySQL erstellt wurde.

## Aktueller Zustand

Die grundlegende Projektstruktur ist eingerichtet. Das **Benutzer-Modul (User)** ist vollständig mit CRUD-Endpunkten implementiert. Zusätzlich wurde ein komplettes Authentifizierungssystem mit Passwort-Hashing (`bcrypt`) und JSON Web Tokens (JWT) für die Autorisierung hinzugefügt.

Das Projekt wurde um ein vollständiges **Produkt-Modul** erweitert. Dieses Modul umfasst CRUD-Operationen für Produkte und die Möglichkeit, Bilder für jedes Produkt hochzuladen und zu verwalten.

## Technologien

- **Node.js:** Laufzeitumgebung für JavaScript
- **Express:** Web-Framework für Node.js
- **Sequelize:** ORM für Node.js zur Interaktion mit der Datenbank
- **MySQL:** Relationale Datenbank
- **Docker:** Zur Containerisierung der Anwendung und der Datenbank
- **jsonwebtoken:** Zur Erstellung und Verifizierung von JWTs
- **bcryptjs:** Zum sicheren Hashen von Passwörtern
- **Cloudinary & Multer:** Für das Hochladen und Speichern von Produktbildern

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
    ```

4.  Starten Sie die Datenbank und Adminer mit Docker Compose:
    ```bash
    docker-compose up -d
    ```
5.  Starten Sie den Entwicklungsserver:
    ```bash
    npm run dev
    ```
    Der Server läuft nun auf `http://localhost:3000`. Die Datenbank ist über Port `3307` erreichbar und Adminer unter `http://localhost:8080`.

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

#### Geschützte Routen

Diese Routen erfordern einen gültigen JWT im `Authorization`-Header.

- **`POST /`**: Erstellt ein neues Produkt.
  - **Body (form-data):** `name`, `description`, `price`, `stock_quantity`, `sku` und bis zu 5 `images`.
- **`PUT /:id`**: Aktualisiert ein Produkt anhand seiner ID.
  - **Body (form-data):** Felder wie bei `POST`.
- **`DELETE /:id`**: Löscht ein Produkt anhand seiner ID.

## Datenbankschema

### Tabelle: `users`

- `id` (INTEGER, PK, AI)
- `firstName` (STRING, Not Null)
- `lastName` (STRING)
- `email` (STRING, Not Null, Unique)
- `password` (STRING, Not Null) - Speichert einen sicheren Hash.
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

## Projektstruktur

```
nexus-commerce-api/
├── config/
│   └── config.js              # Sequelize-Konfiguration
├── src/
│   ├── config/
│   │   └── cloudinary.config.js # Cloudinary & Multer-Konfiguration
│   ├── controllers/
│   │   ├── user.controller.js     # Logik für die User-Routen
│   │   └── product.controller.js  # Logik für die Produkt-Routen
│   ├── middleware/
│   │   └── auth.middleware.js     # Middleware für die JWT-Authentifizierung
│   ├── models/
│   │   ├── user.model.js          # Sequelize-Modell für User
│   │   ├── product.model.js       # Sequelize-Modell für Produkte
│   │   └── productImages.model.js # Sequelize-Modell für Produktbilder
│   ├── routes/
│   │   ├── user.routes.js         # Express-Routen für User
│   │   └── product.routes.js      # Express-Routen für Produkte
│   ├── database.js            # Datenbankverbindung und Synchronisation
│   └── index.js               # Haupt-Einstiegspunkt der Anwendung
├── .env                       # Umgebungsvariablen
├── docker-compose.yml         # Docker-Konfiguration für DB und Adminer
├── package.json
└── README.md
```

## Mitwirken

Pull-Requests sind willkommen. Für größere Änderungen öffnen Sie bitte zuerst ein Issue, um zu besprechen, was Sie ändern möchten.

## Lizenz

[MIT](https://choosealicense.com/licenses/mit/)

---

// filepath: src/database.js
const { Sequelize } = require("sequelize");
const allConfigs = require("../config/config.js");

const config = allConfigs.development;
