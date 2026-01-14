# Database & Backend Architecture Design

## Recommendation: PostgreSQL 🐘

For your requirements, **PostgreSQL** is the best choice over MongoDB.

### Why Postgres?
1.  **Multi-Tenancy & Security**: You need strict relationships between **Companies**, **Users**, and **Roles**. Relational databases (SQL) enforce these constraints natively, ensuring a user from "Company A" never accidentally sees "Company B's" data.
2.  **Hybrid Power (JSONB)**: Postgres has excellent support for JSON data (`JSONB`). This allows us to have the **strict structure** for authentication and permissions, while keeping the **flexible/dynamic structure** needed for the user-defined tables (rows/cells) in the same database.
3.  **Complex Queries**: For the "Dynamic Dashboard," you will likely need to aggregate data (sums, counts, averages). SQL is significantly more powerful and standard for this than Mongo's aggregation framework.

---

## Schema Design

### 1. Core / Multi-Tenancy (Strict Relational)

These tables manage access and structure.

**`companies`** (Tenants)
-   `id`: UUID (Primary Key)
-   `name`: Text
-   `plan`: Text (Free, Pro, Enterprise)
-   `settings`: JSONB (Custom branding, etc.)
-   `created_at`: Timestamp

**`users`**
-   `id`: UUID (Primary Key)
-   `email`: Text (Unique)
-   `password_hash`: Text
-   `company_id`: UUID (Foreign Key -> companies.id)
-   `role`: Enum ('SUPER_ADMIN', 'COMPANY_ADMIN', 'EDITOR', 'VIEWER')
-   `created_at`: Timestamp

### 2. Dynamic Data (Hybrid / JSONB)

This is where the user's "Excel-like" data lives. Since users define their own columns, we use a flexible schema.

**`sheets`**
-   `id`: UUID
-   `company_id`: UUID (FK)
-   `name`: Text
-   `order`: Integer

**`tables`** (A sheet can have multiple tables, or 1-to-1)
-   `id`: UUID
-   `sheet_id`: UUID (FK)
-   `name`: Text
-   `columns`: JSONB
    -   *Why JSONB?* Easier to store the array of column definitions (`{ id, type, name, options }`) together and strictly order them.
    -   *Example*: `[{ "id": "col_1", "type": "text", "name": "Task" }, { "id": "col_2", "type": "date", "name": "Due Date" }]`

**`rows`**
-   `id`: UUID
-   `table_id`: UUID (FK)
-   `data`: JSONB
    -   *Crucial Design*: We store the cell values as a JSON object.
    -   *Example*: `{ "col_1": "Fix Bug", "col_2": "2024-01-20" }`
-   `created_by`: UUID (FK -> users.id)
-   `updated_at`: Timestamp

### 3. Notifications & Dashboard

**`notifications`**
-   `id`: UUID
-   `user_id`: UUID (FK)
-   `type`: Enum ('DUE_DATE', 'MENTION', 'SYSTEM')
-   `message`: Text
-   `is_read`: Boolean
-   `metadata`: JSONB (Link to specific row/table)

**`dashboards`**
-   `id`: UUID
-   `company_id`: UUID (FK)
-   `layout`: JSONB (Grid positions of widgets)
-   `widgets`: JSONB (Definitions of charts: "Sum of Price in Table X")

---

## Technical Stack Recommendation

1.  **Database**: PostgreSQL (managed via Supabase, Neon, or Railway for ease of use).
2.  **ORM (Object Relational Mapper)**: **Prisma** or **Drizzle ORM**.
    *   *Recommendation*: **Prisma** is very easy to start with and handles types beautifully with Next.js.
3.  **Authentication**: **NextAuth.js (Auth.js)** v5.
    *   Seamlessly integrates with the User/Role schema.
    *   Handles session management securely.

## Implementation Steps (Phase 2)

1.  **Setup Postgres**: Initialize a database (Docker local or Cloud).
2.  **Setup Prisma**: Define `schema.prisma` with the models above.
3.  **Authentication**: Implement Login/Register with NextAuth + Roles.
4.  **API Migration**:
    *   Convert current "Local State" logic in `ExcelTable` to fetch/save to the API.
    *   Create API routes: `GET /api/tables`, `POST /api/rows`, `PATCH /api/rows/:id`.
5.  **Notification Worker**: A background job (using polling or Cron) that queries `rows` where `data->>'due_date'` is near.

---

## Why this solves your problems:

*   **Super Admin**: Can query `companies` table directly.
*   **Isolation**: Every query will have `WHERE company_id = session.user.companyId`. This is foolproof.
*   **Dynamic**: Adding a column doesn't require a database migration (ALTER TABLE). You just update the `columns` JSONB in the `tables` row.
*   **Permissions**: Middleware checks `user.role` before allowing `POST`/`PATCH` requests.
