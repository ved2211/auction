import { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

// The user must replace these in their own environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const authInst = getAuth(app);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(authInst, provider);
      const token = await result.user.getIdToken();
      
      // Send token to backend to create/get user profile
      const res = await axios.post('http://localhost:5000/api/users/login', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDbUser(res.data.user);
      return result.user;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    setDbUser(null);
    return signOut(authInst);
  };

  const fetchProfile = async (token) => {
      try {
           const res = await axios.get('http://localhost:5000/api/users/profile', {
               headers: { Authorization: `Bearer ${token}` }
           });
           setDbUser(res.data.user);
      } catch (error) {
          console.log("Failed to fetch DB profile", error);
      }
  }

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(authInst, async (user) => {
        setCurrentUser(user);
        if (user) {
            const token = await user.getIdToken();
            await fetchProfile(token);
        } else {
            setDbUser(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.warn("Firebase Auth listener failed to attach (likely missing config). Forcing load.");
      setLoading(false);
    }

    // Safety fallback: if Firebase is completely unconfigured, onAuthStateChanged might never fire or throw properly
    const fallbackTimer = setTimeout(() => {
        setLoading(false);
    }, 1500);

    return () => {
        if (unsubscribe) unsubscribe();
        clearTimeout(fallbackTimer);
    };
  }, []);

  const value = {
    currentUser,
    dbUser,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
