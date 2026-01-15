const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leaves');
const leaveTypeRoutes = require('./routes/leaveTypes');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/users', userRoutes);

// Production: Serve React App
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // Test Route for dev
  app.get('/', (req, res) => {
    res.send('CutiNow API is running. In production, this serves the React app.');
  });
}

// Start Server (No database connection check needed - Supabase handles this)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using Supabase for database and authentication');
});
