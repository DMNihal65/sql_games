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
      const { userId = 'guest_surgeon', gameId = 'data_surgeon', level, status, limit = 50 } = req.query || {};
      
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

      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
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

      if (!caseId || !title) {
        return res.status(400).json({ error: 'Missing required caseId or title' });
      }

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

      return res.status(200).json(result[0]);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Cases Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
