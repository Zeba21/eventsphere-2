import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, CalendarDays, Trophy, ClipboardList, ArrowRight,
  TrendingUp, Plus, Eye, AlertCircle, CheckCircle2,
  Clock, Zap, BarChart3, Activity
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard({ darkMode, toggleDark }) {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats'),
      API.get('/events'),
    ]).then(([statsRes, eventsRes]) => {
      setData(statsRes.data);
      setEvents(eventsRes.data.events);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past = events.filter(e => new Date(e.event_date) < now);
  const teamEvents = events.filter(e => e.event_type === 'team');
  const totalRegs = events.reduce((s, e) => s + parseInt(e.registration_count || 0), 0);

  const statCards = [
    { label: 'Total Students', value: data?.stats?.totalStudents ?? 0, icon: Users, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', sub: 'Registered accounts' },
    { label: 'Total Events', value: data?.stats?.totalEvents ?? 0, icon: CalendarDays, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', sub: `${upcoming.length} upcoming` },
    { label: 'Registrations', value: data?.stats?.totalRegistrations ?? 0, icon: ClipboardList, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', sub: 'Across all events' },
    { label: 'Active Teams', value: data?.stats?.totalTeams ?? 0, icon: Trophy, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', sub: `${teamEvents.length} team events` },
  ];

  const barData = [...events]
    .sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0))
    .slice(0, 6);
  const barMax = Math.max(...barData.map(e => parseInt(e.registration_count || 0)), 1);
  const barColors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6'];

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <AdminLayout darkMode={darkMode} toggleDark={toggleDark} title="Dashboard">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.12))',
          border: '1px solid rgba(124,58,237,0.25)', borderRadius: 18,
          padding: '22px 26px', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px var(--accent-glow)' }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 3 }}>Welcome back, Admin 👋</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/admin/events?action=create" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> New Event
              </button>
            </Link>
            <Link to="/admin/events" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={14} /> View All
              </button>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
          {statCards.map(({ label, value, icon: Icon, color, bg, border, sub }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'var(--bg-card)', border: `1px solid ${border}`, borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: bg, filter: 'blur(24px)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 100, padding: '3px 8px' }}>
                  <TrendingUp size={11} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>Live</span>
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 38, color: 'var(--text-primary)', lineHeight: 1, position: 'relative' }}>
                {loading ? <div className="skeleton" style={{ width: 60, height: 36, borderRadius: 8 }} /> : value}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginTop: 6 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Middle Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, marginBottom: 20 }} className="dash-mid">

          {/* Bar chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={17} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>Registrations by Event</h2>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 38, borderRadius: 8 }} />)}
              </div>
            ) : barData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                <BarChart3 size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                Create events to see chart data
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {barData.map((ev, i) => {
                  const count = parseInt(ev.registration_count || 0);
                  const pct = (count / barMax) * 100;
                  return (
                    <div key={ev.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '78%' }}>
                          {ev.title}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: barColors[i], flexShrink: 0 }}>{count}</span>
                      </div>
                      <div style={{ height: 9, background: 'var(--bg-secondary)', borderRadius: 100, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 2)}%` }}
                          transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: 100, background: barColors[i] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick stats col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Upcoming', value: upcoming.length, icon: Clock, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
              { label: 'Completed', value: past.length, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Team Events', value: teamEvents.length, icon: Trophy, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Total Regs', value: totalRegs, icon: Activity, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
            ].map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {loading ? '—' : value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dash-bottom">

          {/* Upcoming */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={15} style={{ color: 'var(--accent2)' }} />
                <h2 style={{ fontWeight: 700, fontSize: 15 }}>Upcoming Events</h2>
              </div>
              <Link to="/admin/events" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>All <ArrowRight size={10} /></button>
              </Link>
            </div>
            {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}</div>
            : upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <AlertCircle size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                No upcoming events
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.slice(0, 5).map((ev, i) => (
                  <motion.div key={ev.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent-light)', lineHeight: 1 }}>{new Date(ev.event_date).getDate()}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{MONTHS[new Date(ev.event_date).getMonth()]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.registration_count || 0} registered · {ev.event_type}</p>
                    </div>
                    <Link to={`/admin/events/${ev.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent events */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarDays size={15} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontWeight: 700, fontSize: 15 }}>All Events (Recent)</h2>
              </div>
              <Link to="/admin/events?action=create" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}><Plus size={10} /> Add</button>
              </Link>
            </div>
            {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}</div>
            : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <CalendarDays size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                No events.{' '}
                <Link to="/admin/events?action=create" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>Create one →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...events].reverse().slice(0, 5).map((ev, i) => {
                  const isPast = new Date(ev.event_date) < now;
                  return (
                    <motion.div key={ev.id}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isPast ? 'var(--text-muted)' : '#10b981', boxShadow: isPast ? 'none' : '0 0 6px rgba(16,185,129,0.5)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(ev.event_date)}</p>
                      </div>
                      <Link to={`/admin/events/${ev.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                        <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 900px) { .dash-mid, .dash-bottom { grid-template-columns: 1fr !important; } }
      `}</style>
    </AdminLayout>
  );
}
