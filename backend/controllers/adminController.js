const { db } = require('../config/firebase');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    let users = [];

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      
      const regCountSnap = await db.collection('registrations').where('user_id', '==', doc.id).count().get();
      const registration_count = regCountSnap.data().count;

      const teamsLedSnap = await db.collection('teams').where('leader_id', '==', doc.id).count().get();
      const teams_led = teamsLedSnap.data().count;

      users.push({
        id: doc.id,
        ...data,
        registration_count,
        teams_led
      });
    }

    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [usersSnap, eventsSnap, regsSnap, teamsSnap] = await Promise.all([
      db.collection('users').where('role', '==', 'student').count().get(),
      db.collection('events').count().get(),
      db.collection('registrations').count().get(),
      db.collection('teams').count().get()
    ]);

    const totalStudents = usersSnap.data().count;
    const totalEvents = eventsSnap.data().count;
    const totalRegistrations = regsSnap.data().count;
    const totalTeams = teamsSnap.data().count;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEventsSnap = await db.collection('events')
      .where('event_date', '>=', todayStr)
      .orderBy('event_date', 'asc')
      .limit(5)
      .get();

    let upcomingEvents = [];
    for (const doc of upcomingEventsSnap.docs) {
      const eData = doc.data();
      const countSnap = await db.collection('registrations').where('event_id', '==', doc.id).count().get();
      upcomingEvents.push({
        id: doc.id,
        title: eData.title,
        event_date: eData.event_date,
        event_type: eData.event_type,
        reg_count: countSnap.data().count
      });
    }

    res.json({
      stats: {
        totalStudents,
        totalEvents,
        totalRegistrations,
        totalTeams,
      },
      upcomingEvents
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

// GET /api/admin/events/:id/registrations
const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    
    const regsSnap = await db.collection('registrations').where('event_id', '==', id).get();
    let registrations = [];

    for (const doc of regsSnap.docs) {
      const rData = doc.data();
      
      let uData = {};
      const userDoc = await db.collection('users').doc(rData.user_id).get();
      if (userDoc.exists) uData = userDoc.data();

      let tData = {};
      if (rData.team_id) {
        const teamDoc = await db.collection('teams').doc(rData.team_id).get();
        if (teamDoc.exists) tData = teamDoc.data();
      }

      registrations.push({
        id: doc.id,
        registered_at: rData.registered_at,
        name: uData.name || 'Unknown',
        email: uData.email || 'Unknown',
        college: uData.college || null,
        phone: uData.phone || null,
        team_name: tData.name || null,
        team_code: tData.team_code || null
      });
    }

    registrations.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    res.json({ registrations });
  } catch (err) {
    console.error('Get event registrations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
};

module.exports = { getAllUsers, getDashboardStats, getEventRegistrations };
