# UniEats Frontend: Technical Architecture

The UniEats frontend is a high-performance Single Page Application (SPA) built with **React**, **TypeScript**, and **Vite**. It is designed to be a thin, reactive client that consumes the Spring Boot REST API.

## 🏗 Architectural Patterns

### 1. Server State & Data Synchronization

Instead of using complex global state (like Redux) for everything, we use **TanStack Query (React Query)**.

* **Declarative Fetching:** All backend data is fetched using custom hooks, ensuring that data is cached and synchronized automatically.
* **Optimistic Updates:** For actions like adding items to the cart or updating stock, we leverage cache invalidation to provide a snappy user experience.
* **Error Boundaries:** Centralized handling of API errors and "service unavailable" states.

### 2. Context-Based Global State

For client-specific state that doesn't live on the server, we use the **React Context API**:

* **CartContext:** Manages the temporary state of orders, including product selection, quantity adjustments, and real-time promotion previews.
* **AuthContext:** Stores the JWT (JSON Web Token) and user role (Admin/Staff/User), driving the conditional rendering of the UI.

### 3. Styling Strategy: CSS Modules

To avoid global namespace collisions and ensure component encapsulation, we use **CSS Modules** (`*.module.css`).

* **Theming:** Variables are defined in a central `variables.css` for consistent spacing, university branding colors, and typography.
* **Responsive Design:** A mobile-first approach is implemented to ensure students can order easily from their phones in the cafeteria.

---

## 🛠 Directory Structure & Design System

* **`/src/components`**: Presentational, reusable UI atoms (Buttons, Inputs, Cards).
* **`/src/hooks`**: Custom React Query wrappers for API interaction (e.g., `useProducts`, `useOrders`).
* **`/src/pages`**: Main route views (Home, Menu, Dashboard, Checkout).
* **`/src/services`**: Axios-based API client configuration and interceptors for JWT injection.

---

## 🚦 Navigation & Routing

We use **Wouter** for minimal, hook-based routing.

* **Protected Routes:** Higher-Order Components (HOCs) verify user roles before granting access to `/admin` or `/kitchen` dashboards.
* **Zero-Config SPA:** The routing is designed to work seamlessly behind the Nginx Ingress gateway.

---

## 🧪 Testing & Quality Assurance

The project maintains high reliability through a tiered testing strategy:

* **Unit Testing (Vitest):** Used for pure functions, such as promotion price calculations and inventory logic.
* **Component Testing (React Testing Library):** Focuses on user behavior (e.g., "does clicking 'Add to Cart' update the icon?") rather than implementation details.
* **Environment Mocking:** We use `WindowEnv.ts` to manage environment variables safely across development and Docker production environments.

---

## 🚀 Development Workflow

### Environment Configuration

The frontend requires two distinct configurations:

1. **Local Dev:** Configure `.env` to point to `http://localhost:20500/api`.
2. **Production (Docker):** The `BACKEND_EXTERNAL_URL` is injected at runtime via the `WindowEnv` pattern to allow the same build to work in different environments.

### Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles TS/JSX into optimized static assets for Nginx. |
| `npm test` | Runs the test suite in watch mode. |
| `npm run lint` | Enforces project code style and best practices. |

---

### Key Technical Improvements Added:

1. **Role-Based Access Control (RBAC):** Mentions how the UI adapts to different users.
2. **Context API vs. React Query:** Explains why you chose specific tools for specific state types.
3. **Deployment Awareness:** Explains the `WindowEnv.ts` logic, which is a common pain point in Dockerized SPAs.
4. **Styling Encapsulation:** Highlights the use of CSS Modules for maintainability.
