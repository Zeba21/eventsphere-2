const { db } = require('../config/firebase');

// GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let eventsQuery = db.collection('events');
    if (type && (type === 'individual' || type === 'team')) {
      eventsQuery = eventsQuery.where('event_type', '==', type);
    }
    
    const snapshot = await eventsQuery.get();
    let events = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Simple client-side search since Firestore doesn't support ILIKE
      if (search) {
        const s = search.toLowerCase();
        if (!data.title.toLowerCase().includes(s) && !data.description.toLowerCase().includes(s)) {
          continue;
        }
      }
      
      let creator_name = 'Unknown';
      if (data.created_by) {
        const userDoc = await db.collection('users').doc(data.created_by).get();
        if (userDoc.exists) creator_name = userDoc.data().name;
      }
      
      const regSnapshot = await db.collection('registrations').where('event_id', '==', doc.id).count().get();
      const registration_count = regSnapshot.data().count;
      
      events.push({ id: doc.id, ...data, creator_name, registration_count });
    }
    
    // Sort by date ascending (using JS sort since we might have filtered by search locally)
    events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    
    res.json({ events });
  } catch (err) {
    console.error('Get events error:', err.message);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('events').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    const data = doc.data();
    let creator_name = 'Unknown';
    if (data.created_by) {
      const userDoc = await db.collection('users').doc(data.created_by).get();
      if (userDoc.exists) creator_name = userDoc.data().name;
    }
    
    const regSnapshot = await db.collection('registrations').where('event_id', '==', id).count().get();
    const registration_count = regSnapshot.data().count;
    
    res.json({ event: { id: doc.id, ...data, creator_name, registration_count } });
  } catch (err) {
    console.error('Get event error:', err.message);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
};

// POST /api/events (admin)
const createEvent = async (req, res) => {
  try {
    const {
      title, description, event_date, event_time, deadline,
      venue, location, coordinator_name, contact_info,
      image_url, whatsapp_link, event_type,
      max_team_size, min_team_size, max_participants
    } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and event date are required.' });
    }

    const newEvent = {
      title, description, event_date, event_time: event_time || null, deadline: deadline || null,
      venue, location, coordinator_name, contact_info,
      image_url: image_url || null, whatsapp_link: whatsapp_link || null, event_type: event_type || 'individual',
      max_team_size: max_team_size || 1, min_team_size: min_team_size || 1, max_participants: max_participants || null,
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('events').add(newEvent);

    res.status(201).json({ message: 'Event created successfully!', event: { id: docRef.id, ...newEvent } });
  } catch (err) {
    console.error('Create event error:', err.message);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

// PUT /api/events/:id (admin)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, event_date, event_time, deadline,
      venue, location, coordinator_name, contact_info,
      image_url, whatsapp_link, event_type,
      max_team_size, min_team_size, max_participants
    } = req.body;

    const eventRef = db.collection('events').doc(id);
    const doc = await eventRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    const updateData = {
      title, description, event_date, event_time, deadline,
      venue, location, coordinator_name, contact_info,
      image_url, whatsapp_link, event_type,
      max_team_size, min_team_size, max_participants
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await eventRef.update(updateData);
    
    const updatedDoc = await eventRef.get();
    res.json({ message: 'Event updated!', event: { id, ...updatedDoc.data() } });
  } catch (err) {
    console.error('Update event error:', err.message);
    res.status(500).json({ error: 'Failed to update event.' });
  }
};

// DELETE /api/events/:id (admin)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventRef = db.collection('events').doc(id);
    const doc = await eventRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const batch = db.batch();
    batch.delete(eventRef);

    // Delete related registrations
    const regs = await db.collection('registrations').where('event_id', '==', id).get();
    regs.docs.forEach(r => batch.delete(r.ref));

    // Delete related teams
    const teams = await db.collection('teams').where('event_id', '==', id).get();
    teams.docs.forEach(t => batch.delete(t.ref));

    await batch.commit();

    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('Delete event error:', err.message);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
