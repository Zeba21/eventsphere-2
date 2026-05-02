import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(user.role === 'admin' ? '/admin' : '/events');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Login failed';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to your account">
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={labelStyle}>Email Address</label>
        <div style={{ position: 'relative' }}>
          <Mail size={16} style={iconStyle} />
          <input
            type="email" placeholder="you@college.edu" required
            className="input-field" style={{ paddingLeft: 42 }}
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} style={iconStyle} />
          <input
            type={showPwd ? 'text' : 'password'} placeholder="••••••••" required
            className="input-field" style={{ paddingLeft: 42, paddingRight: 42 }}
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <button type="button" onClick={() => setShowPwd(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <button type="submit" className="btn-primary" style={{ marginTop: 6, width: '100%', padding: '13px' }} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
      </p>
      <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
        Admin demo: <strong>admin@college.edu</strong> / <strong>password</strong>
      </div>
    </form>
  </AuthLayout>;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to EventSphere 🎉');
      navigate('/events');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Registration failed';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout title="Join EventSphere" subtitle="Create your student account">
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input type="text" placeholder="Your name" required className="input-field" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label style={labelStyle}>College Name</label>
          <input type="text" placeholder="Your college" className="input-field" value={form.college} onChange={set('college')} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Email Address *</label>
        <input type="email" placeholder="you@college.edu" required className="input-field" value={form.email} onChange={set('email')} />
      </div>
      <div>
        <label style={labelStyle}>Phone Number</label>
        <input type="tel" placeholder="+91 99999 99999" className="input-field" value={form.phone} onChange={set('phone')} />
      </div>
      <div>
        <label style={labelStyle}>Password *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" required
            className="input-field" style={{ paddingRight: 42 }}
            value={form.password} onChange={set('password')}
          />
          <button type="button" onClick={() => setShowPwd(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <button type="submit" className="btn-primary" style={{ marginTop: 4, width: '100%', padding: '13px' }} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </form>
  </AuthLayout>;
}

// Shared layout
function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* BG orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent)', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)', filter: 'blur(40px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 500, position: 'relative', zIndex: 1,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 24, padding: '40px 40px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EventSphere
          </span>
        </Link>
        <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>{subtitle}</p>
        {children}
      </motion.div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };
const iconStyle = { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };

export default LoginPage;
