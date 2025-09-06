# Nexus Commerce API

Eine RESTful-API für eine E-Commerce-Plattform, die mit Node.js, Express, Sequelize und MySQL erstellt wurde.

## Aktueller Zustand

Die grundlegende Projektstruktur ist eingerichtet. Das Benutzer-Modul (User) ist vollständig mit CRUD-Endpunkten (Create, Read, Update, Delete) implementiert. Die Anwendung ist mit einer MySQL-Datenbank verbunden, die über Docker läuft.

## Technologien

- **Node.js:** Laufzeitumgebung für JavaScript
- **Express:** Web-Framework für Node.js
- **Sequelize:** ORM für Node.js zur Interaktion mit der Datenbank
- **MySQL:** Relationale Datenbank
- **Docker:** Zur Containerisierung der Anwendung und der Datenbank

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

Alle Benutzer-Endpunkte sind unter dem Präfix `/api/v1/users` erreichbar.

- **`POST /`**: Erstellt einen neuen Benutzer.
  - **Body (JSON):** `{ "firstName": "Max", "lastName": "Mustermann", "email": "max@test.de", "password": "secret" }`
- **`GET /:id`**: Ruft einen einzelnen Benutzer anhand seiner ID ab.
- **`PUT /:id`**: Aktualisiert einen Benutzer anhand seiner ID.
- **`DELETE /:id`**: Löscht einen Benutzer anhand seiner ID.
- **`GET /api/v1/status`**: Überprüft den Status der Datenbankverbindung.

## Datenbankschema

### Tabelle: `users`

Das `User`-Modell wird auf die Tabelle `users` abgebildet und enthält die folgenden Felder:

- `id` (INTEGER, Primary Key, Auto Increment)
- `firstName` (STRING, Not Null)
- `lastName` (STRING)
- `email` (STRING, Not Null, Unique)
- `password` (STRING, Not Null)
- `createdAt` (DATE, automatisch von Sequelize verwaltet)
- `updatedAt` (DATE, automatisch von Sequelize verwaltet)

## Projektstruktur

```
nexus-commerce-api/
├── config/
│   └── config.js         # Sequelize-Konfiguration
├── src/
│   ├── controllers/
│   │   └── user.controller.js # Logik für die User-Routen
│   ├── models/
│   │   └── user.model.js      # Sequelize-Modell für User
│   ├── routes/
│   │   └── user.routes.js     # Express-Routen für User
│   ├── database.js         # Datenbankverbindung und Synchronisation
│   └── index.js            # Haupt-Einstiegspunkt der Anwendung
├── .env                    # Umgebungsvariablen (Beispiel)
├── docker-compose.yml      # Docker-Konfiguration für DB und Adminer
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
