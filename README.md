# CutiNow - Leave Management System

A full-stack leave management application for CetakNow.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, TypeScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Sequelize ORM)

## Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- Git

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CutiNow
```

### 2. Setup Backend (Server)
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` folder with your database credentials:
   ```env
   PORT=5000
   DB_NAME=cutinow
   DB_USER=postgres
   DB_PASS=your_password
   DB_HOST=127.0.0.1
   DB_DIALECT=postgres
   JWT_SECRET=supersecretkey123
   ```
4. Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE cutinow;
   ```
   *(You can use pgAdmin or psql)*

5. Seed the database (Create tables and admin user):
   **Important:** You must be inside the `server` folder.
   ```bash
   node seed.js
   ```
   *This will create an Admin user: `admin@cetaknow.com` / `admin123`*

6. Start the server:
   ```bash
   npm run dev
   ```
   *(Server runs on port 5000)*

### 3. Setup Frontend (Client)
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
   *(Frontend runs on port 5173)*

## Running the App
- Access the website at `http://localhost:5173`
- Login with the Admin credentials created during seeding, or register a new employee account.

## API Proxy
The frontend is configured to proxy requests to `http://localhost:5000`. If you change the backend port, update `client/vite.config.ts`.
