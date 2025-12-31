# UniEats Backend: Core Domain & API

The UniEats backend is a robust **Java 21 / Spring Boot 3.4** application responsible for the core business logic, persistence, and security of the university dining system. It provides a RESTful API to manage a complex ecosystem of stock-dependent products and dynamic promotions.

## 🏗 Architectural Overview

The project follows a layered architecture to ensure separation of concerns:

* **Web Layer:** REST Controllers handling HTTP requests, DTO mapping, and OpenAPI documentation.
* **Service Layer:** Business logic orchestration, including promotion evaluation and stock validation.
* **Data Layer:** Spring Data JPA with a PostgreSQL database.
* **Security Layer:** Stateless JWT-based authentication and Role-Based Access Control (RBAC).

---

## 🛠 Technical Deep Dive

### 1. Advanced Promotion Engine

The system implements a flexible promotion engine using **JPA Inheritance (Table-per-class)**. This allows the system to evaluate different discount strategies during the order creation process:

* **BuyXPayY:** Logic-based quantity discounts (e.g., 3x2).
* **Threshold Discounts:** Global order reductions applied when a subtotal is reached.
* **Trigger-based Gifts:** Automatically adding free items based on specific "trigger" products in the cart.
* **Temporal Logic:** Promotions include `dayOfWeek` constraints to limit validity to specific university schedules.

### 2. Inventory-Driven Catalog

Unlike simple e-commerce apps, UniEats products are **composite entities**:

* **Stock Tracking:** Ingredients have real-time stock levels.
* **Recursive Availability:** A `Product` is only "Available" if all its `ProductIngredients` have sufficient stock. A `Combo` is only "Available" if all its constituent `Products` are available.

### 3. Security Implementation

* **Stateless Auth:** Uses JWT (JSON Web Tokens) issued upon login.
* **RBAC:** Strict method-level security using `@PreAuthorize`.
* `ADMIN`: Catalog management, user permissions, and global stats.
* `STAFF`: Order lifecycle management (Preparation -> Delivery) and stock updates.
* `USER`: Personal order history and menu browsing.


* **Encryption:** Sensitive data and passwords handled via `BCrypt`.

---

## 🚀 Getting Started

### Prerequisites

* Java 21 JDK
* Maven 3.x
* Docker (for database and local environment)

### Compilation & Packaging

To build the executable JAR:

```bash
# Packages the app into target/uni-eats-backend-0.0.1-SNAPSHOT.jar
mvn package -DskipTests

```

### Execution

1. **Database:** Start the PostgreSQL container:
```bash
docker-compose up -d db

```

2. **Run Application:**
```bash
java -jar target/uni-eats-backend-0.0.1-SNAPSHOT.jar

```

### API Documentation (OpenAPI/Swagger)

Once running, explore the interactive API docs:

* **Local Dev:** `http://localhost:8080/swagger-ui/index.html`
* **Production Ingress:** `https://[your-domain]/api/swagger-ui/index.html`

---

## 🧪 Quality Assurance

### Testing Strategy

* **Unit Tests:** Testing core domain logic (Promotions, Stock calculation).
* **Integration Tests:** Verifying Repository layers and Database constraints.
* **Command:** 
```bash
mvn verify
```

## 📚 Reference & Standards

### Implementation Details

* **Context Path:** All endpoints are prefixed with `/api` via `server.servlet.context-path`.
* **Maven Parent Overrides:** To maintain clean metadata, the project POM contains empty overrides for `<license>` and `<developers>` inherited from the Spring Boot parent.

### Spring Modules Used

* **Spring Web:** For building the RESTful interface.
* **Spring Security:** For JWT and RBAC.
* **Spring Data JPA:** For ORM and PostgreSQL integration.
* **Validation:** For ensuring data integrity in RequestBodies.

---

### Key Technical Improvements:

1. **Domain Highlights:** Specifically mentioned the JPA Inheritance for promotions, which is a key technical detail of your project.
2. **Availability Logic:** Explained how products relate to ingredients, showing a deeper level of system design.
3. **Deployment Clarity:** Clarified the `/api` context path which is critical for the Ingress setup.
4. **Java Version:** Specified Java 21/Spring Boot 3.4 (as seen in your snippets) to keep it modern and accurate.
