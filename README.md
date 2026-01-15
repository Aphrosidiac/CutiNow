# CutiNow - Leave Management System

A full-stack leave management application built with **React**, **Node.js**, and **Supabase**.

## 🚀 Tech Stack
- **Frontend:** React 18 (Vite), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth

## ✨ Features
- User authentication (register/login)
- Employee leave application system
- Leave balance tracking
- Admin dashboard for leave approval/rejection
- Multiple leave types (Annual, Sick, Hospitalization, Emergency)
- Real-time updates with Supabase

## 📋 Prerequisites
- Node.js (v18+)
- Supabase account ([sign up free](https://supabase.com))
- Git

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CutiNow
```

### 2. Setup Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **API Keys** from Project Settings → API

#### Execute Database Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-migration.sql`
3. Paste and execute the script
4. Execute `fix-trigger.sql` to fix trigger permissions
5. Execute `fix-rls-policies.sql` to fix RLS policies
6. Verify tables are created in **Table Editor**

### 3. Configure Environment Variables

#### Server (.env)
Create `server/.env` with your Supabase credentials:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 4. Install Dependencies
```bash
# Install all dependencies
npm run install-all

# Or manually:
cd server && npm install
cd ../client && npm install
```

### 5. Create Admin User

After database setup, create an admin user:

**Option A - SQL Query:**
```sql
-- First register normally through the app, then run:
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

**Option B - Supabase Dashboard:**
1. Go to **Authentication** → **Users** → **Add user**
2. Email: `admin@cetaknow.com`, Password: `admin123`
3. Check "Auto Confirm User"
4. Then update role via SQL query above

### 6. Run the Application

```bash
# From project root
npm start
```

This starts both:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:5173

---

## 📱 Usage

### Employee Features
- Register and login
- View leave balances
- Apply for leave
- Track leave request status
- View leave history

### Admin Features
- View all leave requests
- Approve/reject leave applications
- Manage users
- Track all employee leave balances

### Default Credentials
After creating admin user:
- **Email:** admin@cetaknow.com
- **Password:** admin123

---

## 🗃️ Database Schema

### Tables
- `profiles` - User profile data (extends Supabase Auth users)
- `leave_types` - Leave type configurations
- `leave_balances` - Employee leave balances
- `leave_requests` - Leave applications

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have full access to all data

---

## 📝 Scripts

```bash
# Development
npm start              # Start both client and server
npm run server         # Start backend only
npm run client         # Start frontend only

# Installation
npm run install-all    # Install all dependencies
```

---

## 🔧 Troubleshooting

### PowerShell Execution Policy Error
If you get execution policy errors on Windows:
```bash
powershell -ExecutionPolicy Bypass -Command "npm install"
```

### "Database error saving new user"
Execute `fix-trigger.sql` in Supabase SQL Editor to fix trigger permissions.

### "Infinite recursion detected in policy"
Execute `fix-rls-policies.sql` in Supabase SQL Editor to fix RLS policies.

### Port Already in Use
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📚 Project Structure

```
CutiNow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   └── api.ts         # API configuration
│   └── package.json
├── server/                 # Express backend
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── config/            # Supabase config
│   └── package.json
├── supabase-migration.sql # Database schema
├── fix-trigger.sql        # Trigger permissions fix
└── fix-rls-policies.sql   # RLS policies fix
```

---

## 🎯 Migration from PostgreSQL

This project has been **migrated from local PostgreSQL to Supabase**. 

If you need the migration guide, see `SUPABASE_MIGRATION.md`.

---

## 📄 License

ISC

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 💡 Support

For issues or questions, please open an issue on GitHub.
