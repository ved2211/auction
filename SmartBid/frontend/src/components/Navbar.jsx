import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Gavel, LogOut } from 'lucide-react';

const Navbar = () => {
  const { dbUser, logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Gavel className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span className="text-2xl font-heading font-bold text-gradient">SmartBid</span>
        </Link>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {dbUser ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">{dbUser.name}</span>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                  {dbUser.credits} Credits
                </span>
              </div>

              <Link to="/my-wins" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                My Wins
              </Link>
              
              {dbUser.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Admin Panel
                </Link>
              )}

              {dbUser.role === 'organizer' && (
                <Link to="/organizer" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Organizer Dashboard
                </Link>
              )}

              {dbUser.role === 'bidder' && (
                <button 
                  onClick={async () => {
                    if(window.confirm('Want to become an organizer?')) {
                      try {
                        const token = await currentUser.getIdToken();
                        await (await import('axios')).default.post('http://localhost:5000/api/users/upgrade', {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        window.location.reload();
                      } catch (err) {
                        console.error('Upgrade failed', err);
                        alert('Upgrade failed');
                      }
                    }
                  }}
                  className="text-xs px-3 py-1 rounded-full border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
                >
                  Become Organizer
                </button>
              )}

              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link 
               to="/login"
               className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium transition-all duration-300 shadow-lg shadow-brand-500/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
