const express = require('express');
const router = express.Router();
const { placeBid } = require('../controllers/bidController');
const { verifyToken } = require('../middleware/auth');

// Protected route for placing a bid
router.post('/', verifyToken, placeBid);

module.exports = router;
