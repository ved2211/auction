import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { authInst } = useAuth();
    const [auctions, setAuctions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [minBid, setMinBid] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = await authInst.currentUser.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };
            
            const [auctionsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/auctions?admin=true', { headers }),
                axios.get('http://localhost:5000/api/users/all', { headers })
            ]);

            setAuctions(auctionsRes.data.auctions);
            setUsers(usersRes.data.users);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAuction = async (e) => {
        e.preventDefault();
        try {
            const token = await authInst.currentUser.getIdToken();
            await axios.post('http://localhost:5000/api/auctions', {
                title, 
                minBid, 
                endTime,
                startTime: new Date().toISOString()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Auction Created!');
            setTitle(''); setMinBid(''); setEndTime('');
            fetchData();
        } catch(error) {
            alert('Failed to create auction');
        }
    };

    const handleAssignCredits = async (uid) => {
        const amount = prompt("Enter amount to assign/add:");
        if(!amount || isNaN(amount)) return;

        try {
            const token = await authInst.currentUser.getIdToken();
            await axios.post('http://localhost:5000/api/users/assign-credits', {
                targetUid: uid,
                amount: Number(amount)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Credits Assigned!');
            fetchData();
        } catch(error) {
            alert('Failed to assign credits');
        }
    };

    if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;

    return (
        <div className="space-y-12">
            <h1 className="text-4xl font-heading font-bold">Admin Dashboard</h1>

            <section className="glass-card p-6 md:p-8">
                <h2 className="text-2xl font-semibold mb-6">Create New Auction</h2>
                <form onSubmit={handleCreateAuction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 rounded-lg bg-background border text-foreground" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Min Bid ($)</label>
                        <input required type="number" value={minBid} onChange={e=>setMinBid(e.target.value)} className="w-full p-2 rounded-lg bg-background border text-foreground" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Time</label>
                        <input required type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full p-2 rounded-lg bg-background border text-foreground" />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors h-[42px]">
                        Create Auction
                    </button>
                </form>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="glass-card p-6">
                    <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {users.map(user => (
                            <div key={user.uid} className="p-4 rounded-xl bg-secondary/50 border flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-brand-500 mb-2">{user.credits} CR</p>
                                    <button onClick={() => handleAssignCredits(user.uid)} className="text-xs px-3 py-1 bg-white dark:bg-black rounded border hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                                        Assign Credits
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="glass-card p-6">
                    <h2 className="text-2xl font-semibold mb-4">All Auctions</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {auctions.map(auction => (
                            <div key={auction.id} className="p-4 rounded-xl bg-secondary/50 border flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{auction.title}</p>
                                    <p className="text-sm text-muted-foreground">Highest Bid: ${auction.currentHighestBid}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full ${auction.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {auction.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
