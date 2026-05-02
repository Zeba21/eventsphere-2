import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Trophy, Calendar, Star, ChevronDown } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import EventCard from '../components/student/EventCard';
import API from '../utils/api';

export default function HomePage({ darkMode, toggleDark }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    API.get('/events').then(r => {
      setEvents(r.data.events.slice(0, 6));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124,58,237,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const stats = [
    { icon: Calendar, value: '50+', label: 'Events Hosted' },
    { icon: Users, value: '2000+', label: 'Participants' },
    { icon: Trophy, value: '30+', label: 'Colleges' },
    { icon: Star, value: '4.9', label: 'Rating' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '120px 24px 60px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 100, padding: '6px 18px', marginBottom: 30,
            }}
          >
            <Zap size={13} style={{ color: 'var(--accent-light)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)' }}>
              Intercollegiate Event Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit', fontWeight: 900, lineHeight: 1.1,
              fontSize: 'clamp(42px, 8vw, 80px)', marginBottom: 24,
            }}
          >
            Where College{' '}
            <span className="gradient-text">Events</span>
            <br />Come Alive
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: 44, maxWidth: 600, margin: '0 auto 44px',
            }}
          >
            Register for inter-college competitions, hackathons, cultural fests and more.
            Form teams, connect with participants, and make your mark.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                style={{ padding: '14px 34px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                Explore Events <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn-secondary"
                style={{ padding: '14px 34px', fontSize: 16 }}
              >
                Create Account
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            style={{ marginTop: 70, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 12, fontWeight: 500 }}>Scroll to explore</span>
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Icon size={20} style={{ color: 'var(--accent-light)' }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 30, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 50 }}
        >
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', marginBottom: 12 }}>
            Upcoming <span className="gradient-text">Events</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Discover and register for the latest intercollegiate competitions
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 20, background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
                  <div className="skeleton" style={{ height: 20, marginBottom: 10, width: '70%' }} />
                  <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p>No events yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}

        {events.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                className="btn-secondary"
                style={{ padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                View All Events <ArrowRight size={15} />
              </motion.button>
            </Link>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 900, margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 24, padding: '60px 40px', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent)',
            borderRadius: '50%',
          }} />
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(22px, 4vw, 36px)', marginBottom: 14 }}>
            Ready to compete? <span className="gradient-text">Join Now</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
            Create your account and start registering for events across 30+ colleges.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register"><button className="btn-primary" style={{ padding: '13px 32px', fontSize: 15 }}>Get Started Free</button></Link>
            <Link to="/events"><button className="btn-secondary" style={{ padding: '13px 32px', fontSize: 15 }}>Browse Events</button></Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '28px 24px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: 13,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Zap size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>EventSphere</span>
        </div>
        <p>© {new Date().getFullYear()} EventSphere — Intercollegiate Event Platform</p>
      </footer>
    </div>
  );
}
