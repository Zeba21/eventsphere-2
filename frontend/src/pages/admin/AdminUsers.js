import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, ClipboardList, Trophy, Building2, Phone, Mail, ShieldCheck, GraduationCap } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';

const AVATAR_COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

export default function AdminUsers({ darkMode, toggleDark }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/admin/users').then(r => {
      setUsers(r.data.users);
      setFiltered(r.data.users);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = users;
    if (roleFilter !== 'all') res = res.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.college || '').toLowerCase().includes(q));
    }
    setFiltered(res);
  }, [search, roleFilter, users]);

  const students = users.filter(u => u.role === 'student');
  const admins = users.filter(u => u.role === 'admin');
  const totalRegs = users.reduce((s, u) => s + parseInt(u.registration_count || 0), 0);
  const withCollege = users.filter(u => u.college).length;

  return (
    <AdminLayout darkMode={darkMode} toggleDark={toggleDark} title="Manage Users">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* Summary stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Students', value: students.length, icon: GraduationCap, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
            { label: 'Admins', value: admins.length, icon: ShieldCheck, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Total Registrations', value: totalRegs, icon: ClipboardList, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'With College', value: withCollege, icon: Building2, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {loading ? '—' : value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search by name, email, college..." className="input-field" style={{ paddingLeft: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'student', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} style={{
                padding: '9px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1px solid', fontFamily: 'Outfit', transition: 'all 0.2s', textTransform: 'capitalize',
                borderColor: roleFilter === r ? 'var(--accent)' : 'var(--border)',
                background: roleFilter === r ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                color: roleFilter === r ? 'var(--accent-light)' : 'var(--text-secondary)',
              }}>{r === 'all' ? 'All' : r}</button>
            ))}
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Showing {filtered.length} of {users.length} users
        </p>

        {/* User list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--text-secondary)' }}>
            <Users size={52} style={{ margin: '0 auto 18px', opacity: 0.25 }} />
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, color: 'var(--text-primary)' }}>No users found</h3>
            <p>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Column header */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 2.5fr 2fr 1fr 1fr', gap: 12, padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }} className="user-header">
              <span>#</span><span>Name</span><span>Email</span><span>College</span><span>Regs</span><span>Role</span>
            </div>

            {filtered.map((user, i) => {
              const avatarColor = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
              const isExpanded = selected === user.id;
              return (
                <motion.div key={user.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ background: 'var(--bg-card)', border: `1px solid ${isExpanded ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
                >
                  {/* Row */}
                  <div
                    onClick={() => setSelected(isExpanded ? null : user.id)}
                    style={{ display: 'grid', gridTemplateColumns: '40px 2fr 2.5fr 2fr 1fr 1fr', gap: 12, padding: '14px 16px', alignItems: 'center', cursor: 'pointer' }}
                    className="user-row"
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>{i + 1}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: user.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 13, color: 'white', boxShadow: `0 2px 8px ${avatarColor}44`,
                      }}>
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{user.name}</p>
                        {user.phone && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.phone}</p>}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.college || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ClipboardList size={13} style={{ color: 'var(--accent)' }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{user.registration_count || 0}</span>
                    </div>

                    <div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                        background: user.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'rgba(124,58,237,0.1)',
                        color: user.role === 'admin' ? '#f59e0b' : 'var(--accent-light)',
                        border: `1px solid ${user.role === 'admin' ? 'rgba(245,158,11,0.25)' : 'rgba(124,58,237,0.2)'}`,
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                      }}>
                        {user.role === 'admin' ? <ShieldCheck size={10} /> : <GraduationCap size={10} />}
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresenceInline show={isExpanded}>
                    <div style={{ padding: '0 16px 18px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                        {[
                          { icon: Mail, label: 'Email', value: user.email },
                          { icon: Phone, label: 'Phone', value: user.phone || 'Not provided' },
                          { icon: Building2, label: 'College', value: user.college || 'Not provided' },
                          { icon: ClipboardList, label: 'Registrations', value: user.registration_count || 0 },
                          { icon: Trophy, label: 'Teams Led', value: user.teams_led || 0 },
                          { icon: ShieldCheck, label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                              <Icon size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AnimatePresenceInline>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <style>{`
        @media (max-width: 900px) {
          .user-header { display: none !important; }
          .user-row { grid-template-columns: 2fr 1fr 1fr !important; }
          .user-row > div:nth-child(3), .user-row > div:nth-child(4) { display: none; }
        }
      `}</style>
    </AdminLayout>
  );
}

function AnimatePresenceInline({ show, children }) {
  const { AnimatePresence, motion } = require('framer-motion');
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
