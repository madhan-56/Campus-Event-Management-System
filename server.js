const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// import models & routes
const User = require('./models/User');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const bcrypt = require('bcrypt');

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);

// serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusevents';
console.log('Connecting to DB:', MONGODB_URI);

// ensure a single admin exists (uses env vars ADMIN_USER/ADMIN_PASS/ADMIN_EMAIL)
async function ensureAdmin() {
  try {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin already exists:', existing.username);
      return;
    }

    const hash = await bcrypt.hash(adminPass, 10);
    const u = new User({ name: 'Administrator', email: adminEmail, username: adminUser, password: hash, role: 'admin' });
    await u.save();
    console.log('Created admin account:', adminUser);
  } catch (err) {
    console.error('Failed to ensure admin user:', err);
  }
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await ensureAdmin();
    app.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => {
    console.error('DB connection error', err);
    process.exit(1);
  });