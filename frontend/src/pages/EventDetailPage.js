import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, User, Phone, Users, ExternalLink,
  CheckCircle, X, ArrowLeft, MessageCircle, Trophy
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const fallback = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80';

export default function EventDetailPage({ darkMode, toggleDark }) {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMode, setTeamMode] = useState('create'); // 'create' | 'join'
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    API.get(`/events/${id}`).then(r => {
      setEvent(r.data.event);
      setLoading(false);
    }).catch(() => { toast.error('Event not found'); navigate('/events'); });
  }, [id, navigate]);

  useEffect(() => {
    if (user && event?.event_type === 'team') {
      API.get(`/teams/my/${id}`).then(r => setMyTeam(r.data.team)).catch(() => {});
    }
  }, [user, event, id]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (t) => t ? t.substring(0, 5) : '';
  const deadlinePassed = event?.deadline && new Date() > new Date(event.deadline);

  const handleRegister = async () => {
    if (!user) { toast.error('Please login to register'); navigate('/login'); return; }
    if (event.event_type === 'team' && !myTeam) { setShowTeamModal(true); return; }

    setRegLoading(true);
    try {
      const payload = { event_id: event.id };
      if (event.event_type === 'team') payload.team_id = myTeam.id;
      const res = await API.post('/register', payload);
      setSuccessData(res.data);
      if (res.data.whatsappLink) {
        setTimeout(() => window.open(res.data.whatsappLink, '_blank'), 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return toast.error('Enter a team name');
    try {
      const res = await API.post('/teams/create', { name: teamName, event_id: event.id });
      setMyTeam(res.data.team);
      toast.success(`Team created! Code: ${res.data.team.team_code}`);
      setShowTeamModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create team');
    }
  };

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) return toast.error('Enter team code');
    try {
      const res = await API.post('/teams/join', { team_code: teamCode });
      setMyTeam(res.data.team);
      toast.success('Joined team!');
      setShowTeamModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join team');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      <div className="spinner" />
    </div>
  );

  if (successData) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          textAlign: 'center', maxWidth: 480,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 24, padding: '48px 40px',
        }}
      >
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 2, duration: 0.5 }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 24px' }} />
        </motion.div>
        <h2 style={{ fontWeight: 800, fontSize: 26, marginBottom: 10 }}>You're Registered! 🎉</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          Successfully registered for <strong style={{ color: 'var(--text-primary)' }}>{event.title}</strong>
        </p>
        {successData.whatsappLink && (
          <a href={successData.whatsappLink} target="_blank" rel="noreferrer">
            <button className="btn-primary" style={{ width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <MessageCircle size={16} /> Join WhatsApp Group
            </button>
          </a>
        )}
        <Link to="/my-registrations">
          <button className="btn-secondary" style={{ width: '100%', padding: '12px' }}>View My Registrations</button>
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      {/* Hero image */}
      <div style={{ height: 380, position: 'relative', overflow: 'hidden', marginTop: 68 }}>
        <img src={event.image_url || fallback} alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = fallback; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(10,10,15,0.5) 50%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 24, left: 24 }}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <span className={`tag ${event.event_type === 'team' ? 'tag-team' : 'tag-individual'}`} style={{ marginBottom: 10, display: 'inline-flex' }}>
            {event.event_type === 'team' ? <Users size={11} /> : <User size={11} />}
            {event.event_type === 'team' ? 'Team Event' : 'Individual Event'}
          </span>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(24px, 5vw, 42px)', lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {event.title}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }} className="detail-grid">
        {/* Main content */}
        <div>
          {event.description && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 14 }}>About this Event</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15 }}>{event.description}</p>
            </section>
          )}

          {/* Details grid */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Event Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { icon: Calendar, label: 'Date', value: formatDate(event.event_date) },
                { icon: Clock, label: 'Time', value: event.event_time ? formatTime(event.event_time) : 'TBA' },
                { icon: MapPin, label: 'Venue', value: event.venue || 'TBA' },
                { icon: MapPin, label: 'Location', value: event.location || 'TBA', color: 'var(--accent2)' },
                { icon: User, label: 'Coordinator', value: event.coordinator_name || 'TBA' },
                { icon: Phone, label: 'Contact', value: event.contact_info || 'TBA' },
                ...(event.event_type === 'team' ? [
                  { icon: Users, label: 'Team Size', value: `${event.min_team_size}–${event.max_team_size} members` },
                ] : []),
                ...(event.deadline ? [
                  { icon: Calendar, label: 'Registration Deadline', value: formatDate(event.deadline), color: deadlinePassed ? 'var(--danger)' : 'var(--warning)' },
                ] : []),
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Icon size={14} style={{ color: color || 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team status */}
          {user && event.event_type === 'team' && myTeam && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Your Team</h2>
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 17 }}>{myTeam.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Share code: <strong style={{ color: 'var(--accent-light)', fontFamily: 'monospace', fontSize: 15 }}>{myTeam.team_code}</strong></p>
                  </div>
                  <Trophy size={28} style={{ color: 'var(--accent)', opacity: 0.7 }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(myTeam.members || []).filter(Boolean).map(m => m && (
                    <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 500 }}>
                      {m.name} {m.college && <span style={{ color: 'var(--text-muted)' }}>· {m.college}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Registrations</div>
              <div style={{ fontWeight: 800, fontSize: 28 }}>{event.registration_count || 0}</div>
            </div>

            {deadlinePassed ? (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--danger)', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 14 }}>
                Registration Closed
              </div>
            ) : !user ? (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '13px', marginBottom: 10 }}>Login to Register</button>
              </Link>
            ) : (
              <>
                {event.event_type === 'team' && !myTeam && (
                  <button onClick={() => setShowTeamModal(true)} className="btn-secondary" style={{ width: '100%', padding: '11px', marginBottom: 10, fontSize: 14 }}>
                    <Users size={14} style={{ marginRight: 6 }} /> Create / Join Team First
                  </button>
                )}
                <button
                  onClick={handleRegister}
                  className="btn-primary"
                  style={{ width: '100%', padding: '13px' }}
                  disabled={regLoading || (event.event_type === 'team' && !myTeam)}
                >
                  {regLoading ? 'Registering...' : event.event_type === 'team' && !myTeam ? 'Set Up Team First' : 'Register Now'}
                </button>
              </>
            )}

            {event.whatsapp_link && (
              <a href={event.whatsapp_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginTop: 10 }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '11px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <MessageCircle size={14} /> WhatsApp Group <ExternalLink size={12} />
                </button>
              </a>
            )}

            {event.event_type === 'team' && (
              <div style={{ marginTop: 16, padding: 14, background: 'rgba(124,58,237,0.06)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--accent-light)' }}>Team Event:</strong> Create a team or join one with a code. All members must register individually.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Modal */}
      <AnimatePresence>
        {showTeamModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTeamModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: 22 }}>Team Setup</h2>
                <button onClick={() => setShowTeamModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Mode toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--bg-secondary)', borderRadius: 12, padding: 4 }}>
                {['create', 'join'].map(mode => (
                  <button key={mode} onClick={() => setTeamMode(mode)} style={{
                    flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: 14,
                    background: teamMode === mode ? 'var(--bg-card)' : 'transparent',
                    color: teamMode === mode ? 'var(--accent-light)' : 'var(--text-secondary)',
                    boxShadow: teamMode === mode ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {mode === 'create' ? '🏆 Create Team' : '🤝 Join Team'}
                  </button>
                ))}
              </div>

              {teamMode === 'create' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Team Name</label>
                    <input type="text" placeholder="e.g. Alpha Coders" className="input-field" value={teamName} onChange={e => setTeamName(e.target.value)} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    A unique team code will be generated. Share it with your teammates so they can join.
                  </p>
                  <button onClick={handleCreateTeam} className="btn-primary" style={{ padding: '13px', width: '100%' }}>Create Team</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Team Code</label>
                    <input type="text" placeholder="e.g. AB12CD" className="input-field" style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}
                      value={teamCode} onChange={e => setTeamCode(e.target.value)} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Ask your team leader for the 6-character team code.
                  </p>
                  <button onClick={handleJoinTeam} className="btn-primary" style={{ padding: '13px', width: '100%' }}>Join Team</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
