import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';

const fallbackImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
];

export default function EventCard({ event, index = 0 }) {
  const imageUrl = event.image_url || fallbackImages[index % fallbackImages.length];
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate >= new Date();
  const deadlinePassed = event.deadline && new Date() > new Date(event.deadline);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          onError={e => { e.target.src = fallbackImages[0]; }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,15,0.8) 0%, transparent 60%)',
        }} />

        {/* Date badge */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderRadius: 10, padding: '6px 12px',
          textAlign: 'center', lineHeight: 1.2,
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
            {eventDate.getDate()}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            {monthNames[eventDate.getMonth()]}
          </div>
        </div>

        {/* Type badge */}
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <span className={`tag ${event.event_type === 'team' ? 'tag-team' : 'tag-individual'}`}>
            {event.event_type === 'team' ? <Users size={10} /> : null}
            {event.event_type}
          </span>
        </div>

        {/* Status */}
        {deadlinePassed && (
          <div style={{
            position: 'absolute', bottom: 14, right: 14,
            background: 'rgba(239,68,68,0.9)', borderRadius: 6,
            padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'white',
          }}>
            Closed
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <h3 style={{
          fontWeight: 700, fontSize: 17, marginBottom: 8,
          color: 'var(--text-primary)', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {event.title}
        </h3>

        {event.description && (
          <p style={{
            color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 16,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.description}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {event.venue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              <MapPin size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {event.venue}
              </span>
            </div>
          )}
          {event.event_time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              <Clock size={13} style={{ color: 'var(--accent2)', flexShrink: 0 }} />
              {event.event_time}
            </div>
          )}
          {event.event_type === 'team' && event.max_team_size && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              <Users size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
              Team: {event.min_team_size}–{event.max_team_size} members
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {event.registration_count !== undefined && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {event.registration_count} registered
            </span>
          )}
          <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: '9px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              View Details <ArrowRight size={13} />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
