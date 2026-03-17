const { admin, db } = require('../firebase');
const { getAuctionById } = require('./auctionModel');
const { getUserById } = require('./userModel');
const { auctionsCollection } = require('./auctionModel');
const { usersCollection } = require('./userModel');

const placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const uid = req.user.uid;

    if (!auctionId || !bidAmount) {
      return res.status(400).json({ error: 'Missing auction ID or bid amount' });
    }

    // Reference to documents
    const auctionRef = auctionsCollection.doc(auctionId);
    const userRef = usersCollection.doc(uid);

    // Run transaction to ensure data consistency
    const result = await db.runTransaction(async (transaction) => {
      const auctionDoc = await transaction.get(auctionRef);
      const userDoc = await transaction.get(userRef);

      if (!auctionDoc.exists) throw new Error('Auction not found');
      if (!userDoc.exists) throw new Error('User not found');

      const auction = auctionDoc.data();
      const user = userDoc.data();

      console.log(`Debug: Bidding on ${auctionId} - Status: ${auction.status}, Current: ${auction.currentHighestBid}, New: ${bidAmount}`);
      
      // Validations
      if (auction.status !== 'ACTIVE') {
          console.log(`Debug: Auction not active: ${auction.status}`);
          throw new Error('Auction is closed');
      }
      
      const now = new Date();
      const endTime = new Date(auction.endTime);
      
      console.log(`Debug: Now: ${now.toISOString()}, EndTime: ${auction.endTime}`);

      if (now > endTime) {
          console.log(`Debug: Auction ended already`);
          // Close auction
          transaction.update(auctionRef, { status: 'CLOSED' });
          throw new Error('Auction has already ended');
      }

      const currentHighest = auction.currentHighestBid || 0;
      if (bidAmount <= currentHighest) {
          console.log(`Debug: Bid too low: ${bidAmount} <= ${currentHighest}`);
          throw new Error(`Bid must be greater than current highest bid (${currentHighest})`);
      }
      if (bidAmount < auction.minBid) {
          console.log(`Debug: Bid below min: ${bidAmount} < ${auction.minBid}`);
          throw new Error(`Bid must be at least the minimum bid (${auction.minBid})`);
      }

      if (user.credits < bidAmount) {
          console.log(`Debug: Insufficient credits: ${user.credits} < ${bidAmount}`);
          throw new Error(`Insufficient credits. You have ${user.credits}`);
      }

      // Credit Logic:
      // 1. Deduct new bid amount from current user
      const newUserCredits = user.credits - bidAmount;
      transaction.update(userRef, { credits: newUserCredits });

      // 2. Refund previous highest bidder
      if (auction.highestBidderId && auction.highestBidderId !== uid) {
          const prevBidderRef = usersCollection.doc(auction.highestBidderId);
          // Using FieldValue to increment is safer in transactions, but since we are in a transaction,
          // we could fetch it, but to keep transaction reads low:
          transaction.update(prevBidderRef, { credits: admin.firestore.FieldValue.increment(currentHighest) });
      } else if (auction.highestBidderId === uid) {
          // User outbid themselves (rare, but possible). Refund their previous bid immediately.
          transaction.update(userRef, { credits: newUserCredits + currentHighest });
      }

      // Anti-Sniping Logic
      const timeRemainingMs = endTime.getTime() - now.getTime();
      let newEndTime = auction.endTime;
      let extended = false;

      // Anti-Sniping: If less than 2 minutes remaining, extend by 2 minutes
      if (timeRemainingMs < 120000) {
          const newEnd = new Date(endTime.getTime() + 120000); // add 2 minutes
          newEndTime = newEnd.toISOString();
          extended = true;
      }

      // Prepare new bid object
      const newBid = {
          userId: uid,
          userName: user.name,
          amount: bidAmount,
          timestamp: now.toISOString()
      };

      // Update Auction
      transaction.update(auctionRef, {
          currentHighestBid: bidAmount,
          highestBidderId: uid,
          highestBidderName: user.name,
          endTime: newEndTime,
          bids: admin.firestore.FieldValue.arrayUnion(newBid)
      });

      // Also create a separate record in a top-level 'bids' collection for easier management
      const bidHistoryRef = db.collection('bids').doc();
      transaction.set(bidHistoryRef, {
          ...newBid,
          auctionId,
          auctionTitle: auction.title,
          id: bidHistoryRef.id
      });

      console.log(`Debug: Bid transaction successful for ${uid} on ${auctionId}`);

      return { 
          success: true, 
          newHighestBid: bidAmount, 
          highestBidderName: user.name,
          endTime: newEndTime,
          extended,
          newCredits: newUserCredits
      };
    });

    // Broadcast the update to all connected clients
    const io = req.app.get('socketio');
    if (io) {
      io.to(auctionId).emit('auction_update', {
        auctionId,
        newHighestBid: result.newHighestBid,
        highestBidderName: result.highestBidderName,
        endTime: result.endTime,
        extended: result.extended,
        bids: [{ 
           userName: result.highestBidderName,
           amount: result.newHighestBid,
           timestamp: new Date().toISOString()
        }] 
      });
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('ALARM: Bid failure:', error);
    res.status(400).json({ error: error.message || 'Failed to place bid' });
  }
};

module.exports = {
  placeBid
};
