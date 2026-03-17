import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import SplashAnimation from './components/SplashAnimation';

import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import BidderDashboard from './pages/BidderDashboard';
import AuctionDetails from './pages/AuctionDetails';
import OrganizerDashboard from './pages/OrganizerDashboard';
import MyWins from './pages/MyWins';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          {showSplash ? (
            <SplashAnimation onComplete={() => setShowSplash(false)} />
          ) : (
            <Router>
              <div className="min-h-screen flex flex-col transition-colors duration-300">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<BidderDashboard />} />
                    <Route path="/organizer" element={<OrganizerDashboard />} />
                    <Route path="/my-wins" element={<MyWins />} />
                    <Route path="/auction/:id" element={<AuctionDetails />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </Router>
          )}
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
