# UniEats: University Dining & Cafeteria Management System

UniEats is an end-to-end digital solution designed to streamline cafeteria operations at a university level. It bridges the gap between students, kitchen staff, and administrators by providing a centralized platform for order management, stock control, and promotion application.

## Core Product Features

### 1. Digital Menu & Ordering

* **Dynamic Catalog:** Students can browse a structured menu divided into custom sections (e.g., Breakfast, Lunch Specials).
* **Combos & Customization:** Supports both individual products and pre-defined combos (e.g., Main + Drink).
* **Real-time Availability:** Items are automatically marked as "out of stock" if their underlying ingredients are depleted.

### 2. Intelligent Promotion Engine

A robust back-end system that applies business logic to orders based on active campaigns:

* **Buy X, Pay Y:** Classical multi-buy discounts.
* **Threshold Discounts:** Reductions applied once a minimum purchase amount is reached.
* **Gifts & Triggers:** Automated free items added when specific "trigger" products are purchased.
* **Scheduled Validity:** Promotions can be restricted to specific days of the week.

### 3. Kitchen & Stock Management

* **Ingredient Tracking:** Products are linked to specific ingredients with quantity requirements.
* **Automated Inventory:** Stock is deducted automatically upon order confirmation.
* **Order Workflow:** Kitchen staff can track orders through lifecycle states: *Confirmed* → *In Preparation* → *Ready for Pickup* → *Complete*.

### 4. Admin Dashboard

* **Role Management:** Capability to assign roles (Admin, Staff, User) to university members.
* **Global Configuration:** Interface to manage the entire catalog, including ingredients, tags, and menu layout.

---

## Getting Started

### Architecture

The system follows a modern decoupled architecture:

* **Backend (Java/Spring Boot):** Handles domain logic, persistence via JPA/PostgreSQL, and secures endpoints using JWT-based authentication.
* **Frontend (React/Vite):** A responsive TypeScript-based SPA featuring a modern cart system and specialized dashboards for different user roles.
* **Infrastructure (Docker):** Fully containerized deployment with an Nginx Ingress to manage traffic routing.

### Port Configuration

* **Main Website:** [http://localhost:20500](https://www.google.com/search?q=http://localhost:20500)
* **API Gateway:** `http://localhost:20500/api/`
* **Database:** Port `20501` (PostgreSQL)

---

## Running the Project

1. **Environment Setup:** Review the `.env` file for database credentials and external URLs.
2. **Launch:**
```bash
docker compose up -d --build --remove-orphans
```
---

## Technical Details

### 1. Domain Data Model

Explain the relationship between the core entities. The system manages a hierarchy of food items and their availability based on stock:

* **Ingredients & Stock:** The foundation of the catalog. Each ingredient (e.g., "Tomato", "Cheese") has a `stock` count.
* **Products:** Composed of multiple `ProductIngredient` entries with specific quantities. A product’s availability is a derived state: `isAvailable()` returns true only if all required ingredients have stock .
* **Combos:** Bundles of multiple products. Similar to products, a combo's availability depends on the availability of every product within it.
* **Menu Sections:** Logical groupings (e.g., "Breakfast", "Offers") that can contain both individual products and combos.

### 2. Promotion Engine Logic

The backend implements an extensible promotion system using a **Table-per-class Inheritance strategy** in JPA. You can detail the specific types of business logic applied during order creation:

* **BuyXPayYPromotion:** Calculates group discounts (e.g., 2x1). It determines the number of "free units" by dividing the item quantity by the `buyQuantity`.
* **PercentageDiscountPromotion:** Applies a decimal-based reduction to specific products or combos within an order.
* **ThresholdDiscountPromotion:** A global order promotion that triggers once the `totalPrice` exceeds a specified `threshold`.
* **BuyGiveFreePromotion:** A "trigger" system where purchasing a specific item automatically grants a free product/combo. It supports a `oneFreePerTrigger` toggle to control scalability.

### 3. Security & Authentication

Detail the stateless security architecture implemented with **Spring Security** and **JWT**:

* **JWT Workflow:** The `JwtAuthFilter` intercepts requests to extract and verify the `Bearer` token from the `Authorization` header.
* **Role-Based Access Control (RBAC):** Users are assigned roles (e.g., `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`) which govern endpoint access:
* **Admin:** Full access to catalog management (Ingredients, Products, Promotions).
* **Staff/Kitchen:** Access to order lifecycle management (`/orders/**`) and stock updates.
* **User:** Can browse the menu and manage their own orders.


* **Password Security:** Passwords are encrypted using `BCryptPasswordEncoder`.

### 4. Technical Stack & Patterns

* **Frontend (React/Vite):** Uses a **Provider Pattern** for global state management. For example, the `CartProvider` centralizes the logic for calculating totals, applying client-side promotion previews, and persisting cart data to `localStorage`.
* **Backend (Spring Boot):** Follows a strict **Controller-Service-Repository** pattern. It uses **DTOs (Data Transfer Objects)** and records (e.g., `OrderCreateDTO`, `ProductDTO`) to decouple the internal database entities from the external API representation.
* **Persistence:** Uses **PostgreSQL** with Hibernate/JPA. Complex stock checks are optimized via custom `@Query` definitions in the repositories (e.g., finding all available combos in a single database round-trip).

### 5. API Documentation

Mention that the project includes built-in API documentation via **Swagger/OpenAPI**. Once the system is running, developers can explore and test the endpoints at:

* `http://localhost:20500/api/swagger-ui/index.html`


3. **Logs:** Access real-time container logs via Dozzle at [http://localhost:20500/logs](https://www.google.com/search?q=http://localhost:20500/logs).
