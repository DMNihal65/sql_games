import { sql } from './db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { userId = 'default_surgeon' } = req.query || {};
      const rows = await sql`
        SELECT * FROM surgeon_profiles WHERE user_id = ${userId} LIMIT 1;
      `;

      if (rows.length === 0) {
        // Create initial profile
        const created = await sql`
          INSERT INTO surgeon_profiles (user_id, username, level, xp, streak, solved_count, last_played_date)
          VALUES (${userId}, 'Dr. Resident', 1, 0, 1, 0, ${new Date().toDateString()})
          RETURNING *;
        `;
        return res.status(200).json(created[0]);
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const {
        userId = 'default_surgeon',
        username = 'Dr. Resident',
        level = 1,
        xp = 0,
        streak = 1,
        solvedCount = 0,
        lastPlayedDate = new Date().toDateString()
      } = body;

      const upserted = await sql`
        INSERT INTO surgeon_profiles (user_id, username, level, xp, streak, solved_count, last_played_date, updated_at)
        VALUES (${userId}, ${username}, ${level}, ${xp}, ${streak}, ${solvedCount}, ${lastPlayedDate}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          username = EXCLUDED.username,
          level = EXCLUDED.level,
          xp = EXCLUDED.xp,
          streak = EXCLUDED.streak,
          solved_count = EXCLUDED.solved_count,
          last_played_date = EXCLUDED.last_played_date,
          updated_at = NOW()
        RETURNING *;
      `;

      return res.status(200).json(upserted[0]);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Profile Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
