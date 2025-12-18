const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// list events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get single event
router.get('/:id', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // return participants ordered newest-first (by createdAt when present)
    ev.participants = ev.participants.slice().sort((a,b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// create event (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const ev = new Event(req.body);
    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// register participant
router.post('/:id/register', async (req, res) => {
  try {
    const { name, rollNumber, phoneNumber, paymentStatus } = req.body;
    if (!name || !rollNumber || !phoneNumber) return res.status(400).json({ message: 'Missing fields' });
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    if (ev.participants.some(p => p.rollNumber === rollNumber)) return res.status(409).json({ message: 'Roll number already registered' });
    ev.participants.push({ name, rollNumber, phoneNumber, paymentStatus: paymentStatus || 'Pending' });
    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// update participant (admin only)
router.put('/:id/participant/:pid', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { paymentStatus, name, phoneNumber, rollNumber } = req.body;
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    const p = ev.participants.id(req.params.pid);
    if (!p) return res.status(404).json({ message: 'Participant not found' });

    if (paymentStatus) p.paymentStatus = paymentStatus;
    if (name) p.name = name;
    if (phoneNumber) p.phoneNumber = phoneNumber;
    if (rollNumber) p.rollNumber = rollNumber;

    await ev.save();
    res.json({ success: true, participant: p });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete participant (admin only)
router.delete('/:id/participant/:pid', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    const p = ev.participants.id(req.params.pid);
    if (!p) return res.status(404).json({ message: 'Participant not found' });

    p.remove();
    await ev.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
