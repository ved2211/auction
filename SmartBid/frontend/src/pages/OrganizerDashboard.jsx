import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, Gavel, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrganizerDashboard = () => {
  const { currentUser, dbUser } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minBid: '',
    startTime: '',
    endTime: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchMyAuctions = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get('http://localhost:5000/api/auctions?admin=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for auctions created by this user
      const myAuctions = res.data.auctions.filter(a => a.createdBy === currentUser.uid);
      setAuctions(myAuctions);
    } catch (err) {
      console.error('Failed to fetch auctions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchMyAuctions();
  }, [currentUser]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('minBid', formData.minBid);
      data.append('startTime', formData.startTime);
      data.append('endTime', formData.endTime);
      if (selectedFile) {
        data.append('image', selectedFile);
      } else {
        data.append('imageUrl', formData.imageUrl);
      }

      await axios.post('http://localhost:5000/api/auctions', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', minBid: '', startTime: '', endTime: '', imageUrl: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchMyAuctions();
    } catch (err) {
      alert('Failed to create auction: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`http://localhost:5000/api/auctions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyAuctions();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Organizer <span className="text-gradient">Dashboard</span></h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your auctions and track live bids.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-lg hover:shadow-brand-500/40"
        >
          <Plus className="w-5 h-5" />
          Create New Auction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map(auction => (
          <motion.div 
            layout
            key={auction.id} 
            className="glass p-6 rounded-2xl relative group overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-900/30">
                  <Gavel className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <button 
                  onClick={() => handleDelete(auction.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{auction.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{auction.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Highest Bid:</span>
                  <span className="font-bold text-brand-600">${auction.currentHighestBid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Ends:
                  </span>
                  <span className="font-medium text-xs">
                    {new Date(auction.endTime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          </motion.div>
        ))}
        {auctions.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-2xl border-dashed">
            <p className="text-slate-500">You haven't created any auctions yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg glass-dark p-8 rounded-3xl shadow-2xl overflow-hidden"
            >
              <h2 className="text-2xl font-bold mb-6">Create New Auction</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 ring-brand-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 h-24 focus:ring-2 ring-brand-500 outline-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Starting Bid ($)</label>
                    <input 
                      type="number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 ring-brand-500 outline-none"
                      value={formData.minBid}
                      onChange={e => setFormData({...formData, minBid: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Auction Image</label>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              setSelectedFile(file);
                              setPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 ring-brand-500 outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600 transition-all"
                        />
                      </div>
                      {previewUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input 
                      type="datetime-local"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 ring-brand-500 outline-none"
                      value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input 
                      type="datetime-local"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 ring-brand-500 outline-none"
                      value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all"
                  >
                    Launch Auction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerDashboard;
