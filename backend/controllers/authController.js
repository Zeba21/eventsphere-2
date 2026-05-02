const { db } = require('../config/firebase');

// POST /api/auth/profile
const createProfile = async (req, res) => {
  try {
    const { name, college, phone, role } = req.body;
    const userId = req.user.id;
    const email = req.user.email;

    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Update existing profile
      await userRef.update({ name, college: college || null, phone: phone || null, role: role || 'student' });
    } else {
      // Create new profile
      await userRef.set({
        name,
        email,
        college: college || null,
        phone: phone || null,
        role: role || 'student',
        createdAt: new Date().toISOString()
      });
    }

    const updatedDoc = await userRef.get();
    res.status(201).json({ message: 'Profile saved successfully!', user: { id: userId, ...updatedDoc.data() } });
  } catch (err) {
    console.error('Create profile error:', err.message);
    res.status(500).json({ error: 'Server error saving profile.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { createProfile, getMe };
