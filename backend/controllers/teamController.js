const { admin, db } = require('../config/firebase');

// Generate a random 6-char team code
const generateTeamCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// POST /api/teams/create
const createTeam = async (req, res) => {
  try {
    const { name, event_id } = req.body;
    const user_id = req.user.id;

    if (!name || !event_id) {
      return res.status(400).json({ error: 'Team name and event ID are required.' });
    }

    // Check event exists and is team-type
    const eventDoc = await db.collection('events').doc(event_id).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const event = eventDoc.data();
    if (event.event_type !== 'team') {
      return res.status(400).json({ error: 'This event does not require teams.' });
    }

    // Check if user already has a team for this event
    const existingTeamSnap = await db.collection('teams')
      .where('event_id', '==', event_id)
      .where('members', 'array-contains', user_id)
      .get();

    if (!existingTeamSnap.empty) {
      return res.status(409).json({ error: 'You already belong to a team for this event.' });
    }

    let team_code = generateTeamCode();
    // Ensure uniqueness
    let codeExists = true;
    while (codeExists) {
      const check = await db.collection('teams').where('team_code', '==', team_code).get();
      if (check.empty) codeExists = false;
      else team_code = generateTeamCode();
    }

    const newTeam = {
      name,
      team_code,
      leader_id: user_id,
      event_id,
      members: [user_id],
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('teams').add(newTeam);

    res.status(201).json({
      message: 'Team created! Share the code with your teammates.',
      team: { id: docRef.id, ...newTeam }
    });
  } catch (err) {
    console.error('Create team error:', err.message);
    res.status(500).json({ error: 'Failed to create team.' });
  }
};

// POST /api/teams/join
const joinTeam = async (req, res) => {
  try {
    const { team_code } = req.body;
    const user_id = req.user.id;

    if (!team_code) {
      return res.status(400).json({ error: 'Team code is required.' });
    }

    const teamSnap = await db.collection('teams').where('team_code', '==', team_code.toUpperCase()).get();

    if (teamSnap.empty) {
      return res.status(404).json({ error: 'Invalid team code.' });
    }

    const teamDoc = teamSnap.docs[0];
    const team = teamDoc.data();

    // Check if already in this team
    if (team.members && team.members.includes(user_id)) {
      return res.status(409).json({ error: 'You are already in this team.' });
    }

    // Check if already in another team for this event
    const anotherTeam = await db.collection('teams')
      .where('event_id', '==', team.event_id)
      .where('members', 'array-contains', user_id)
      .get();

    if (!anotherTeam.empty) {
      return res.status(409).json({ error: 'You already belong to a team for this event.' });
    }

    const eventDoc = await db.collection('events').doc(team.event_id).get();
    const event = eventDoc.data();

    // Check team size
    const totalMembers = (team.members ? team.members.length : 0) + 1;

    if (event.max_team_size && totalMembers > event.max_team_size) {
      return res.status(400).json({ error: 'Team is already full.' });
    }

    await teamDoc.ref.update({
      members: admin.firestore.FieldValue.arrayUnion(user_id)
    });

    res.json({ message: 'Joined team successfully!', team: { id: teamDoc.id, ...team, members: [...(team.members||[]), user_id] } });
  } catch (err) {
    console.error('Join team error:', err.message);
    res.status(500).json({ error: 'Failed to join team.' });
  }
};

// GET /api/teams/my/:event_id
const getMyTeam = async (req, res) => {
  try {
    const { event_id } = req.params;
    const user_id = req.user.id;

    const teamSnap = await db.collection('teams')
      .where('event_id', '==', event_id)
      .where('members', 'array-contains', user_id)
      .get();

    if (teamSnap.empty) {
      return res.json({ team: null });
    }

    const teamDoc = teamSnap.docs[0];
    const teamData = teamDoc.data();

    let membersDetails = [];
    for (const memberId of teamData.members) {
      const uDoc = await db.collection('users').doc(memberId).get();
      if (uDoc.exists) {
        membersDetails.push({ id: uDoc.id, ...uDoc.data() });
      }
    }

    let leader_name = 'Unknown';
    if (teamData.leader_id) {
      const leaderDoc = await db.collection('users').doc(teamData.leader_id).get();
      if (leaderDoc.exists) leader_name = leaderDoc.data().name;
    }

    res.json({ team: { id: teamDoc.id, ...teamData, members: membersDetails, leader_name } });
  } catch (err) {
    console.error('Get team error:', err.message);
    res.status(500).json({ error: 'Failed to fetch team.' });
  }
};

module.exports = { createTeam, joinTeam, getMyTeam };
