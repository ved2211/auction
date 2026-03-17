// Initial Firebase Admin Setup
const admin = require('firebase-admin');
require('dotenv').config();

// We will initialize this once the user provides the service account key in .env or a local file
try {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (credentials) {
    if (credentials.trim().startsWith('{')) {
      // It's a JSON string
      const serviceAccount = JSON.parse(credentials);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS.");
    } else {
      // It's a file path
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log("Firebase Admin initialized via path in GOOGLE_APPLICATION_CREDENTIALS.");
    }
  } else {
    // Attempting to fallback for development but logging warning
    console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. Firebase Admin may not be fully initialized.");
    admin.initializeApp();
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const db = admin.firestore();

module.exports = { admin, db };
