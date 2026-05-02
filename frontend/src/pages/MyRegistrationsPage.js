import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, MessageCircle, Users, BookMarked } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fallback = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80';

export default function MyRegistrationsPage({ darkMode, toggleDark }) {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/register/my').then(r => {
      setRegistrations(r.data.registrations);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <div style={{ paddingTop: 100, maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: 6 }}>
            My <span className="gradient-text">Registrations</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: 15 }}>
            Hi {user?.name}, here are all your event registrations.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}
          >
            <BookMarked size={56} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>No registrations yet</h3>
            <p style={{ marginBottom: 24 }}>Explore events and register to participate</p>
            <Link to="/events">
              <button className="btn-primary" style={{ padding: '12px 28px' }}>Browse Events</button>
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {registrations.map((reg, i) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: 20, display: 'flex', gap: 20, alignItems: 'center',
                }}
              >
                <img
                  src={reg.image_url || fallback} alt={reg.title}
                  style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                  onError={e => { e.target.src = fallback; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{reg.title}</h3>
                    <span className={`tag ${reg.event_type === 'team' ? 'tag-team' : 'tag-individual'}`}>
                      {reg.event_type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <Calendar size={12} style={{ color: 'var(--accent)' }} />
                      {formatDate(reg.event_date)}
                    </span>
                    {reg.venue && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}>
                        <MapPin size={12} style={{ color: 'var(--accent2)' }} /> {reg.venue}
                      </span>
                    )}
                    {reg.team_name && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}>
                        <Users size={12} style={{ color: 'var(--success)' }} /> {reg.team_name} ({reg.team_code})
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Registered {new Date(reg.registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <Link to={`/events/${reg.event_id}`}>
                    <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: 12 }}>View Event</button>
                  </Link>
                  {reg.whatsapp_link && (
                    <a href={reg.whatsapp_link} target="_blank" rel="noreferrer">
                      <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageCircle size={12} /> WhatsApp
                      </button>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
