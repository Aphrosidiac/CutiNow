# CutiNow - Supabase Migration Guide

## ✅ Migration Completed

CutiNow has been successfully migrated from PostgreSQL + JWT to Supabase!

## 🚀 Quick Start

### 1. Setup Supabase Database

**IMPORTANT**: Execute the SQL migration script in your Supabase dashboard first.

1. Go to your Supabase project: https://ijephdaxiygduwxtfqeq.supabase.co
2. Navigate to **SQL Editor**
3. Open and execute `supabase-migration.sql` (located in project root)
4. Verify all tables are created successfully

### 2. Update Server Environment Variables

The `.env` file in the `server` folder should contain:

```env
PORT=5000
SUPABASE_URL=https://ijephdaxiygduwxtfqeq.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_j8EWaEAhwZqdHsr6831TNQ_ss0g1FST
```

### 3. Install Dependencies & Run

```bash
# From project root
cd server
powershell -ExecutionPolicy Bypass -Command "npm install"
npm start

# In a new terminal
cd client
powershell -ExecutionPolicy Bypass -Command "npm install"
npm run dev
```

### 4. Create Admin User

After the migration, you need to create an admin user:

**Option A: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Email: `admin@cetaknow.com`
4. Password: `admin123`
5. Auto Confirm: **Yes**

Then update the role:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-id-from-auth>';
```

**Option B: Via Registration**
1. Visit http://localhost:5173
2. Register with email `admin@cetaknow.com`
3. Update role via SQL:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@cetaknow.com'
);
```

---

## 📋 What Changed

### Backend
- ✅ Removed: `bcryptjs`, `jsonwebtoken`, `sequelize`, `pg`, `pg-hstore`
- ✅ Added: `@supabase/supabase-js`
- ✅ Replaced all Sequelize models with Supabase queries
- ✅ Authentication now uses Supabase Auth
- ✅ Database operations use Supabase client

### Frontend
- ✅ Added: `@supabase/supabase-js`
- ✅ AuthContext now manages Supabase sessions
- ✅ Login/Register use Supabase Auth methods
- ✅ API interceptor uses Supabase session tokens

### Database
- ✅ Tables created in Supabase PostgreSQL
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic profile creation on registration
- ✅ Automatic leave balance initialization

---

## 🗃️ Database Schema

### Tables
1. **profiles** - User profile data (extends auth.users)
2. **leave_types** - Types of leave (Annual, Sick, etc.)
3. **leave_balances** - Leave balance per user per type
4. **leave_requests** - Leave applications

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only see their own data
- Admins can see and modify all data

---

## 🔑 Authentication Flow

1. **Register**: Creates user in `auth.users` and profile in `profiles` table
2. **Login**: Returns Supabase session token
3. **API Calls**: Include session token in Authorization header
4. **Backend**: Verifies token with Supabase and fetches user profile

---

## 📝 Important Notes

- Email confirmation is disabled for development
- File uploads still use local filesystem (can migrate to Supabase Storage later)
- All old PostgreSQL data is NOT automatically migrated
- Users need to re-register

---

## 🧪 Testing Checklist

- [ ] User registration works
- [ ] User login successful
- [ ] Dashboard displays user data
- [ ] Apply for leave works
- [ ] Leave balances update correctly
- [ ] Admin can view all requests
- [ ] Admin can approve/reject requests
- [ ] Session persists on page refresh
- [ ] Logout works correctly

---

## 🆘 Troubleshooting

### "Invalid token" errors
- Ensure `SUPABASE_SERVICE_KEY` is set in server/.env
- Check that migration SQL was executed successfully

### "Profile not found" errors
- Verify the trigger `on_auth_user_created` executed
- Manually check if profile exists in profiles table

### npm script errors
- Use: `powershell -ExecutionPolicy Bypass -Command "npm install"`
- Or enable scripts: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 🎉 You're Ready!

Visit http://localhost:5173 and start using CutiNow with Supabase!
