# 📊 Nexus Commerce API - Projektdiagramme

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [System-Architektur](#system-architektur)
3. [Datenbank-Struktur](#datenbank-struktur)
4. [API-Flussdiagramme](#api-flussdiagramme)
5. [Authentifizierung](#authentifizierung)
6. [Deployment-Architektur](#deployment-architektur)
7. [Komponenten-Interaktionen](#komponenten-interaktionen)

---

## Übersicht

Dieses Dokument enthält detaillierte Diagramme und Erklärungen zur **Nexus Commerce API**. Jedes Diagramm zeigt einen wichtigen Aspekt des Systems, um das Verständnis der Architektur und des Datenflusses zu erleichtern.

---

## System-Architektur

### Schichtenarchitektur (Layered Architecture)

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App]
        C[API Client/Postman]
    end
    
    subgraph "API Gateway Layer"
        D[Rate Limiter]
        E[CORS Handler]
        F[Helmet Security]
        G[Request Logger]
    end
    
    subgraph "Routing Layer"
        H[/api/v1/users]
        I[/api/v1/products]
        J[/api/v1/orders]
        K[/api/v1/health]
    end
    
    subgraph "Middleware Layer"
        L[Authentication JWT]
        M[Authorization RBAC]
        N[Input Validation]
        O[Error Handler]
    end
    
    subgraph "Controller Layer"
        P[User Controller]
        Q[Product Controller]
        R[Order Controller]
    end
    
    subgraph "Service Layer"
        S[User Service]
        T[Product Service]
        U[Order Service]
    end
    
    subgraph "Data Layer"
        V[(MySQL Database)]
        W[(Redis Cache)]
        X[Cloudinary Storage]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> E
    E --> F
    F --> G
    
    G --> H
    G --> I
    G --> J
    G --> K
    
    H --> L
    I --> L
    J --> L
    
    L --> M
    M --> N
    
    N --> P
    N --> Q
    N --> R
    
    P --> S
    Q --> T
    R --> U
    
    S --> V
    T --> V
    U --> V
    
    T --> W
    T --> X
    
    O -.-> P
    O -.-> Q
    O -.-> R
```

### Erklärung der Schichten

1. **Client Layer**: Verschiedene Clients (Browser, Mobile Apps, API-Tools), die mit der API kommunizieren.

2. **API Gateway Layer**: Erste Verteidigungslinie mit:
   - **Rate Limiter**: Schützt vor DDoS-Angriffen (100 req/15min für API, 5 req/h für Auth)
   - **CORS**: Kontrolliert Cross-Origin-Zugriffe
   - **Helmet**: Setzt Sicherheits-Header
   - **Logger**: Protokolliert alle Anfragen mit Winston

3. **Routing Layer**: Organisiert API-Endpunkte nach Ressourcentypen (Users, Products, Orders).

4. **Middleware Layer**: 
   - **Authentication**: JWT-Token-Validierung
   - **Authorization**: Rollenbasierte Zugriffskontrolle (Customer/Admin)
   - **Validation**: Input-Validierung mit express-validator
   - **Error Handler**: Zentrale Fehlerbehandlung

5. **Controller Layer**: Verarbeitet HTTP-Requests und -Responses.

6. **Service Layer**: Enthält die Geschäftslogik und Datenbank-Transaktionen.

7. **Data Layer**: Persistierung und externe Dienste.

---

## Datenbank-Struktur

### Entity-Relationship-Diagramm (ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "erstellt"
    ORDERS ||--|{ ORDER_ITEMS : "enthält"
    PRODUCTS ||--o{ ORDER_ITEMS : "ist in"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "hat"
    
    USERS {
        int id PK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar password_hash
        enum role
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        int id PK
        varchar name
        text description
        decimal price
        int stock_quantity
        varchar sku UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_IMAGES {
        int id PK
        int product_id FK
        varchar image_url
        varchar public_id
        int display_order
        timestamp created_at
    }
    
    ORDERS {
        int id PK
        int user_id FK
        decimal total_amount
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_purchase
    }
```

### Datenbank-Beziehungen

1. **USERS → ORDERS** (1:N)
   - Ein Benutzer kann mehrere Bestellungen haben
   - Jede Bestellung gehört zu genau einem Benutzer

2. **ORDERS → ORDER_ITEMS** (1:N)
   - Eine Bestellung enthält mindestens ein Bestellelement
   - Jedes Bestellelement gehört zu genau einer Bestellung

3. **PRODUCTS → ORDER_ITEMS** (1:N)
   - Ein Produkt kann in mehreren Bestellungen vorkommen
   - Preis wird zum Bestellzeitpunkt gespeichert (`price_at_purchase`)

4. **PRODUCTS → PRODUCT_IMAGES** (1:N)
   - Ein Produkt kann mehrere Bilder haben (max. 5)
   - Bilder werden in Cloudinary gespeichert

### Wichtige Felder

- **users.role**: `ENUM('customer', 'admin')` - Definiert Berechtigungen
- **users.email**: `UNIQUE` - Jede E-Mail nur einmal
- **products.sku**: `UNIQUE` - Stock Keeping Unit für Inventar
- **products.is_active**: `BOOLEAN` - Produkt sichtbar/unsichtbar
- **orders.status**: `ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')`

---

## API-Flussdiagramme

### Benutzer-Registrierung

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Validator
    participant Controller
    participant Service
    participant DB
    
    Client->>API: POST /api/v1/users
    API->>Validator: Validate Input
    Validator->>Validator: Check Email Format
    Validator->>Validator: Check Password Strength
    
    alt Validation Failed
        Validator-->>Client: 400 Bad Request
    else Validation Passed
        Validator->>Controller: Forward Request
        Controller->>Service: createUser()
        Service->>Service: Hash Password (bcrypt)
        Service->>DB: INSERT User
        
        alt Email Exists
            DB-->>Service: Unique Constraint Error
            Service-->>Client: 409 Conflict
        else Success
            DB-->>Service: User Created
            Service->>Service: Generate JWT
            Service-->>Client: 201 Created + Token
        end
    end
```

### Produkt erstellen (mit Bild-Upload)

```mermaid
sequenceDiagram
    participant Admin
    participant API
    participant Auth
    participant Multer
    participant Cloudinary
    participant Controller
    participant Service
    participant DB
    
    Admin->>API: POST /api/v1/products (multipart/form-data)
    API->>Auth: Verify JWT
    Auth->>Auth: Check Admin Role
    
    alt Not Admin
        Auth-->>Admin: 403 Forbidden
    else Is Admin
        Auth->>Multer: Process Upload
        Multer->>Cloudinary: Upload Images
        Cloudinary-->>Multer: Image URLs + Public IDs
        Multer->>Controller: Forward with URLs
        Controller->>Service: createProduct()
        Service->>DB: BEGIN TRANSACTION
        Service->>DB: INSERT Product
        Service->>DB: INSERT Product Images
        Service->>DB: COMMIT
        DB-->>Service: Success
        Service-->>Admin: 201 Created
    end
```

### Bestellung erstellen

```mermaid
sequenceDiagram
    participant Customer
    participant API
    participant Auth
    participant Controller
    participant Service
    participant DB
    participant Cache
    
    Customer->>API: POST /api/v1/orders
    API->>Auth: Verify JWT
    Auth->>Controller: Authenticated User
    Controller->>Service: createOrder()
    Service->>DB: BEGIN TRANSACTION
    
    Service->>DB: Check Product Stock
    
    alt Insufficient Stock
        DB-->>Service: Stock < Quantity
        Service->>DB: ROLLBACK
        Service-->>Customer: 400 Out of Stock
    else Stock Available
        Service->>DB: Get Current Prices
        Service->>DB: INSERT Order
        Service->>DB: INSERT Order Items
        Service->>DB: UPDATE Product Stock
        Service->>DB: COMMIT
        Service->>Cache: Invalidate Product Cache
        Service-->>Customer: 201 Order Created
    end
```

---

## Authentifizierung

### JWT-Authentifizierung Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Auth Controller
    participant JWT Middleware
    participant Protected Route
    
    Note over User,Protected Route: Login Phase
    User->>API: POST /api/v1/users/login
    API->>Auth Controller: {email, password}
    Auth Controller->>Auth Controller: Verify Password (bcrypt)
    
    alt Invalid Credentials
        Auth Controller-->>User: 401 Unauthorized
    else Valid Credentials
        Auth Controller->>Auth Controller: Generate JWT
        Auth Controller-->>User: {token, user}
    end
    
    Note over User,Protected Route: Access Protected Resource
    User->>API: GET /api/v1/orders (+ JWT in Header)
    API->>JWT Middleware: Verify Token
    JWT Middleware->>JWT Middleware: Decode & Validate
    
    alt Invalid/Expired Token
        JWT Middleware-->>User: 401 Unauthorized
    else Valid Token
        JWT Middleware->>Protected Route: Attach User to Request
        Protected Route->>Protected Route: Process Request
        Protected Route-->>User: 200 OK + Data
    end
```

### Passwort-Hashing

```mermaid
graph LR
    A[Plain Password] --> B[bcrypt.hash]
    B --> C[Salt 10 Rounds]
    C --> D[$2a$10$... Hash]
    D --> E[(Database)]
    
    style A fill:#f9f,stroke:#333
    style D fill:#9f9,stroke:#333
```

### Authorization (RBAC - Role-Based Access Control)

```mermaid
flowchart TD
    A[Request with JWT] --> B{JWT Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Role Check Required?}
    D -->|No| E[Allow Access]
    D -->|Yes| F{User Role?}
    F -->|Customer| G{Customer Allowed?}
    F -->|Admin| H[Allow Access]
    G -->|Yes| E
    G -->|No| I[403 Forbidden]
    
    style C fill:#f66
    style I fill:#f66
    style E fill:#6f6
    style H fill:#6f6
```

---

## Deployment-Architektur

### Docker-Compose Setup

```mermaid
graph TB
    subgraph "Docker Network: nexus-network"
        subgraph "Application Container"
            A[Node.js App :3000]
        end
        
        subgraph "Database Container"
            B[MySQL 8.0 :3308]
        end
        
        subgraph "Cache Container"
            C[Redis 7 :6380]
        end
        
        subgraph "Admin Tools"
            D[Adminer :8081]
        end
        
        subgraph "External Services"
            E[Cloudinary API]
            F[Sentry Monitoring]
        end
    end
    
    subgraph "Host Machine"
        G[.env File]
        H[Volume: mysql_data]
        I[Volume: redis_data]
    end
    
    A --> B
    A --> C
    A -.-> E
    A -.-> F
    D --> B
    
    G --> A
    G --> B
    G --> C
    
    B --> H
    C --> I
    
    style A fill:#4a90e2
    style B fill:#f39c12
    style C fill:#e74c3c
    style D fill:#9b59b6
    style E fill:#1abc9c
    style F fill:#34495e
```

### Production Deployment

```mermaid
graph TB
    subgraph "Internet"
        A[Users]
    end
    
    subgraph "Load Balancer"
        B[Nginx/AWS ELB]
    end
    
    subgraph "Application Tier"
        C1[API Instance 1]
        C2[API Instance 2]
        C3[API Instance 3]
    end
    
    subgraph "Cache Tier"
        D[Redis Cluster]
    end
    
    subgraph "Database Tier"
        E[MySQL Primary]
        F[MySQL Replica 1]
        G[MySQL Replica 2]
    end
    
    subgraph "Storage"
        H[Cloudinary CDN]
    end
    
    subgraph "Monitoring"
        I[Sentry]
        J[Logging Service]
    end
    
    A --> B
    B --> C1
    B --> C2
    B --> C3
    
    C1 --> D
    C2 --> D
    C3 --> D
    
    C1 --> E
    C2 --> E
    C3 --> E
    
    E --> F
    E --> G
    
    C1 -.-> H
    C2 -.-> H
    C3 -.-> H
    
    C1 -.-> I
    C1 -.-> J
```

---

## Komponenten-Interaktionen

### Caching-Strategie

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Cache (Redis)
    participant Service
    participant DB
    
    Note over Client,DB: Read Flow with Cache
    Client->>Controller: GET /api/v1/products
    Controller->>Cache (Redis): Check Cache
    
    alt Cache Hit
        Cache (Redis)-->>Controller: Return Cached Data
        Controller-->>Client: 200 OK + Data
    else Cache Miss
        Cache (Redis)-->>Controller: No Data
        Controller->>Service: getProducts()
        Service->>DB: SELECT Products
        DB-->>Service: Products Data
        Service-->>Controller: Products
        Controller->>Cache (Redis): Store in Cache (1h TTL)
        Controller-->>Client: 200 OK + Data
    end
    
    Note over Client,DB: Write Flow (Cache Invalidation)
    Client->>Controller: POST /api/v1/products
    Controller->>Service: createProduct()
    Service->>DB: INSERT Product
    DB-->>Service: Success
    Service->>Cache (Redis): Invalidate Product Cache
    Service-->>Client: 201 Created
```

### Fehlerbehandlung

```mermaid
flowchart TD
    A[Request] --> B[Route Handler]
    B --> C{Try Block}
    C -->|Success| D[Return Response]
    C -->|Error| E[Catch Block]
    E --> F{Error Type?}
    
    F -->|Validation Error| G[400 Bad Request]
    F -->|Auth Error| H[401 Unauthorized]
    F -->|Permission Error| I[403 Forbidden]
    F -->|Not Found| J[404 Not Found]
    F -->|Conflict| K[409 Conflict]
    F -->|Server Error| L[500 Internal Error]
    
    L --> M[Log to Sentry]
    
    G --> N[Error Middleware]
    H --> N
    I --> N
    J --> N
    K --> N
    L --> N
    
    N --> O[Send Error Response]
    
    style G fill:#ffa500
    style H fill:#ff6347
    style I fill:#ff6347
    style J fill:#ffa500
    style K fill:#ffa500
    style L fill:#dc143c
    style D fill:#32cd32
```

### Request Lifecycle

```mermaid
graph TD
    A[HTTP Request] --> B[Express App]
    B --> C[Rate Limiter]
    C --> D[CORS Handler]
    D --> E[Security Headers]
    E --> F[Body Parser]
    F --> G[Request Logger]
    G --> H{Route Match?}
    
    H -->|No| I[404 Handler]
    H -->|Yes| J[Route Middleware]
    
    J --> K{Auth Required?}
    K -->|Yes| L[JWT Middleware]
    K -->|No| M[Controller]
    L -->|Invalid| N[401 Response]
    L -->|Valid| O{Admin Required?}
    O -->|Yes| P[Admin Middleware]
    O -->|No| M
    P -->|Not Admin| Q[403 Response]
    P -->|Is Admin| M
    
    M --> R[Validation Middleware]
    R -->|Invalid| S[400 Response]
    R -->|Valid| T[Controller Logic]
    T --> U[Service Layer]
    U --> V[Database/Cache]
    V --> W[Response]
    
    T -.->|Error| X[Error Handler]
    U -.->|Error| X
    
    X --> Y[Error Response]
    
    style I fill:#ff6347
    style N fill:#ff6347
    style Q fill:#ff6347
    style S fill:#ffa500
    style W fill:#32cd32
    style Y fill:#dc143c
```

---

## Performance-Optimierungen

### Pagination Flow

```mermaid
graph LR
    A[Client Request<br/>?page=2&limit=20] --> B[Controller]
    B --> C{Cache Check}
    C -->|Hit| D[Return from Cache]
    C -->|Miss| E[Calculate Offset<br/>offset = page-1 * limit]
    E --> F[DB Query<br/>LIMIT 20 OFFSET 20]
    F --> G[Count Total]
    G --> H[Build Response]
    H --> I[Cache Result]
    I --> J[Return Response<br/>items + pagination metadata]
    
    style D fill:#32cd32
    style J fill:#32cd32
```

### Indizierung-Strategie

```mermaid
graph TD
    A[Database Tables] --> B[users]
    A --> C[products]
    A --> D[orders]
    
    B --> E[INDEX: email UNIQUE]
    B --> F[INDEX: role]
    
    C --> G[INDEX: sku UNIQUE]
    C --> H[INDEX: name]
    C --> I[INDEX: is_active]
    C --> J[INDEX: created_at]
    
    D --> K[INDEX: user_id FK]
    D --> L[INDEX: status]
    D --> M[INDEX: created_at]
    
    style E fill:#e74c3c
    style G fill:#e74c3c
```

---

## Sicherheits-Features

### Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        A[Rate Limiting]
        B[CORS Whitelist]
    end
    
    subgraph "Application Security"
        C[Helmet.js Headers]
        D[Input Sanitization]
        E[SQL Injection Prevention]
    end
    
    subgraph "Authentication Security"
        F[JWT Tokens]
        G[Bcrypt Password Hashing]
        H[Token Expiration]
    end
    
    subgraph "Authorization Security"
        I[RBAC Customer/Admin]
        J[Resource Ownership Check]
    end
    
    subgraph "Data Security"
        K[Environment Variables]
        L[No Password in Response]
        M[HTTPS in Production]
    end
    
    style A fill:#e74c3c
    style B fill:#e74c3c
    style C fill:#f39c12
    style D fill:#f39c12
    style E fill:#f39c12
    style F fill:#3498db
    style G fill:#3498db
    style H fill:#3498db
    style I fill:#9b59b6
    style J fill:#9b59b6
    style K fill:#1abc9c
    style L fill:#1abc9c
    style M fill:#1abc9c
```

---

## Testing-Architektur

```mermaid
graph TB
    subgraph "Test Suites"
        A[Unit Tests]
        B[Integration Tests]
        C[E2E Tests]
    end
    
    subgraph "Test Database"
        D[Test MySQL Instance]
        E[Test Redis Instance]
    end
    
    subgraph "Test Tools"
        F[Jest Test Runner]
        G[Supertest HTTP Assertions]
        H[Coverage Report]
    end
    
    A --> F
    B --> F
    C --> F
    
    B --> D
    B --> E
    C --> D
    C --> E
    
    F --> G
    F --> H
    
    style A fill:#3498db
    style B fill:#e67e22
    style C fill:#9b59b6
    style H fill:#27ae60
```

---

## Zusammenfassung

Diese Diagramme zeigen die vollständige Architektur der **Nexus Commerce API**:

### Kernkonzepte

1. **Schichtenarchitektur**: Klare Trennung zwischen Routing, Middleware, Controller, Service und Data Layer
2. **Sicherheit**: Mehrschichtige Sicherheit mit Rate Limiting, JWT, RBAC und Input Validation
3. **Performance**: Redis Caching, Datenbankindizes und Pagination
4. **Skalierbarkeit**: Docker-Container, stateless API, externe Services
5. **Wartbarkeit**: Clean Code, Migrationen, umfassende Tests

### Datenfluss

```
Client → API Gateway → Auth → Validation → Controller → Service → Database
                                                          ↓
                                                     Cache/Storage
```

### Wichtige Dateien

- 📄 `db-diagramm.htm` - Interaktives ER-Diagramm der Datenbank
- 📄 `rest-api-architecture.drawio` - Detaillierte Architektur (Draw.io)
- 📄 `README.md` - Vollständige Projektdokumentation
- 📄 `LERNPLAN.md` - Schritt-für-Schritt Entwicklungsplan

---

**Für weitere Informationen siehe:**
- [README.md](./README.md) - Hauptdokumentation
- [API Dokumentation](http://localhost:3000/api-docs) - Swagger UI (wenn Server läuft)
- [Lernplan](./LERNPLAN.md) - Entwicklungsschritte

---

*Erstellt für das Nexus Commerce API Projekt*
*Letzte Aktualisierung: Januar 2026*
