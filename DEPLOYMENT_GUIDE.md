# Production Deployment Guide

## 1. Production Environment Variables (`.env`)

Create a `.env` file on your server (in the root of your project folder) with the following content.

**Important:**
- Replace `YOUR_STRONG_PASSWORD` with a secure password.
- Replace `YOUR_GENERATED_SECRET_KEY` with a random string (run `openssl rand -base64 32` on your server to generate one).
- Update the URLs to match your actual domain.

```env
# Database Connection (PostgreSQL)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://company_user:YOUR_STRONG_PASSWORD@localhost:5432/company_table?schema=public"

# Next.js Server App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Authentication / Security
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET_KEY"
NEXTAUTH_URL="https://your-domain.com"
```

---

## 2. PostgreSQL Installation (Step-by-Step on Ubuntu/Debian)

These commands should be run on your Linux server via an SSH terminal.

### Step 1: Install PostgreSQL
Update package list and install postgresql.
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

### Step 2: Start & Enable Service
Ensure PostgreSQL starts automatically on reboot.
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 3: Configure Database & User

1.  **Switch to the postgres user:**
    ```bash
    sudo -i -u postgres
    psql
    ```

2.  **Create a dedicated user and database:**
    (Copy and paste these commands into the `postgres=#` prompt. Remember to change the password!)

    ```sql
    -- Create a dedicated user
    CREATE USER company_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';

    -- Create the database
    CREATE DATABASE company_table;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE company_table TO company_user;

    -- Connect to the new database to grant schema permissions
    \c company_table

    -- Grant schema public access (required for Prisma)
    GRANT ALL ON SCHEMA public TO company_user;
    ```

3.  **Exit:**
    Type `\q` to exit the SQL prompt, then `exit` to logout the postgres user.
    ```bash
    \q
    exit
    ```

---

## 3. Final Deployment Steps

After your `.env` is set and Database is ready:

1.  **Push Database Schema:**
    Run this command from your project folder on the server to create the tables.
    ```bash
    npx prisma db push
    ```

2.  **Seed Database (Optional):**
    If you have a seed script for initial data.
    ```bash
    npx prisma db seed
    ```

3.  **Build the Application:**
    ```bash
    npm run build
    ```

4.  **Start the Server:**
    Usage of a process manager like PM2 is recommended.
    ```bash
    npm install -g pm2
    pm2 startnpm --name "company-table" -- start
    pm2 save
    ```
