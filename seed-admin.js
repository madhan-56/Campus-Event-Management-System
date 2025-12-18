require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusevents';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const STUDENT_USER = process.env.STUDENT_USER || 'student';
const STUDENT_PASS = process.env.STUDENT_PASS || 'student123';
const STUDENT_EMAIL = process.env.STUDENT_EMAIL || 'student@example.com';

async function createIfMissing(username, email, name, password, role) {
  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`${role} "${username}" exists — skipping.`);
    if (existing.role !== role) { existing.role = role; await existing.save(); console.log(`Updated role for ${username} -> ${role}`); }
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, username, password: hash, role });
  console.log(`Created ${role}: ${username} / ${password}`);
}

async function run() {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    await createIfMissing(ADMIN_USER, ADMIN_EMAIL, 'Administrator', ADMIN_PASS, 'admin');
    await createIfMissing(STUDENT_USER, STUDENT_EMAIL, 'Student', STUDENT_PASS, 'student');
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

run();