import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEventDetail from './pages/admin/AdminEventDetail';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = ({ darkMode, toggleDark }) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage darkMode={darkMode} toggleDark={toggleDark} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/events" element={<EventsPage darkMode={darkMode} toggleDark={toggleDark} />} />
      <Route path="/events/:id" element={<EventDetailPage darkMode={darkMode} toggleDark={toggleDark} />} />
      <Route path="/my-registrations" element={
        <ProtectedRoute><MyRegistrationsPage darkMode={darkMode} toggleDark={toggleDark} /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AdminDashboard darkMode={darkMode} toggleDark={toggleDark} /></ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute adminOnly><AdminEvents darkMode={darkMode} toggleDark={toggleDark} /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly><AdminUsers darkMode={darkMode} toggleDark={toggleDark} /></ProtectedRoute>
      } />
      <Route path="/admin/events/:id" element={
        <ProtectedRoute adminOnly><AdminEventDetail darkMode={darkMode} toggleDark={toggleDark} /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const toggleDark = () => setDarkMode(d => !d);

  return (
    <div className={darkMode ? '' : 'light-mode'}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes darkMode={darkMode} toggleDark={toggleDark} />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: darkMode ? '#16161f' : '#fff',
                color: darkMode ? '#f0f0ff' : '#0a0a1a',
                border: '1px solid #2a2a3a',
                borderRadius: '12px',
                fontFamily: 'Outfit, sans-serif',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
