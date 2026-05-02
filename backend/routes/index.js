const express = require('express');
const router = express.Router();
const { createProfile, getMe } = require('../controllers/authController');
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { registerForEvent, getMyRegistrations } = require('../controllers/registrationController');
const { createTeam, joinTeam, getMyTeam } = require('../controllers/teamController');
const { getAllUsers, getDashboardStats, getEventRegistrations } = require('../controllers/adminController');
const { verifyTokenOnly, authenticateUser, isAdmin } = require('../middleware/auth');

// Auth
router.post('/auth/profile', verifyTokenOnly, createProfile);
router.get('/auth/me', authenticateUser, getMe);

// Events (public)
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);

// Events (admin)
router.post('/events', authenticateUser, isAdmin, createEvent);
router.put('/events/:id', authenticateUser, isAdmin, updateEvent);
router.delete('/events/:id', authenticateUser, isAdmin, deleteEvent);

// Registrations
router.post('/register', authenticateUser, registerForEvent);
router.get('/register/my', authenticateUser, getMyRegistrations);

// Teams
router.post('/teams/create', authenticateUser, createTeam);
router.post('/teams/join', authenticateUser, joinTeam);
router.get('/teams/my/:event_id', authenticateUser, getMyTeam);

// Admin
router.get('/admin/users', authenticateUser, isAdmin, getAllUsers);
router.get('/admin/stats', authenticateUser, isAdmin, getDashboardStats);
router.get('/admin/events/:id/registrations', authenticateUser, isAdmin, getEventRegistrations);

module.exports = router;
