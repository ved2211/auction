import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-20 py-10">
      
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium text-sm border border-brand-200 dark:border-brand-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
            Live Real-Time Bidding
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight text-gradient leading-tight">
            The Future of <br className="hidden md:block"/> Online Auctions
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Experience lightning-fast bidding with anti-sniping protection and real-time updates. 
            Join SmartBid today and win your dream items.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          {currentUser ? (
             <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-lg transition-all shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-1">
               Go to Dashboard
             </Link>
          ) : (
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-lg transition-all shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-1">
              Start Bidding Now
            </Link>
          )}
          <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-lg transition-all">
            Learn More
          </a>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-accent-teal" />}
          title="Real-Time Engine"
          desc="WebSockets ensure you never miss a bid. See prices update instantly without refreshing the page."
          delay={0.3}
        />
        
        <FeatureCard 
          icon={<ShieldCheck className="w-8 h-8 text-brand-500" />}
          title="Anti-Sniping System"
          desc="Bids placed in the last 10 seconds automatically extend the timer, ensuring a fair auction for everyone."
          delay={0.4}
        />

        <FeatureCard 
          icon={<TrendingUp className="w-8 h-8 text-accent-pink" />}
          title="Credit System"
          desc="A secure wallet system manages your credits in real-time. Unsuccessful bids are instantly refunded."
          delay={0.5}
        />
        
      </section>
      
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-8 text-left space-y-4 hover:-translate-y-2 transition-transform duration-300"
  >
    <div className="p-3 bg-secondary w-fit rounded-2xl">
      {icon}
    </div>
    <h3 className="text-2xl font-heading font-semibold">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{desc}</p>
  </motion.div>
);

export default Home;
