# ⚠️ IMPORTANT: Complete These Steps Before Testing

## 1. Update server/.env File

The server needs the Supabase credentials. Create or update `server/.env`:

```env
PORT=5000
SUPABASE_URL=https://ijephdaxiygduwxtfqeq.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_j8EWaEAhwZqdHsr6831TNQ_ss0g1FST
```

## 2. Execute SQL Migration in Supabase

**CRITICAL**: This must be done before the app will work!

1. Open: https://ijephdaxiygduwxtfqeq.supabase.co
2. Go to: **SQL Editor** (in left sidebar)
3. Click: **New Query**
4. Copy the entire contents of `supabase-migration.sql`
5. Paste and click **Run**
6. Verify success (should see "Success. No rows returned")

## 3. Verify Tables Created

In Supabase Dashboard:
- Go to **Table Editor**
- You should see: `profiles`, `leave_types`, `leave_balances`, `leave_requests`

## 4. Create Admin User

After SQL migration, create admin:

**Option A - Supabase Dashboard:**
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Email: `admin@cetaknow.com`
4. Password: `admin123`
5. Check **Auto Confirm User**
6. Click **Create user**
7. Copy the user ID
8. Go to **SQL Editor** and run:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<paste-user-id-here>';
```

**Option B - Register & Update:**
1. Start the app
2. Register normally with `admin@cetaknow.com`
3. In SQL Editor:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@cetaknow.com');
```

## 5. Start the Application

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm run dev
```

## 6. Test!

Visit: http://localhost:5173

✅ Register a new user  
✅ Login  
✅ Apply for leave  
✅ Login as admin  
✅ Approve/reject requests
