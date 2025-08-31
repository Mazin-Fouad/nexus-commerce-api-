# Nexus Commerce API

Eine RESTful-API für eine E-Commerce-Plattform, die mit Node.js, Express, Sequelize und MySQL erstellt wurde.

## Aktueller Zustand

Dies ist die erste Version des Projekts. Die grundlegende Projektstruktur ist eingerichtet, einschließlich der Konfiguration für die Datenbankverbindung und der grundlegenden Express-Server-Einrichtung.

## Technologien

- **Node.js:** Laufzeitumgebung für JavaScript
- **Express:** Web-Framework für Node.js
- **Sequelize:** ORM für Node.js zur Interaktion mit der Datenbank
- **MySQL:** Relationale Datenbank
- **Docker:** Zur Containerisierung der Anwendung und der Datenbank

## Erste Schritte

### Voraussetzungen

- Node.js
- Docker

### Installation

1. Klonen Sie das Repository:
   ```bash
   git clone https://github.com/ihrem-benutzernamen/nexus-commerce-api.git
   ```
2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   ```
3. Erstellen Sie eine `.env`-Datei im Stammverzeichnis und fügen Sie die folgenden Umgebungsvariablen hinzu:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=secret
   DB_NAME=nexus_commerce
   ```
4. Starten Sie die Datenbank mit Docker Compose:
   ```bash
   docker-compose up -d
   ```
5. Starten Sie den Server:
   ```bash
   npm start
   ```

## API-Endpunkte

_Noch nicht implementiert._

## Datenbankschema

_Noch nicht implementiert._

## Projektstruktur

```
nexus-commerce-api/
├── config/
│   └── config.js
├── src/
│   ├── database.js
│   └── index.js
├── .env
├── docker-compose.yml
├── package.json
└── README.md
```

## Mitwirken

Pull-Requests sind willkommen. Für größere Änderungen öffnen Sie bitte zuerst ein Issue, um zu besprechen, was Sie ändern möchten.

## Lizenz

[MIT](https://choosealicense.com/licenses/mit/)
