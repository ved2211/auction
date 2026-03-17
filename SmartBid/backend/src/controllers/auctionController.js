const { createAuctionRecord, getAuctionById, updateAuctionRecord, auctionsCollection } = require('./auctionModel');

const createAuction = async (req, res) => {
  try {
    const { title, description, minBid, startTime, endTime } = req.body;
    let { imageUrl } = req.body;

    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    
    if(!title || !minBid || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAuction = await createAuctionRecord({
      title, description, imageUrl, minBid, startTime, endTime,
      createdBy: req.user.uid
    });

    res.status(201).json({ message: 'Auction created successfully', auction: newAuction });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ error: 'Failed to create auction' });
  }
};

const getAllAuctions = async (req, res) => {
  try {
    // Only fetch ACTIVE auctions by default, or all if admin?
    // Let's fetch all for admin, and active for public
    const isAdmin = req.query.admin === 'true'; 
    let query = auctionsCollection;
    
    if (!isAdmin) {
       query = query.where('status', '==', 'ACTIVE');
    }

    const snapshot = await query.get();
    const auctions = [];
    snapshot.forEach(doc => {
      auctions.push(doc.data());
    });
    res.status(200).json({ auctions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
};

const getAuctionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await getAuctionById(id);
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.status(200).json({ auction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auction details' });
  }
};

const deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await getAuctionById(id);
        if(!auction) return res.status(404).json({ error: 'Auction not found' });

        if (auction.createdBy !== req.user.uid && req.userData.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own auctions' });
        }

        await auctionsCollection.doc(id).delete();
        res.status(200).json({ message: 'Auction deleted successfully' });
    } catch(error) {
        res.status(500).json({ error: 'Failed to delete auction' });
    }
}

const getWonAuctions = async (req, res) => {
    try {
        const uid = req.user.uid;
        // Fetch auctions where user is the highest bidder and it's either active but expired, or closed
        const snapshot = await auctionsCollection
            .where('highestBidderId', '==', uid)
            .get();
        
        const now = new Date();
        const wonAuctions = [];
        
        snapshot.forEach(doc => {
            const auction = doc.data();
            const endTime = new Date(auction.endTime);
            if (now > endTime || auction.status === 'CLOSED') {
                wonAuctions.push(auction);
            }
        });

        res.status(200).json({ auctions: wonAuctions });
    } catch (error) {
        console.error('Error fetching won auctions:', error);
        res.status(500).json({ error: 'Failed to fetch won auctions' });
    }
};

module.exports = {
  createAuction,
  getAllAuctions,
  getAuctionDetails,
  deleteAuction,
  getWonAuctions
};
