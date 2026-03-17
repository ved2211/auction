import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const MyWins = () => {
  const { currentUser } = useAuth();
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyWins = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get('http://localhost:5000/api/auctions/won', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWins(res.data.auctions);
      if (res.data.auctions.length > 0) {
        triggerConfetti();
      }
    } catch (err) {
      console.error('Failed to fetch won auctions', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#EC4899', '#3B82F6']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#EC4899', '#3B82F6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  useEffect(() => {
    if (currentUser) fetchMyWins();
  }, [currentUser]);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-8 animate-in">
      <div className="text-center py-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 rounded-full bg-yellow-500/20 mb-4"
        >
          <Trophy className="w-12 h-12 text-yellow-500" />
        </motion.div>
        <h1 className="text-5xl font-heading font-bold mb-4">🏆 My <span className="text-gradient">Wins</span></h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Congratulations! Here are the auctions you've successfully won.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wins.map((auction, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={auction.id} 
            className="group relative"
          >
            <div className="glass overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/20 hover:-translate-y-2">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={auction.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'} 
                  alt={auction.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" /> WON
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand-500 transition-colors">{auction.title}</h3>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Price Paid</span>
                    <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">${auction.currentHighestBid}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <Calendar className="w-3 h-3" /> {new Date(auction.endTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/auction/${auction.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-brand-500 hover:text-white transition-all font-bold"
                >
                  View Details <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {wins.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl border-dashed">
          <p className="text-slate-500 text-lg mb-6">You haven't won any auctions yet. Time to place some bids!</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/40"
          >
            Explore Auctions
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyWins;
