import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Calendar, Users, Eye,
  Search, ArrowLeft, Image, MessageCircle, MapPin,
  User, Save, AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', description: '', event_date: '', event_time: '',
  deadline: '', venue: '', location: '', coordinator_name: '',
  contact_info: '', image_url: '', whatsapp_link: '',
  event_type: 'individual', max_team_size: 4, min_team_size: 2, max_participants: '',
};

const LABEL = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' };
const REQ = { color: 'var(--danger)', marginLeft: 3 };

export default function AdminEvents({ darkMode, toggleDark }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryAction = new URLSearchParams(location.search).get('action');

  const [view, setView] = useState(queryAction === 'create' ? 'form' : 'list'); // 'list' | 'form'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewImg, setPreviewImg] = useState('');

  const load = () => {
    setLoading(true);
    API.get('/events').then(r => { setEvents(r.data.events); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (queryAction === 'create') openCreate(); }, [queryAction]);

  const openCreate = () => {
    setForm(emptyForm); setEditEvent(null);
    setPreviewImg(''); setView('form');
    navigate('/admin/events', { replace: true });
  };

  const openEdit = (ev) => {
    setEditEvent(ev);
    const f = {
      title: ev.title || '', description: ev.description || '',
      event_date: ev.event_date?.split('T')[0] || '',
      event_time: ev.event_time?.substring(0, 5) || '',
      deadline: ev.deadline ? new Date(ev.deadline).toISOString().slice(0, 16) : '',
      venue: ev.venue || '', location: ev.location || '',
      coordinator_name: ev.coordinator_name || '', contact_info: ev.contact_info || '',
      image_url: ev.image_url || '', whatsapp_link: ev.whatsapp_link || '',
      event_type: ev.event_type || 'individual',
      max_team_size: ev.max_team_size || 4, min_team_size: ev.min_team_size || 2,
      max_participants: ev.max_participants || '',
    };
    setForm(f); setPreviewImg(ev.image_url || ''); setView('form');
  };

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (k === 'image_url') setPreviewImg(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Event title is required');
    if (!form.event_date) return toast.error('Event date is required');
    setSaving(true);
    try {
      if (editEvent) {
        await API.put(`/events/${editEvent.id}`, form);
        toast.success('✅ Event updated successfully!');
      } else {
        await API.post('/events', form);
        toast.success('🎉 Event created successfully!');
      }
      setView('list'); setEditEvent(null); setForm(emptyForm); setPreviewImg('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      toast.success('Event deleted');
      setDeleteId(null); load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const filtered = events.filter(ev => {
    const matchType = typeFilter === 'all' || ev.event_type === typeFilter;
    const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) || (ev.venue || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  // ─── FORM VIEW ───────────────────────────────────────────────────────────────
  if (view === 'form') return (
    <AdminLayout darkMode={darkMode} toggleDark={toggleDark} title={editEvent ? 'Edit Event' : 'Create Event'}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {/* Back + heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button onClick={() => { setView('list'); setEditEvent(null); }}
            style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 22 }}>{editEvent ? 'Edit Event' : '✨ Create New Event'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{editEvent ? 'Update event details below' : 'Fill in the details to publish a new event'}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }} className="form-grid">

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Basic Info */}
              <Section title="Basic Information" icon={<Calendar size={15} />}>
                <div>
                  <label style={LABEL}>Event Title <span style={REQ}>*</span></label>
                  <input type="text" placeholder="e.g. National Hackathon 2025" required className="input-field" value={form.title} onChange={set('title')} />
                </div>
                <div>
                  <label style={LABEL}>Description</label>
                  <textarea placeholder="Describe the event, rules, prizes, eligibility..." className="input-field" rows={5} value={form.description} onChange={set('description')} style={{ resize: 'vertical', minHeight: 110 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={LABEL}>Event Date <span style={REQ}>*</span></label>
                    <input type="date" required className="input-field" value={form.event_date} onChange={set('event_date')} />
                  </div>
                  <div>
                    <label style={LABEL}>Event Time</label>
                    <input type="time" className="input-field" value={form.event_time} onChange={set('event_time')} />
                  </div>
                </div>
                <div>
                  <label style={LABEL}>Registration Deadline</label>
                  <input type="datetime-local" className="input-field" value={form.deadline} onChange={set('deadline')} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Registrations close automatically after this date & time</p>
                </div>
              </Section>

              {/* Venue */}
              <Section title="Venue & Location" icon={<MapPin size={15} />}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={LABEL}>Venue / Hall</label>
                    <input type="text" placeholder="e.g. Main Auditorium" className="input-field" value={form.venue} onChange={set('venue')} />
                  </div>
                  <div>
                    <label style={LABEL}>City / Location</label>
                    <input type="text" placeholder="e.g. Mumbai, Maharashtra" className="input-field" value={form.location} onChange={set('location')} />
                  </div>
                </div>
              </Section>

              {/* Coordinator */}
              <Section title="Coordinator Details" icon={<User size={15} />}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={LABEL}>Coordinator Name</label>
                    <input type="text" placeholder="Dr. John Doe" className="input-field" value={form.coordinator_name} onChange={set('coordinator_name')} />
                  </div>
                  <div>
                    <label style={LABEL}>Contact Info</label>
                    <input type="text" placeholder="+91 99999 99999 / email" className="input-field" value={form.contact_info} onChange={set('contact_info')} />
                  </div>
                </div>
              </Section>

              {/* Event Type */}
              <Section title="Event Type & Capacity" icon={<Users size={15} />}>
                <div>
                  <label style={LABEL}>Event Type <span style={REQ}>*</span></label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['individual', 'team'].map(t => (
                      <label key={t} style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${form.event_type === t ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.event_type === t ? 'rgba(124,58,237,0.08)' : 'var(--bg-secondary)',
                        transition: 'all 0.2s',
                      }}>
                        <input type="radio" name="event_type" value={t} checked={form.event_type === t} onChange={set('event_type')} style={{ accentColor: 'var(--accent)' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: form.event_type === t ? 'var(--accent-light)' : 'var(--text-primary)', textTransform: 'capitalize' }}>{t}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t === 'individual' ? 'Solo participants' : 'Grouped teams'}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {form.event_type === 'team' && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={LABEL}>Min Team Size</label>
                      <input type="number" min={1} max={20} className="input-field" value={form.min_team_size} onChange={set('min_team_size')} />
                    </div>
                    <div>
                      <label style={LABEL}>Max Team Size</label>
                      <input type="number" min={1} max={20} className="input-field" value={form.max_team_size} onChange={set('max_team_size')} />
                    </div>
                  </motion.div>
                )}
                <div>
                  <label style={LABEL}>Max Participants</label>
                  <input type="number" min={1} placeholder="Leave blank for unlimited" className="input-field" value={form.max_participants} onChange={set('max_participants')} />
                </div>
              </Section>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Image + Preview */}
              <Section title="Event Image" icon={<Image size={15} />}>
                <div>
                  <label style={LABEL}>Image URL</label>
                  <input type="url" placeholder="https://example.com/image.jpg" className="input-field" value={form.image_url} onChange={set('image_url')} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Paste a public image URL (Unsplash, Cloudinary, etc.)</p>
                </div>
                <div style={{
                  height: 170, borderRadius: 12, overflow: 'hidden',
                  border: '2px dashed var(--border)', background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  {previewImg ? (
                    <img src={previewImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setPreviewImg('')} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Image size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <p style={{ fontSize: 12 }}>Image preview</p>
                    </div>
                  )}
                </div>
              </Section>

              {/* WhatsApp */}
              <Section title="WhatsApp Group" icon={<MessageCircle size={15} />}>
                <div>
                  <label style={LABEL}>WhatsApp Group Link</label>
                  <input type="url" placeholder="https://chat.whatsapp.com/..." className="input-field" value={form.whatsapp_link} onChange={set('whatsapp_link')} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Participants will be redirected here after registration</p>
                </div>
              </Section>

              {/* Submit */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : editEvent ? 'Update Event' : 'Publish Event'}
                </button>
                <button type="button" onClick={() => { setView('list'); setEditEvent(null); }} className="btn-secondary" style={{ width: '100%', padding: '11px', fontSize: 14 }}>
                  Cancel
                </button>
                {editEvent && (
                  <button type="button" onClick={() => setDeleteId(editEvent.id)} style={{
                    width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.06)', color: 'var(--danger)',
                    fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Trash2 size={13} /> Delete Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Delete confirm */}
      <DeleteModal deleteId={deleteId} onCancel={() => setDeleteId(null)} onConfirm={async () => { await handleDelete(deleteId); setView('list'); }} />

      <style>{`
        @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </AdminLayout>
  );

  // ─── LIST VIEW ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout darkMode={darkMode} toggleDark={toggleDark} title="Manage Events">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search events..." className="input-field" style={{ paddingLeft: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'individual', 'team'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '9px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1px solid', fontFamily: 'Outfit',
                borderColor: typeFilter === t ? 'var(--accent)' : 'var(--border)',
                background: typeFilter === t ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                color: typeFilter === t ? 'var(--accent-light)' : 'var(--text-secondary)',
                transition: 'all 0.2s', textTransform: 'capitalize',
              }}>{t}</button>
            ))}
          </div>
          <button onClick={openCreate} className="btn-primary" style={{ padding: '10px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Plus size={15} /> Create Event
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Showing {filtered.length} of {events.length} events
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <Calendar size={52} style={{ margin: '0 auto 18px', opacity: 0.25 }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>
              {events.length === 0 ? 'No events yet' : 'No results found'}
            </h3>
            <p style={{ marginBottom: 22, fontSize: 14 }}>{events.length === 0 ? 'Create your first event to get started' : 'Try a different search or filter'}</p>
            {events.length === 0 && <button onClick={openCreate} className="btn-primary" style={{ padding: '11px 26px' }}>Create First Event</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filtered.map((ev, i) => (
              <motion.div key={ev.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {/* Image */}
                <div style={{ height: 150, overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                  {ev.image_url
                    ? <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Calendar size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} /></div>
                  }
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span className={`tag ${ev.event_type === 'team' ? 'tag-team' : 'tag-individual'}`} style={{ fontSize: 10 }}>{ev.event_type}</span>
                  </div>
                </div>

                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>{ev.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} style={{ color: 'var(--accent)' }} /> {formatDate(ev.event_date)}
                    </span>
                    {ev.venue && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={11} style={{ color: 'var(--accent2)' }} /> {ev.venue}
                    </span>}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent-light)' }}>{ev.registration_count || 0}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>REGISTRATIONS</div>
                    </div>
                    {ev.event_type === 'team' && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent2)' }}>{ev.max_team_size || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>MAX/TEAM</div>
                      </div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: new Date(ev.event_date) >= new Date() ? '#10b981' : 'var(--text-muted)' }}>
                        {new Date(ev.event_date) >= new Date() ? '✓' : '✗'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {new Date(ev.event_date) >= new Date() ? 'UPCOMING' : 'PAST'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <Link to={`/admin/events/${ev.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <button className="btn-secondary" style={{ width: '100%', padding: '8px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Eye size={12} /> View
                      </button>
                    </Link>
                    <button onClick={() => openEdit(ev)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteId(ev.id)} className="btn-danger" style={{ padding: '8px 12px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <DeleteModal deleteId={deleteId} onCancel={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </AdminLayout>
  );
}

// Section wrapper
function Section({ title, icon, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

// Delete modal
function DeleteModal({ deleteId, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {deleteId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '36px 32px', maxWidth: 380, textAlign: 'center', width: '100%' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertTriangle size={28} style={{ color: 'var(--danger)' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Delete Event?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 26, lineHeight: 1.6 }}>
              This will permanently delete the event and all associated registrations and teams. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
              <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--danger)', color: 'white', fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
