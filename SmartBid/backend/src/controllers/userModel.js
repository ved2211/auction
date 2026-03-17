// We use Firestore, so we don't have a strict schema like Mongoose, 
// but we define helper functions to interact with the 'users' collection consistently.

const { db } = require('../firebase');

const usersCollection = db.collection('users');

const createUser = async (uid, userData) => {
  const defaultUserData = {
    uid: uid,
    name: userData.name || 'Anonymous User',
    email: userData.email,
    role: userData.role || 'bidder', // 'bidder' or 'admin'
    credits: userData.credits || 0,
    bidding_history: [],
    createdAt: new Date().toISOString()
  };

  await usersCollection.doc(uid).set(defaultUserData);
  return defaultUserData;
};

const getUserById = async (uid) => {
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data();
};

const updateUserCredits = async (uid, creditChange) => {
  // Use a transaction or admin.firestore.FieldValue.increment in real scenarios
  // For simplicity, we fetch and update here
  const user = await getUserById(uid);
  if (!user) throw new Error('User not found');
  
  const newCredits = user.credits + creditChange;
  await usersCollection.doc(uid).update({ credits: newCredits });
  return newCredits;
};

module.exports = {
  createUser,
  getUserById,
  updateUserCredits,
  usersCollection
};
