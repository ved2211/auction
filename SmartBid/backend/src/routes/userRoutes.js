const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile, getAllUsers, assignCredits, upgradeToOrganizer } = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public route that simply verifies the token and handles login/registration
router.post('/login', verifyToken, loginUser);
router.post('/upgrade', verifyToken, upgradeToOrganizer);

// Private route to get own profile
router.get('/profile', verifyToken, getUserProfile);

// Admin routes
router.get('/all', verifyToken, requireAdmin, getAllUsers);
router.post('/assign-credits', verifyToken, requireAdmin, assignCredits);

module.exports = router;
