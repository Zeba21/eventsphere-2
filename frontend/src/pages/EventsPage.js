import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import EventCard from '../components/student/EventCard';
import API from '../utils/api';

export default function EventsPage({ darkMode, toggleDark }) {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    API.get('/events').then(r => {
      setEvents(r.data.events);
      setFiltered(r.data.events);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = events;
    if (typeFilter !== 'all') result = result.filter(e => e.event_type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.venue || '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, typeFilter, events]);

  const filterButtons = [
    { label: 'All Events', value: 'all' },
    { label: 'Individual', value: 'individual' },
    { label: 'Team', value: 'team' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      {/* Header */}
      <div style={{
        paddingTop: 100, paddingBottom: 48, paddingLeft: 24, paddingRight: 24,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontWeight: 800, fontSize: 'clamp(28px, 5vw, 44px)', marginBottom: 8 }}
          >
            All <span className="gradient-text">Events</span>
          </motion.h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }}>
            {events.length} events from colleges across the region
          </p>

          {/* Search + Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="Search events, venues..."
                className="input-field" style={{ paddingLeft: 40 }}
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {filterButtons.map(({ label, value }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTypeFilter(value)}
                  style={{
                    padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: '1px solid',
                    borderColor: typeFilter === value ? 'var(--accent)' : 'var(--border)',
                    background: typeFilter === value ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
                    color: typeFilter === value ? 'var(--accent-light)' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 20 }}>
                  <div className="skeleton" style={{ height: 20, marginBottom: 10, width: '70%' }} />
                  <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}
          >
            <Calendar size={56} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>No events found</h3>
            <p>Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <>
            <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
              Showing {filtered.length} of {events.length} events
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
