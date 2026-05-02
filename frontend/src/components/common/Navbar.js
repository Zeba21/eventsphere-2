import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, Zap, LogOut, User, LayoutDashboard, CalendarDays, BookMarked } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar({ darkMode, toggleDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/events', label: 'Events', icon: CalendarDays },
        { to: '/admin/users', label: 'Users', icon: User },
      ]
    : [
        { to: '/events', label: 'Events', icon: CalendarDays },
        ...(user ? [{ to: '/my-registrations', label: 'My Registrations', icon: BookMarked }] : []),
      ];

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          padding: '0 24px',
          height: '68px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled
            ? darkMode ? 'rgba(10,10,15,0.92)' : 'rgba(244,244,255,0.92)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px var(--accent-glow)',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{
            fontFamily: 'Outfit', fontWeight: 800, fontSize: 20,
            background: 'var(--gradient)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            EventSphere
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 10,
                  color: location.pathname === to ? 'var(--accent-light)' : 'var(--text-secondary)',
                  background: location.pathname === to ? 'rgba(124,58,237,0.12)' : 'transparent',
                  fontWeight: 500, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={15} />
                {label}
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleDark} style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'white',
                }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ display: 'none', color: 'var(--text-primary)' }} className="user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login"><button className="btn-secondary" style={{ padding: '8px 18px', fontSize: 14 }}>Login</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>Sign Up</button></Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{
              display: 'none', width: 38, height: 38, borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-primary)',
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 68, left: 0, right: 0, zIndex: 999,
              background: darkMode ? 'rgba(10,10,15,0.98)' : 'rgba(244,244,255,0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border)',
              padding: '16px 24px 24px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10,
                  background: location.pathname === to ? 'rgba(124,58,237,0.12)' : 'transparent',
                  color: location.pathname === to ? 'var(--accent-light)' : 'var(--text-primary)',
                  fontWeight: 500,
                }}>
                  <Icon size={16} /> {label}
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
