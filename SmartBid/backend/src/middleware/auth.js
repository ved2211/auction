const { admin } = require('../firebase');
const { getUserById, createUser } = require('../controllers/userModel');

// Middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Verification failed: Missing or invalid Authorization header');
    return res.status(401).json({ error: 'Unauthorized, missing or invalid token format' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    console.log('Attempting to verify Firebase ID token...');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Token verified successfully for user:', decodedToken.email);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.message);
    return res.status(403).json({ error: 'Unauthorized, invalid token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.uid);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }
    req.userData = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error validating admin status' });
  }
};

// Middleware to check if user is admin or organizer
const requireOrganizer = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.uid);
    if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden: Organizer or Admin access only' });
    }
    req.userData = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error validating organizer status' });
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireOrganizer
};
