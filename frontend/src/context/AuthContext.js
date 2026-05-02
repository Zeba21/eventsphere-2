import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user profile data from our backend
          const res = await API.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    const res = await API.get('/auth/me');
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const { email, password, name, college, phone } = data;
    // 1. Create user in Firebase Auth
    await createUserWithEmailAndPassword(auth, email, password);
    // 2. Wait for auth state to be available, then create profile in backend
    const res = await API.post('/auth/profile', { name, college, phone, role: 'student' });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
