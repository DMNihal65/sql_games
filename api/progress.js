import { sql } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { userId = 'guest_surgeon', gameId = 'data_surgeon' } = req.query || {};
      const rows = await sql`
        SELECT * FROM sql_arcade_user_progress 
        WHERE user_id = ${userId} AND game_id = ${gameId} 
        LIMIT 1;
      `;

      if (rows.length === 0) {
        const created = await sql`
          INSERT INTO sql_arcade_user_progress (id, user_id, game_id, level, xp, streak, solved_count, last_played_date)
          VALUES (${`${userId}_${gameId}`}, ${userId}, ${gameId}, 1, 0, 1, 0, ${new Date().toDateString()})
          RETURNING *;
        `;
        return res.status(200).json(created[0]);
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const {
        userId = 'guest_surgeon',
        gameId = 'data_surgeon',
        level = 1,
        xp = 0,
        streak = 1,
        solvedCount = 0,
        lastPlayedDate = new Date().toDateString()
      } = body;

      const progId = `${userId}_${gameId}`;

      const upserted = await sql`
        INSERT INTO sql_arcade_user_progress (id, user_id, game_id, level, xp, streak, solved_count, last_played_date, updated_at)
        VALUES (${progId}, ${userId}, ${gameId}, ${level}, ${xp}, ${streak}, ${solvedCount}, ${lastPlayedDate}, NOW())
        ON CONFLICT (user_id, game_id) DO UPDATE SET
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
    console.error('API Progress Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
