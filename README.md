# Containerized Inventory & Order Management System

A production-ready, full-stack Inventory & Order Management System. Built using **Clean Architecture** and the **Repository Pattern** on the backend, and a modern, high-end **React (Vite) + Zustand + Framer Motion** single-page application on the frontend. The entire application is fully containerized using **Docker** and **Docker Compose**.

---

## Key Features

1. **Dashboard Analytics**: Exposes key metrics (total products, total customers, total orders, low stock warnings), daily order trend charts using `Recharts`, and critical restock listings with direct restock actions.
2. **Product Catalog**: Full CRUD catalog tracking Name, unique SKU codes, Unit Price, and Stock Quantities.
3. **Customer Database**: Full customer management enabling registry and tracking of transaction histories.
4. **Order Management (Transactions)**: Multi-item order placement. Implements transaction checks ensuring orders cannot exceed current stock levels, and automatically adjusts product inventories.
5. **Advanced File Handling**: Embedded client-side CSV Import and Export capabilities for both Products and Customers with complete formatting validation.
6. **Dark Space Aesthetics**: A sleek glassmorphic UI styled with custom CSS variables, layout transitions, and micro-animations.

---

## Tech Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Backend** | Python 3.12, FastAPI | Asynchronous performance, automatic OpenAPI (Swagger) docs, type safety |
| **ORM** | SQLAlchemy 2.0 (Async) | Async DB transactions, repository decoupling |
| **Database** | PostgreSQL 15 | Relational persistence, transactional atomicity |
| **Frontend** | React 18, React Router v6 | Single-Page Application navigation, modular component structures |
| **State** | Zustand | Global toast notifications without Context re-renders |
| **Animations** | Framer Motion | Fluid layouts, staggered fade-in animations |
| **Charting** | Recharts | Interactive area graphs showing order trend data |
| **Styling** | Vanilla CSS Variables | Premium look, zero-dependency style control |
| **Containerization** | Docker, Docker Compose | Instant multi-container workspace orchestration |

---

## Clean Architecture & Design Patterns

### Backend Structure
The backend follows **Clean Architecture** rules to decouple business rules from external inputs/database structures:
- **Entities (Models)**: Domain objects describing the database schema (`Product`, `Customer`, `Order`, `OrderItem`).
- **Repositories (Data Access)**: Abstraction layer wrapping SQLAlchemy operations. Exposes CRUD tasks through a generic `BaseRepository` extended by concrete repositories.
- **Services (Business Logic)**: Intermediaries managing transactions and core domain constraints (e.g., verifying stock availability and modifying stock atomically when placing orders).
- **Interface Adapters (API)**: FastAPI routers handling REST request formats and transforming inputs into Pydantic DTOs.

### SOLID & DRY Applications
- **Single Responsibility (S)**: Separate repositories, services, and endpoints are dedicated solely to their respective domains (Products, Customers, Orders, Dashboard).
- **Dependency Inversion (D)**: Core services rely on database session/engine abstractions, not hardcoded connections.
- **DRY (Don't Repeat Yourself)**: Formatter utilities, API axios clients, custom hooks, and generic datatable layouts are reused across all components.

---

## Quick Start (with Docker Compose)

Make sure you have [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/) installed on your machine.

1. **Clone & Open Workspace**:
   ```bash
   cd Assesment
   ```

2. **Spin up Container Services**:
   ```bash
   docker compose up --build
   ```
   This will spin up three containers:
   - **inventory_db** (PostgreSQL on port `5432` - internal)
   - **inventory_backend** (FastAPI API on port `8000`)
   - **inventory_frontend** (Vite + Nginx web application on port `80`)

3. **Access the Application**:
   - Open your browser and navigate to: **[http://localhost](http://localhost)**
   - To interact with the backend API directly via the interactive Swagger documentation, visit: **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## Local Development (without Docker)

If you wish to run the backend and frontend services separately on your host system:

### 1. Database Setup
Ensure you have a PostgreSQL server running locally, create a database named `inventory_db` and configure your credentials.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your DB url:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@localhost:5432/inventory_db
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL in your browser (usually `http://localhost:5173`).

---

## Advanced CSV Guidelines

### Catalog Imports
To batch-upload products or customers:
1. Navigate to the respective database section (Products or Customers).
2. Click **Import CSV** and select your file.
3. The format requirements are:
   - **Products CSV**: Must include headers `Name`, `SKU`, `Price`, and `Quantity`.
   - **Customers CSV**: Must include headers `Full Name`, `Email`, and `Phone`.
4. Any errors (like duplicate SKUs or email collisions) will be reported safely via notifications while valid rows are created.
