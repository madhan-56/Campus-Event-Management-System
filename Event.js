const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  phoneNumber: String,
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: Date,
  location: String,
  description: String,
  participants: [participantSchema]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
