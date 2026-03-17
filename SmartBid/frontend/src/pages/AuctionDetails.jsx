import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, DollarSign, History, AlertCircle, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authInst, dbUser } = useAuth();
  const { socket } = useSocket();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showExtension, setShowExtension] = useState(false);

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('join_auction', id);

    socket.on('auction_update', (data) => {
      if (data.auctionId === id) {
        setAuction(prev => ({
          ...prev,
          currentHighestBid: data.newHighestBid || prev.currentHighestBid,
          highestBidderName: data.highestBidderName || prev.highestBidderName,
          endTime: data.endTime || prev.endTime,
          bids: data.bids || prev.bids
        }));

        if (data.extended) {
          setShowExtension(true);
          setTimeout(() => setShowExtension(false), 5000);
        }
      }
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.off('auction_update');
    };
  }, [socket, id]);

  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const remaining = new Date(auction.endTime).getTime() - Date.now();
      setTimeRemaining(remaining > 0 ? remaining : 0);
      if (remaining <= 0 && auction.status === 'ACTIVE') {
          setAuction(prev => ({ ...prev, status: 'CLOSED' }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  useEffect(() => {
    if (auction && (auction.status === 'CLOSED' || timeRemaining === 0)) {
        if (dbUser && auction.highestBidderId === dbUser.uid) {
            triggerConfetti();
        }
    }
  }, [auction?.status, timeRemaining, dbUser]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#3B82F6']
    });
  };

  const fetchAuction = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auctions/${id}`);
      setAuction(res.data.auction);
      setBidAmount((res.data.auction.currentHighestBid || res.data.auction.minBid) + 10);
      setLoading(false);
    } catch (err) {
      setError('Auction not found or error loading');
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!dbUser) {
        navigate('/login');
        return;
    }

    try {
      const token = await authInst.currentUser.getIdToken();
      await axios.post('http://localhost:5000/api/bids', {
        auctionId: id,
        bidAmount: Number(bidAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // We don't need to manually update state; socket will broadcast to everyone including us
      setBidAmount(Number(bidAmount) + 10);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place bid');
    }
  };

  const formatTime = (ms) => {
    if (ms <= 0) return 'Auction Closed';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) return <div className="text-center p-20 text-xl font-heading">Loading Auction...</div>;
  if (!auction) return <div className="text-center p-20 text-xl text-red-500 font-heading">{error}</div>;

  const isClosed = timeRemaining === 0 || auction.status === 'CLOSED';

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-card overflow-hidden"
         >
            <div className="aspect-video bg-secondary flex items-center justify-center relative">
              {auction.imageUrl ? (
                <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-6xl font-black font-heading opacity-20 bg-gradient-to-br from-brand-600 to-accent-teal bg-clip-text text-transparent">
                  {auction.title.substring(0,3).toUpperCase()}
                </div>
              )}
               <div className={`absolute top-4 right-4 backdrop-blur-md px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 ${isClosed ? 'bg-red-500/90 text-white' : 'bg-background/90'}`}>
                  <Clock className={`w-4 h-4 ${!isClosed && timeRemaining < 3600000 ? 'text-red-500 animate-pulse' : ''}`} />
                  <span className={!isClosed && timeRemaining < 3600000 ? 'text-red-500' : ''}>
                     {formatTime(timeRemaining)}
                  </span>
               </div>

               <AnimatePresence>
                 {showExtension && (
                   <motion.div 
                     initial={{ y: -50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ y: -50, opacity: 0 }}
                     className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-6 py-2 rounded-full font-bold shadow-xl z-50 flex items-center gap-2"
                   >
                     🚀 Anti-Sniping: Time Extended by 2m!
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
            
            <div className="p-8 space-y-4">
               <h1 className="text-3xl md:text-5xl font-heading font-bold">{auction.title}</h1>
               <p className="text-lg text-muted-foreground leading-relaxed">{auction.description}</p>
            </div>
         </motion.div>
      </div>

      {/* Sidebar / Bidding Area */}
      <div className="space-y-6">
         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden"
         >
            {/* Animated background glow for active state */}
            {!isClosed && <div className="absolute inset-0 bg-brand-500/5 dark:bg-brand-500/10 animate-pulse pointer-events-none" />}
            
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 z-10">Current Highest Bid</p>
            <h2 className="text-5xl font-black text-brand-600 dark:text-brand-400 mb-2 z-10">
               ${auction.currentHighestBid}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 z-10">
               by <span className="font-bold text-foreground">{auction.highestBidderName || 'No bids yet'}</span>
            </p>

            {isClosed && dbUser && auction.highestBidderId === dbUser.uid && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full p-4 mb-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col items-center gap-2 z-10"
                >
                  <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />
                  <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">You Won!</span>
                  <p className="text-xs text-slate-500">Check your "My Wins" gallery for details.</p>
                </motion.div>
            )}

            {error && (
               <div className="w-full p-3 mb-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-center gap-2 z-10">
                  <AlertCircle className="w-4 h-4" /> {error}
               </div>
            )}

            {!isClosed ? (
                <form onSubmit={handleBid} className="w-full space-y-4 z-10">
                  <div className="relative">
                     <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                     <input 
                       type="number" 
                       min={auction.currentHighestBid + 1}
                       value={bidAmount}
                       onChange={e => setBidAmount(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border-2 border-border focus:border-brand-500 outline-none text-xl font-bold transition-colors"
                     />
                  </div>
                  <button type="submit" className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-1 active:scale-95">
                     Place Bid Now
                  </button>
                  {dbUser && (
                     <p className="text-xs text-muted-foreground">Available Balance: <span className="font-bold">{dbUser.credits} CR</span></p>
                  )}
                </form>
            ) : (
                <div className="w-full py-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-lg z-10">
                   Auction Closed
                </div>
            )}
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
         >
            <div className="flex items-center gap-2 mb-6">
               <History className="w-5 h-5 text-brand-500" />
               <h3 className="font-heading font-bold text-lg">Bid History</h3>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {auction.bids && auction.bids.length > 0 ? (
                  [...auction.bids].reverse().map((bid, i) => (
                     <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="flex flex-col">
                           <span className="font-semibold text-sm">{bid.userName}</span>
                           <span className="text-xs text-muted-foreground">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className="font-bold text-green-600 dark:text-green-400">${bid.amount}</span>
                     </div>
                  ))
               ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">No bids placed yet.</p>
               )}
            </div>
         </motion.div>
      </div>

    </div>
  );
};

export default AuctionDetails;
