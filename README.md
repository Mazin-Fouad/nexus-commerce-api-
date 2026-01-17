<div align="center">

# 🚀 Nexus Commerce API

### Enterprise-grade E-Commerce Backend Solution

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Jest](https://img.shields.io/badge/Jest-Tested-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Features](#-features) • [Demo](#-demo) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Über das Projekt

**Nexus Commerce API** ist eine skalierbare, sichere und produktionsreife REST-API für moderne E-Commerce-Plattformen. Entwickelt nach **Best Practices** und **OWASP-Sicherheitsstandards**, bietet diese Lösung alle Funktionen, die für einen professionellen Online-Shop erforderlich sind.

### 🎯 Warum Nexus Commerce?

- ✅ **Produktionsbereit** - Vollständig getestet und dokumentiert
- ✅ **Skalierbar** - Redis-Caching für hohe Performance
- ✅ **Sicher** - OWASP-konform mit JWT, Rate Limiting & Input Sanitization
- ✅ **Docker-Ready** - Einfaches Deployment in jeder Umgebung
- ✅ **Wartbar** - Clean Architecture mit klarer Trennung von Concerns
- ✅ **Erweiterbar** - Modularer Aufbau für neue Features

---

## ✨ Features

### 🔐 Authentifizierung & Sicherheit

- **JWT-basierte Authentifizierung** mit sicheren Token
- **Bcrypt Password Hashing** (10 Salt Rounds)
- **Role-Based Access Control (RBAC)** - Customer & Admin Rollen
- **Rate Limiting** - DDoS & Brute-Force Schutz
- **Input Validation & Sanitization** - XSS-Schutz mit express-validator
- **Security Headers** - Helmet.js Integration
- **CORS** - Konfigurierbare Whitelist

### 👥 Benutzerverwaltung

- Vollständiges User CRUD
- Sichere Registrierung & Login
- Profil-Management
- Admin-Dashboard-Zugriff

### 📦 Produktverwaltung

- CRUD-Operationen für Produkte
- **Cloudinary Integration** - Cloud-basierter Bild-Upload
- Multi-Image Support (bis zu 5 Bilder pro Produkt)
- SKU-Management
- Lagerbestandsverwaltung
- Produkt-Aktivierung/-Deaktivierung

### 🛒 Bestellsystem

- Intuitive Bestellabwicklung
- Automatische Preisberechnung zum Bestellzeitpunkt
- Lagerbestandsprüfung in Echtzeit
- Status-Tracking (Pending → Processing → Shipped → Delivered)
- Admin-Dashboard für Bestellverwaltung
- Bestellhistorie für Kunden

### 📊 Performance & Monitoring

- **Redis Caching** - Intelligentes Caching für häufige Abfragen
- **Pagination** - Effiziente Datenverarbeitung bei großen Listen
- **Filtering & Sorting** - Flexible Produktsuche
- **Health Check Endpoints** - System-Monitoring
- **Structured Logging** - Winston Logger mit Correlation IDs
- **Sentry Integration** - Error Tracking & Performance Monitoring

### 📖 Developer Experience

- **Swagger/OpenAPI Dokumentation** - Interaktive API-Docs unter `/api-docs`
- **Umfassende Tests** - Jest & Supertest (Unit & Integration Tests)
- **Database Migrations** - Versionskontrolle für Schema-Änderungen
- **Docker Compose** - One-Command Setup
- **Environment Variables** - Flexible Konfiguration

---

## 🎬 Demo

### Swagger UI

![Swagger Demo](https://via.placeholder.com/800x400?text=Swagger+API+Documentation)

Besuchen Sie die [Live-Demo](http://localhost:3000/api-docs) für eine interaktive API-Exploration.

---

## 🛠️ Tech Stack

| Kategorie          | Technologien                |
| ------------------ | --------------------------- |
| **Runtime**        | Node.js 18+                 |
| **Framework**      | Express.js 4.x              |
| **Database**       | MySQL 8.0 mit Sequelize ORM |
| **Caching**        | Redis 7+                    |
| **Authentication** | JWT + Bcrypt                |
| **File Upload**    | Cloudinary + Multer         |
| **Validation**     | Express Validator           |
| **Testing**        | Jest + Supertest            |
| **Documentation**  | Swagger/OpenAPI 3.0         |
| **Logging**        | Winston                     |
| **Monitoring**     | Sentry                      |
| **DevOps**         | Docker + Docker Compose     |

---

## 🚀 Quick Start

### Voraussetzungen

```bash
node >= 18.0.0
npm >= 9.0.0
docker >= 20.0.0
docker-compose >= 1.29.0
```

### Installation

1️⃣ **Repository klonen**

```bash
git clone https://github.com/ihrem-benutzernamen/nexus-commerce-api.git
cd nexus-commerce-api
```

2️⃣ **Dependencies installieren**

```bash
npm install
```

3️⃣ **Environment Variables konfigurieren**

```bash
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Werten
```

```env
# Database
DB_HOST=127.0.0.1
DB_USER=nexus_user
DB_PASSWORD=secure_password
DB_NAME=nexus_commerce_db
DB_PORT=3308

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis
REDIS_URL=redis://localhost:6379

# Sentry (Optional)
SENTRY_DSN=your_sentry_dsn
```

4️⃣ **Services starten**

```bash
# Startet MySQL, Redis & Adminer
docker-compose up -d
```

5️⃣ **Database Migrations ausführen**

```bash
npx sequelize-cli db:migrate
```

6️⃣ **Entwicklungsserver starten**

```bash
npm run dev
```

🎉 **Fertig!** Die API läuft auf `http://localhost:3000`

---

## 📚 API Documentation

### Live-Dokumentation

Besuchen Sie **http://localhost:3000/api-docs** für die vollständige interaktive API-Dokumentation.

### Quick Reference

#### Authentifizierung

| Endpoint              | Methode | Beschreibung          | Auth |
| --------------------- | ------- | --------------------- | ---- |
| `/api/v1/users`       | POST    | Benutzer registrieren | ❌   |
| `/api/v1/users/login` | POST    | Benutzer anmelden     | ❌   |

#### Benutzer

| Endpoint            | Methode | Beschreibung           | Auth     |
| ------------------- | ------- | ---------------------- | -------- |
| `/api/v1/users`     | GET     | Alle Benutzer abrufen  | 🔒 Admin |
| `/api/v1/users/:id` | GET     | Benutzer abrufen       | 🔒 Token |
| `/api/v1/users/:id` | PUT     | Benutzer aktualisieren | 🔒 Token |
| `/api/v1/users/:id` | DELETE  | Benutzer löschen       | 🔒 Token |

#### Produkte

| Endpoint               | Methode | Beschreibung          | Auth     |
| ---------------------- | ------- | --------------------- | -------- |
| `/api/v1/products`     | GET     | Produkte auflisten    | ❌       |
| `/api/v1/products/:id` | GET     | Produkt abrufen       | ❌       |
| `/api/v1/products`     | POST    | Produkt erstellen     | 🔒 Admin |
| `/api/v1/products/:id` | PUT     | Produkt aktualisieren | 🔒 Admin |
| `/api/v1/products/:id` | DELETE  | Produkt löschen       | 🔒 Admin |

#### Bestellungen

| Endpoint                          | Methode | Beschreibung         | Auth     |
| --------------------------------- | ------- | -------------------- | -------- |
| `/api/v1/orders`                  | POST    | Bestellung erstellen | 🔒 Token |
| `/api/v1/orders`                  | GET     | Eigene Bestellungen  | 🔒 Token |
| `/api/v1/orders/:id`              | GET     | Bestellung abrufen   | 🔒 Token |
| `/api/v1/orders/admin/all`        | GET     | Alle Bestellungen    | 🔒 Admin |
| `/api/v1/orders/admin/:id/status` | PATCH   | Status aktualisieren | 🔒 Admin |

### Beispiel-Requests

#### Benutzer registrieren

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "max@example.com",
    "password": "SecurePass123!"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "max@example.com",
    "password": "SecurePass123!"
  }'
```

#### Produkt erstellen (mit Bild-Upload)

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=MacBook Pro" \
  -F "description=Powerful laptop" \
  -F "price=2499.99" \
  -F "stock_quantity=10" \
  -F "sku=MBP-2024" \
  -F "images=@/path/to/image.jpg"
```

---

## 🧪 Testing

### Test Suite ausführen

```bash
# Alle Tests
npm test

# Mit Coverage Report
npm test -- --coverage

# Watch Mode
npm test -- --watch

# Spezifischer Test
npm test -- user.test.js
```

### Test Coverage

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   94.23 |    87.65 |   92.18 |   94.67 |
 controllers        |   96.45 |    91.23 |   95.12 |   96.78 |
 services           |   93.87 |    85.34 |   90.45 |   94.12 |
 middleware         |   91.23 |    82.67 |   88.92 |   91.56 |
--------------------|---------|----------|---------|---------|
```

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│          (Frontend / Mobile App / Postman)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Rate Limiter │  │     CORS     │  │   Helmet     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Routes Layer                          │
│   /users   /products   /orders   /health                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Middleware Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     Auth     │  │  Validation  │  │    Logger    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Controllers Layer                        │
│         (Request/Response Handling)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Services Layer                          │
│         (Business Logic & Transactions)                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬───────────────┐
         ▼                       ▼               ▼
┌─────────────────┐    ┌─────────────────┐  ┌─────────────┐
│  MySQL Database │    │  Redis Cache    │  │  Cloudinary │
│   (Sequelize)   │    │                 │  │   (Images)  │
└─────────────────┘    └─────────────────┘  └─────────────┘
```

### Projektstruktur

```
nexus-commerce-api/
├── __test__/              # Test-Suite
│   ├── app.test.js
│   ├── user.test.js
│   ├── product.test.js
│   ├── order.test.js
│   └── auth.test.js
├── config/
│   └── config.js          # Sequelize Config
├── migrations/            # DB Migrations
├── src/
│   ├── config/
│   │   ├── cloudinary.config.js
│   │   ├── logger.config.js
│   │   ├── redis.js
│   │   └── swagger.config.js
│   ├── controllers/       # Request Handler
│   ├── middleware/        # Auth, Validation, Error Handling
│   ├── models/            # Sequelize Models
│   ├── routes/            # API Routes
│   ├── services/          # Business Logic
│   ├── utils/             # Helper Functions
│   ├── validators/        # Input Validation
│   ├── database.js        # DB Connection
│   └── index.js           # App Entry Point
├── .env                   # Environment Variables
├── docker-compose.yml     # Docker Services
├── Dockerfile             # Production Container
├── jest.config.js         # Test Configuration
└── package.json
```

---

## 🔒 Sicherheit

Dieses Projekt folgt den **OWASP Top 10** Best Practices:

✅ **Injection Prevention** - Sequelize ORM mit Prepared Statements  
✅ **Broken Authentication** - JWT + Bcrypt (10 Salt Rounds)  
✅ **XSS Protection** - Input Sanitization mit express-validator  
✅ **Broken Access Control** - RBAC Implementierung  
✅ **Security Misconfiguration** - Helmet.js + Environment Variables  
✅ **Sensitive Data Exposure** - Passwörter nie im Response  
✅ **Insufficient Logging** - Winston Structured Logging  
✅ **Rate Limiting** - 100 req/15min (API), 5 req/hour (Auth)  
✅ **CORS** - Whitelist-basierte Konfiguration  
✅ **Error Handling** - Keine sensiblen Infos in Error Messages

---

## 📊 Performance

### Caching-Strategie

- **Redis** für Produktlisten (1h TTL)
- Automatische Cache-Invalidierung bei Updates
- ~85% Reduktion der DB-Queries bei häufigen Abfragen

### Pagination

- Standard: 20 Items/Seite
- Konfigurierbar: `?page=1&limit=50`
- Verhindert Speicher-Überlastung bei großen Datensätzen

### Database Optimizations

- Indizes auf `name`, `sku`, `is_active`
- Foreign Key Constraints
- Transaction Support für kritische Operationen

---

## 🚢 Deployment

### Docker (Empfohlen)

```bash
# Image bauen
docker build -t nexus-commerce-api .

# Container starten
docker run -p 3000:3000 --env-file .env nexus-commerce-api
```

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

Dies startet:

- API Server (Port 3000)
- MySQL Database (Port 3308)
- Redis (Port 6380)
- Adminer (Port 8081)

### Manuelle Deployment-Checkliste

- [ ] Environment Variables konfiguriert
- [ ] Database Migrations ausgeführt
- [ ] SSL/TLS aktiviert
- [ ] Rate Limits angepasst
- [ ] CORS Whitelist konfiguriert
- [ ] Sentry DSN hinzugefügt
- [ ] Cloudinary Keys hinterlegt
- [ ] Redis verbunden
- [ ] Health-Check funktioniert

---

## 📈 Roadmap

### Phase 1: Core Features ✅

- [x] Benutzer-Management
- [x] Produkt-Management
- [x] Bestellsystem
- [x] Authentifizierung
- [x] Tests & Dokumentation

### Phase 2: Performance & Security ✅

- [x] Redis Caching
- [x] Rate Limiting
- [x] Input Sanitization
- [x] Pagination
- [x] Monitoring (Sentry)

### Phase 3: Advanced Features 🚧

- [ ] Payment Gateway Integration (Stripe/PayPal)
- [ ] Email-Benachrichtigungen (SendGrid)
- [ ] Erweiterte Suche (Elasticsearch)
- [ ] Product Reviews & Ratings
- [ ] Wishlist Funktion

### Phase 4: Scalability 📋

- [ ] Microservices Architecture
- [ ] Message Queue (RabbitMQ)
- [ ] GraphQL API
- [ ] WebSocket für Real-time Updates
- [ ] Kubernetes Deployment

---

## 🤝 Für Unternehmen

### Was ich biete

**Professionelle Entwicklung** mit:

- ✨ Clean Code & Best Practices
- 📖 Umfassende Dokumentation
- 🧪 Automatisierte Tests (>90% Coverage)
- 🔐 Enterprise-Level Security
- 📊 Performance Monitoring
- 🚀 Deployment-Ready Code

### Kontakt

Interessiert an diesem Projekt oder einer individuellen Lösung?

📧 **Email:** m.fouad@gmx.net
💼 **LinkedIn:** [https://www.linkedin.com/in/mazin-fouad-332b36266/](https://linkedin.com)  
🌐 **Portfolio:** [mazinfouad.com](https://yourportfolio.com)

**Verfügbar für:**

- Custom API Development
- Code Reviews
- Technical Consulting
- Team Training
- Feature Extensions

---

## 📄 Lizenz

Dieses Projekt ist unter der [MIT-Lizenz](LICENSE) lizenziert.

---

<div align="center">

**⭐ Star this repository if you find it useful!**

Made with ☕ and 💻 by Mazin Fouad

</div>
