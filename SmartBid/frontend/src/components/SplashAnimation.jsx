import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashAnimation = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 800); // Wait for exit animation to finish
    }, 2500); // Splash duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-500 blur-[80px] opacity-30 rounded-full animate-pulse"></div>
            <h1 className="text-6xl md:text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-accent-teal to-accent-pink tracking-tighter drop-shadow-2xl">
              SmartBid
            </h1>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ delay: 1, duration: 1.2, ease: 'circOut' }}
            className="h-1 mt-8 bg-gradient-to-r from-brand-500 to-accent-teal rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashAnimation;
