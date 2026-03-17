const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createAuction, getAllAuctions, getAuctionDetails, deleteAuction, getWonAuctions } = require('../controllers/auctionController');
const { verifyToken, requireAdmin, requireOrganizer } = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Public/Bidder Routes
router.get('/', getAllAuctions);
router.get('/won', verifyToken, getWonAuctions);
router.get('/:id', getAuctionDetails);

// Organizer/Admin Routes
router.post('/', verifyToken, requireOrganizer, upload.single('image'), createAuction);
router.delete('/:id', verifyToken, requireOrganizer, deleteAuction);

module.exports = router;
