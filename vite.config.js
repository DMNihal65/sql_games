import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sql } from './api/db.js';

function neonDevApiPlugin() {
  return {
    name: 'neon-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;
        const query = Object.fromEntries(url.searchParams.entries());

        const getBody = () => new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch {
              resolve({});
            }
          });
        });

        res.setHeader('Content-Type', 'application/json');

        try {
          // AUTH API
          if (pathname.startsWith('/api/auth')) {
            const body = req.method === 'POST' ? await getBody() : {};
            const action = query.action || body.action || (pathname.includes('signup') ? 'signup' : pathname.includes('login') ? 'login' : 'me');

            if (action === 'signup') {
              const { email, password, username = 'Dr. Surgeon', avatar = '🩺' } = body;
              if (!email || !password) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Email and password required' }));
              }
              const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              try {
                const created = await sql`
                  INSERT INTO sql_arcade_users (id, email, username, password_hash, avatar)
                  VALUES (${userId}, ${email.trim().toLowerCase()}, ${username.trim()}, ${password}, ${avatar})
                  RETURNING id, email, username, avatar, role, created_at;
                `;
                await sql`
                  INSERT INTO sql_arcade_user_progress (id, user_id, game_id, level, xp, streak, solved_count, last_played_date)
                  VALUES (${`${userId}_data_surgeon`}, ${userId}, 'data_surgeon', 1, 0, 1, 0, ${new Date().toDateString()})
                  ON CONFLICT DO NOTHING;
                `;
                return res.end(JSON.stringify({
                  user: created[0],
                  progress: { level: 1, xp: 0, streak: 1, solved_count: 0 }
                }));
              } catch (e) {
                res.statusCode = 409;
                return res.end(JSON.stringify({ error: 'An account with this email already exists' }));
              }
            }

            if (action === 'login') {
              const { email, password } = body;
              const cleanEmail = (email || '').trim().toLowerCase();
              const users = await sql`
                SELECT id, email, username, avatar, role, password_hash 
                FROM sql_arcade_users 
                WHERE email = ${cleanEmail} OR username = ${email.trim()}
                LIMIT 1;
              `;
              if (users.length === 0 || users[0].password_hash !== password) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Invalid credentials' }));
              }
              const user = users[0];
              delete user.password_hash;

              const prog = await sql`
                SELECT * FROM sql_arcade_user_progress 
                WHERE user_id = ${user.id} AND game_id = 'data_surgeon'
                LIMIT 1;
              `;
              return res.end(JSON.stringify({ user, progress: prog[0] || { level: 1, xp: 0, streak: 1, solved_count: 0 } }));
            }

            if (req.method === 'GET') {
              const userId = query.userId || 'guest_surgeon';
              const users = await sql`
                SELECT id, email, username, avatar, role FROM sql_arcade_users WHERE id = ${userId} LIMIT 1;
              `;
              if (users.length === 0) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'User not found' }));
              }
              const prog = await sql`
                SELECT * FROM sql_arcade_user_progress WHERE user_id = ${userId} AND game_id = 'data_surgeon' LIMIT 1;
              `;
              return res.end(JSON.stringify({ user: users[0], progress: prog[0] || null }));
            }
          }

          // PROGRESS API
          if (pathname === '/api/progress') {
            if (req.method === 'GET') {
              const userId = query.userId || 'guest_surgeon';
              const gameId = query.gameId || 'data_surgeon';
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
                return res.end(JSON.stringify(created[0]));
              }
              return res.end(JSON.stringify(rows[0]));
            }

            if (req.method === 'POST') {
              const body = await getBody();
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
              return res.end(JSON.stringify(upserted[0]));
            }
          }

          // CASES API
          if (pathname === '/api/cases') {
            if (req.method === 'GET') {
              const userId = query.userId || 'guest_surgeon';
              const gameId = query.gameId || 'data_surgeon';
              const level = query.level;
              const status = query.status;
              const limit = query.limit || 50;

              let rows;
              if (level) {
                rows = await sql`
                  SELECT * FROM sql_arcade_cases 
                  WHERE user_id = ${userId} AND game_id = ${gameId} AND level = ${parseInt(level, 10)}
                  ORDER BY created_at DESC 
                  LIMIT ${parseInt(limit, 10)};
                `;
              } else if (status) {
                rows = await sql`
                  SELECT * FROM sql_arcade_cases 
                  WHERE user_id = ${userId} AND game_id = ${gameId} AND status = ${status}
                  ORDER BY created_at DESC 
                  LIMIT ${parseInt(limit, 10)};
                `;
              } else {
                rows = await sql`
                  SELECT * FROM sql_arcade_cases 
                  WHERE user_id = ${userId} AND game_id = ${gameId}
                  ORDER BY created_at DESC 
                  LIMIT ${parseInt(limit, 10)};
                `;
              }
              return res.end(JSON.stringify(rows));
            }

            if (req.method === 'POST') {
              const body = await getBody();
              const {
                caseId,
                userId = 'guest_surgeon',
                gameId = 'data_surgeon',
                level = 1,
                rankTitle = 'Intern Resident',
                title,
                patientName = 'Anonymous Patient',
                patientAge = 40,
                condition = 'Database Trauma',
                severity = 'Moderate',
                narrative = '',
                schemaSQL = '',
                seedSQL = '',
                objective = '',
                hiddenSolution = '',
                hints = [],
                concepts = [],
                status = 'unsolved',
                bestQuery = null,
                solvedAt = null
              } = body;

              const hintsJson = JSON.stringify(hints);
              const conceptsJson = JSON.stringify(concepts);

              const result = await sql`
                INSERT INTO sql_arcade_cases (
                  case_id, user_id, game_id, level, rank_title, title, patient_name, patient_age,
                  condition, severity, narrative, schema_sql, seed_sql, objective,
                  hidden_solution, hints, concepts, status, best_query, solved_at, created_at
                )
                VALUES (
                  ${caseId}, ${userId}, ${gameId}, ${level}, ${rankTitle}, ${title}, ${patientName}, ${patientAge},
                  ${condition}, ${severity}, ${narrative}, ${schemaSQL}, ${seedSQL}, ${objective},
                  ${hiddenSolution}, ${hintsJson}::jsonb, ${conceptsJson}::jsonb, ${status}, ${bestQuery}, 
                  ${solvedAt ? new Date(solvedAt) : null}, NOW()
                )
                ON CONFLICT (case_id) DO UPDATE SET
                  status = EXCLUDED.status,
                  best_query = COALESCE(EXCLUDED.best_query, sql_arcade_cases.best_query),
                  solved_at = COALESCE(EXCLUDED.solved_at, sql_arcade_cases.solved_at)
                RETURNING *;
              `;
              return res.end(JSON.stringify(result[0]));
            }
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
        } catch (err) {
          console.error('Local API Middleware Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Server Error' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), neonDevApiPlugin()],
  server: {
    port: 3000,
    open: false
  },
  optimizeDeps: {
    exclude: ['sql.js']
  }
});
