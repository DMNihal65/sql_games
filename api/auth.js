import { sql } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const action = req.query.action || (req.url?.includes('signup') ? 'signup' : req.url?.includes('login') ? 'login' : 'me');

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { email, password, username = 'Dr. Surgeon', avatar = '🩺' } = body;

      // Signup Action
      if (action === 'signup' || body.action === 'signup') {
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        try {
          const created = await sql`
            INSERT INTO sql_arcade_users (id, email, username, password_hash, avatar)
            VALUES (${userId}, ${cleanEmail}, ${username.trim()}, ${password}, ${avatar})
            RETURNING id, email, username, avatar, role, created_at;
          `;

          // Initialize default progress for data_surgeon
          await sql`
            INSERT INTO sql_arcade_user_progress (id, user_id, game_id, level, xp, streak, solved_count, last_played_date)
            VALUES (${`${userId}_data_surgeon`}, ${userId}, 'data_surgeon', 1, 0, 1, 0, ${new Date().toDateString()})
            ON CONFLICT DO NOTHING;
          `;

          return res.status(200).json({
            user: created[0],
            progress: { level: 1, xp: 0, streak: 1, solved_count: 0 }
          });
        } catch (dbErr) {
          if (dbErr.message?.includes('unique') || dbErr.message?.includes('duplicate')) {
            return res.status(409).json({ error: 'An account with this email already exists' });
          }
          throw dbErr;
        }
      }

      // Login Action
      if (action === 'login' || body.action === 'login') {
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const users = await sql`
          SELECT id, email, username, avatar, role, password_hash, created_at 
          FROM sql_arcade_users 
          WHERE email = ${cleanEmail} OR username = ${email.trim()}
          LIMIT 1;
        `;

        if (users.length === 0 || users[0].password_hash !== password) {
          return res.status(401).json({ error: 'Invalid email/username or password' });
        }

        const user = users[0];
        delete user.password_hash;

        // Fetch progress
        const prog = await sql`
          SELECT * FROM sql_arcade_user_progress 
          WHERE user_id = ${user.id} AND game_id = 'data_surgeon'
          LIMIT 1;
        `;

        let progress = prog[0];
        if (!progress) {
          const initProg = await sql`
            INSERT INTO sql_arcade_user_progress (id, user_id, game_id, level, xp, streak, solved_count, last_played_date)
            VALUES (${`${user.id}_data_surgeon`}, ${user.id}, 'data_surgeon', 1, 0, 1, 0, ${new Date().toDateString()})
            RETURNING *;
          `;
          progress = initProg[0];
        }

        return res.status(200).json({ user, progress });
      }
    }

    if (req.method === 'GET') {
      const { userId = 'guest_surgeon' } = req.query;
      const users = await sql`
        SELECT id, email, username, avatar, role, created_at 
        FROM sql_arcade_users 
        WHERE id = ${userId} 
        LIMIT 1;
      `;

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const prog = await sql`
        SELECT * FROM sql_arcade_user_progress 
        WHERE user_id = ${userId} AND game_id = 'data_surgeon'
        LIMIT 1;
      `;

      return res.status(200).json({ user: users[0], progress: prog[0] || null });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Auth Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
