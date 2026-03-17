import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, TrendingUp } from 'lucide-react';

const BidderDashboard = () => {
  const { authInst, dbUser } = useAuth();
  const { socket } = useSocket();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      // Assuming you want somewhat protected fetch for bidder dashboard, though we made it public in routes for now
      const res = await axios.get('http://localhost:5000/api/auctions');
      setAuctions(res.data.auctions);
    } catch (error) {
      console.error("Failed to fetch auctions", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10 font-heading">Loading Active Auctions...</div>;

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-4xl font-heading font-bold mb-2">Live Auctions</h1>
           <p className="text-muted-foreground">Discover and bid on premium items.</p>
        </div>
        <div className="glass-card px-6 py-4 flex items-center gap-4">
          <TrendingUp className="text-brand-500 w-8 h-8" />
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Balance</p>
            <p className="text-2xl font-bold">{dbUser?.credits || 0} CR</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {auctions.map((auction, idx) => (
          <AuctionCard key={auction.id} auction={auction} index={idx} />
        ))}
        {auctions.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
            No active auctions found at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

const AuctionCard = ({ auction, index }) => {
  const isEndingSoon = new Date(auction.endTime).getTime() - Date.now() < 3600000; // less than 1 hour

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-video bg-secondary flex items-center justify-center relative overflow-hidden">
         {auction.imageUrl ? (
            <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-500/20 to-accent-teal/20 flex items-center justify-center text-4xl font-heading font-black opacity-30">
               {auction.title.substring(0,2).toUpperCase()}
            </div>
         )}
         
         <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
            <Clock className={`w-3 h-3 ${isEndingSoon ? 'text-red-500 animate-pulse' : 'text-brand-500'}`} />
            <span className={isEndingSoon ? 'text-red-500' : ''}>
               {new Date(auction.endTime).toLocaleDateString()}
            </span>
         </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-heading font-bold mb-2 line-clamp-1">{auction.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
           {auction.description}
        </p>
        
        <div className="flex items-end justify-between mt-auto">
           <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Current Bid</p>
              <p className="text-2xl font-bold text-accent-teal">${auction.currentHighestBid}</p>
           </div>
           
           <Link 
             to={`/auction/${auction.id}`} 
             className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
           >
             Place Bid
           </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BidderDashboard;
