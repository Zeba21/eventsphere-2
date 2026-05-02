import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, User, Phone,
  Download, Edit2, MessageCircle, ExternalLink, Search,
  ClipboardList, Trophy, Building2, Mail
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const fallback = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80';

export default function AdminEventDetail({ darkMode, toggleDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all'); // all | team | individual

  useEffect(() => {
    Promise.all([
      API.get(`/events/${id}`),
      API.get(`/admin/events/${id}/registrations`),
    ]).then(([evRes, regRes]) => {
      setEvent(evRes.data.event);
      setRegistrations(regRes.data.registrations);
      setFiltered(regRes.data.registrations);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    let res = registrations;
    if (teamFilter === 'team') res = res.filter(r => r.team_name);
    if (teamFilter === 'individual') res = res.filter(r => !r.team_name);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.college || '').toLowerCase().includes(q) || (r.team_name || '').toLowerCase().includes(q));
    }
    setFiltered(res);
  }, [search, teamFilter, registrations]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const formatTime = (t) => t ? t.substring(0, 5) : '—';
  const deadlinePassed = event?.deadline && new Date() > new Date(event.deadline);

  const uniqueTeams = [...new Set(registrations.filter(r => r.team_name).map(r => r.team_name))];
  const soloCount = registrations.filter(r => !r.team_name).length;

  const exportCSV = () => {
    const headers = ['#','Name','Email','College','Phone','Team','Team Code','Registered At'];
    const rows = filtered.map((r, i) => [
      i + 1, r.name, r.email, r.college || '', r.phone || '',
      r.team_name || 'Individual', r.team_code || '',
      new Date(r.registered_at).toLocaleString('en-IN'),
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(event?.title || 'event').replace(/\s+/g, '_')}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} registrations`);
  };

  if (loading) return (
    <AdminLayout darkMode={darkMode} toggleDark={toggleDark} title="Event Detail">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <div className="spinner" />
      </div>
    </AdminLayout>
  );

  if (!event) return (
    <AdminLayout darkMode={darkMode} toggleDark={toggleDark} title="Event Detail">
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Event not found.</p>
        <Link to="/admin/events"><button className="btn-primary" style={{ marginTop: 16, padding: '10px 24px' }}>Back to Events</button></Link>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout darkMode={darkMode} toggleDark={toggleDark} title={event.title}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* Back + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <Link to="/admin/events" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={13} /> Back to Events
            </button>
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            {event.whatsapp_link && (
              <a href={event.whatsapp_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <MessageCircle size={13} /> WhatsApp <ExternalLink size={11} />
                </button>
              </a>
            )}
            <Link to={`/admin/events?edit=${event.id}`} style={{ textDecoration: 'none' }}>
              <button onClick={() => navigate('/admin/events', { state: { editId: event.id } })} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Edit2 size={13} /> Edit Event
              </button>
            </Link>
          </div>
        </div>

        {/* Event Info Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
          {/* Hero image */}
          <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
            <img src={event.image_url || fallback} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.src = fallback; }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 22, right: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className={`tag ${event.event_type === 'team' ? 'tag-team' : 'tag-individual'}`}>{event.event_type}</span>
                {deadlinePassed && <span style={{ background: 'rgba(239,68,68,0.85)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: 'white' }}>Registration Closed</span>}
              </div>
              <h2 style={{ fontWeight: 900, fontSize: 'clamp(18px, 3vw, 28px)', color: 'white', lineHeight: 1.2 }}>{event.title}</h2>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ padding: 24 }}>
            {event.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                {event.description}
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                { icon: Calendar, label: 'Event Date', value: formatDate(event.event_date), color: 'var(--accent)' },
                { icon: Clock, label: 'Event Time', value: formatTime(event.event_time), color: 'var(--accent2)' },
                { icon: MapPin, label: 'Venue', value: event.venue || '—', color: '#10b981' },
                { icon: MapPin, label: 'Location', value: event.location || '—', color: '#f59e0b' },
                { icon: User, label: 'Coordinator', value: event.coordinator_name || '—', color: '#8b5cf6' },
                { icon: Phone, label: 'Contact', value: event.contact_info || '—', color: '#06b6d4' },
                ...(event.event_type === 'team' ? [{ icon: Users, label: 'Team Size', value: `${event.min_team_size}–${event.max_team_size} members`, color: '#ec4899' }] : []),
                ...(event.deadline ? [{ icon: Calendar, label: 'Deadline', value: formatDate(event.deadline), color: deadlinePassed ? 'var(--danger)' : 'var(--warning)' }] : []),
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Icon size={13} style={{ color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: color === 'var(--danger)' ? color : 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Registered', value: registrations.length, icon: ClipboardList, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Teams', value: uniqueTeams.length, icon: Trophy, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Individual', value: soloCount, icon: User, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
            { label: 'Colleges Represented', value: new Set(registrations.filter(r => r.college).map(r => r.college)).size, icon: Building2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 18px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} style={{ color }} />
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Registrations table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18 }}>
              Registered Participants
              <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>({registrations.length})</span>
            </h2>
            {registrations.length > 0 && (
              <button onClick={exportCSV} className="btn-secondary" style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search participants..." className="input-field" style={{ paddingLeft: 36, padding: '9px 12px 9px 36px', fontSize: 13 }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {event.event_type === 'team' && (
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'team', 'individual'].map(f => (
                  <button key={f} onClick={() => setTeamFilter(f)} style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit',
                    border: '1px solid', transition: 'all 0.2s', textTransform: 'capitalize',
                    borderColor: teamFilter === f ? 'var(--accent)' : 'var(--border)',
                    background: teamFilter === f ? 'rgba(124,58,237,0.12)' : 'var(--bg-secondary)',
                    color: teamFilter === f ? 'var(--accent-light)' : 'var(--text-secondary)',
                  }}>{f}</button>
                ))}
              </div>
            )}
          </div>

          {registrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text-secondary)' }}>
              <Users size={48} style={{ margin: '0 auto 18px', opacity: 0.25 }} />
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, color: 'var(--text-primary)' }}>No registrations yet</h3>
              <p style={{ fontSize: 14 }}>Participants will appear here once they register</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              No results match your filter
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 2.5fr 2fr 1.5fr 1.5fr', gap: 12, padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 640 }}>
                <span>#</span><span>Name</span><span>Email</span><span>College</span><span>Team</span><span>Registered</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filtered.map((r, i) => (
                  <motion.div key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                    style={{ display: 'grid', gridTemplateColumns: '40px 2fr 2.5fr 2fr 1.5fr 1.5fr', gap: 12, padding: '13px 14px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', alignItems: 'center', minWidth: 640 }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>{i + 1}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'white',
                      }}>{r.name[0].toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{r.name}</p>
                        {r.phone && <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.phone}</p>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden' }}>
                      <Mail size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden' }}>
                      <Building2 size={11} style={{ color: '#10b981', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.college || '—'}</span>
                    </div>

                    <div>
                      {r.team_name ? (
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.team_name}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.team_code}</p>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, background: 'rgba(6,182,212,0.1)', color: 'var(--accent2)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Solo</span>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(r.registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      <br />
                      <span style={{ fontSize: 10 }}>{new Date(r.registered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
}
