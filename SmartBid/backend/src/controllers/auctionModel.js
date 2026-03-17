const { db } = require('../firebase');

const auctionsCollection = db.collection('auctions');

const createAuctionRecord = async (auctionData) => {
  const newRef = auctionsCollection.doc();
  const defaultAuction = {
    id: newRef.id,
    title: auctionData.title || 'Untitled Auction',
    description: auctionData.description || 'No description provided.',
    imageUrl: auctionData.imageUrl || '',
    minBid: Number(auctionData.minBid) || 0,
    currentHighestBid: Number(auctionData.minBid) || 0,
    highestBidderId: null,
    highestBidderName: null,
    startTime: auctionData.startTime || new Date().toISOString(),
    endTime: auctionData.endTime,
    status: 'ACTIVE', // ACTIVE, CLOSED
    bids: [], // We might store bid history in a subcollection, but array is fine for MVP
    createdBy: auctionData.createdBy || 'SYSTEM',
    createdAt: new Date().toISOString()
  };

  await newRef.set(defaultAuction);
  return defaultAuction;
};

const getAuctionById = async (auctionId) => {
  const doc = await auctionsCollection.doc(auctionId).get();
  if (!doc.exists) return null;
  return doc.data();
};

const updateAuctionRecord = async (auctionId, updates) => {
  await auctionsCollection.doc(auctionId).update(updates);
  return getAuctionById(auctionId);
};

module.exports = {
  createAuctionRecord,
  getAuctionById,
  updateAuctionRecord,
  auctionsCollection
};
