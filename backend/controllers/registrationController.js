const { db } = require('../config/firebase');

// POST /api/register
const registerForEvent = async (req, res) => {
  try {
    const { event_id, team_id } = req.body;
    const user_id = req.user.id;

    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required.' });
    }

    // Get event
    const eventDoc = await db.collection('events').doc(event_id).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const event = eventDoc.data();

    // Check deadline
    if (event.deadline && new Date() > new Date(event.deadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed.' });
    }

    const regId = `${user_id}_${event_id}`;
    const regDoc = await db.collection('registrations').doc(regId).get();
    
    if (regDoc.exists) {
      return res.status(409).json({ error: 'You are already registered for this event.' });
    }

    if (event.event_type === 'team') {
      if (!team_id) {
        return res.status(400).json({ error: 'Team ID required for team events. Create or join a team first.' });
      }
      
      const teamDoc = await db.collection('teams').doc(team_id).get();
      if (!teamDoc.exists) {
        return res.status(404).json({ error: 'Team not found.' });
      }
      const team = teamDoc.data();
      
      if (!team.members || !team.members.includes(user_id)) {
        return res.status(403).json({ error: 'You are not a member of this team.' });
      }

      await db.collection('registrations').doc(regId).set({
        user_id,
        event_id,
        team_id,
        registered_at: new Date().toISOString()
      });
    } else {
      await db.collection('registrations').doc(regId).set({
        user_id,
        event_id,
        registered_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: 'Registered successfully! 🎉',
      whatsappLink: event.whatsapp_link || null,
      event: { id: eventDoc.id, title: event.title, event_type: event.event_type }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Failed to register.' });
  }
};

// GET /api/register/my
const getMyRegistrations = async (req, res) => {
  try {
    const user_id = req.user.id;
    const regsSnapshot = await db.collection('registrations').where('user_id', '==', user_id).get();
    
    let registrations = [];
    
    for (const doc of regsSnapshot.docs) {
      const regData = doc.data();
      
      let eventData = {};
      const eventDoc = await db.collection('events').doc(regData.event_id).get();
      if (eventDoc.exists) {
        eventData = eventDoc.data();
      }
      
      let teamData = {};
      if (regData.team_id) {
        const teamDoc = await db.collection('teams').doc(regData.team_id).get();
        if (teamDoc.exists) {
          teamData = teamDoc.data();
        }
      }
      
      registrations.push({
        id: doc.id,
        ...regData,
        title: eventData.title,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        venue: eventData.venue,
        event_type: eventData.event_type,
        image_url: eventData.image_url,
        whatsapp_link: eventData.whatsapp_link,
        team_name: teamData.name || null,
        team_code: teamData.team_code || null
      });
    }

    registrations.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    res.json({ registrations });
  } catch (err) {
    console.error('Get registrations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
};

module.exports = { registerForEvent, getMyRegistrations };
