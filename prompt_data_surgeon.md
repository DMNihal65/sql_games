# Build Prompt: Data Surgeon — SQL MVP

## Your Task
Build a complete, playable React web app called **Data Surgeon**. It is a single-player SQL learning game where the player is a surgeon fixing corrupted medical databases (patients). Use **React 18+**, **sql.js** (SQLite in the browser via WASM), and **Tailwind CSS** (or plain CSS if you prefer). No backend. Everything runs client-side. Persist progress in `localStorage`.

## Game Concept
Each day the player gets one "patient" (a database case). A patient has a medical narrative, a partially visible schema, and a data corruption problem. The player writes SQL to diagnose and then fix the issue. They have a **stamina bar** (limit of 15 SQL executions per case) to force thoughtful querying. After submitting their final fix query, the game checks correctness against hidden expected results, scores them on accuracy and query elegance, and shows a debrief.

## Core Mechanics
1. **Daily Case Rotation**: The app has a pool of 8 pre-built cases. It shows exactly one case per calendar day (based on local date), but the player can browse past unlocked cases. Case #1 is unlocked immediately.
2. **Two Phases per Case**:
   - **Diagnosis Phase**: Schema is partially visible (table names shown, column names hidden until the player runs `PRAGMA table_info(table_name)` or a `SELECT`). Player can run up to 10 exploratory queries. These must be read-only (`SELECT`, `PRAGMA`). Any DML (`UPDATE`, `DELETE`, `INSERT`) triggers a warning and does not execute.
   - **Surgery Phase**: Player clicks "Scalpel Ready" to begin surgery. They now have 5 more query attempts to write the final fix. DML is allowed here. They submit one final query as their answer.
3. **Stamina System**: 15 total queries per case. Display a visual stamina bar. Each query execution decrements it. If stamina hits 0, the case ends in failure and the player must retry tomorrow or use a "retry" button that resets the case.
4. **Evaluation**: Compare the player's final query result set (sorted) against a hidden expected result set (sorted). If they match row-for-row and column-for-column, it's a success. Also check if the query is efficient (no unnecessary full table scans on large tables — use `EXPLAIN QUERY PLAN` via sql.js if possible, otherwise just time it).
5. **Scoring**: 50% correctness, 30% efficiency (query speed / simplicity), 20% stamina preserved. Show a 3-star rating.
6. **Debrief**: After submission, show:
   - Whether the patient survived
   - Their score and stars
   - The optimal solution query (pre-written in the case data)
   - A brief explanation of the SQL concepts used
7. **Progression**: Cases are tiered:
   - Tier 1 (Cases 1-2): Basic `SELECT`, `WHERE`, `NULL` handling
   - Tier 2 (Cases 3-4): `JOINs`, relationships
   - Tier 3 (Cases 5-6): Aggregations, `GROUP BY`, `HAVING`, subqueries
   - Tier 4 (Cases 7-8): Window functions, CTEs, complex cleansing

## Data Model for a Case
Each case is a JavaScript object in a `cases.js` file:
```js
{
  id: 'surgeon-001',
  tier: 1,
  title: 'Duplicate Patient Records',
  narrative: 'Patient John Doe has three duplicate entries in the system after a botched ETL migration. The most recent record should be preserved.',
  schemaSQL: `CREATE TABLE patients (id INTEGER, name TEXT, email TEXT, created_at TEXT);`,
  seedSQL: `INSERT INTO patients VALUES (1, 'John Doe', 'john@example.com', '2024-01-01'), (2, 'John Doe', 'john@example.com', '2024-06-01'), ...`,
  objective: 'Remove duplicates keeping the most recent created_at per email. Return the cleaned list.',
  hiddenSolution: 'SELECT id, name, email, created_at FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn FROM patients) WHERE rn = 1',
  expectedResult: [[2, 'John Doe', 'john@example.com', '2024-06-01'], ...], // pre-computed expected output
  hints: ['Look at the created_at dates', 'Window functions can help partition data'],
  concepts: ['ROW_NUMBER', 'PARTITION BY', 'CTE'],
  difficulty: 'beginner'
}
```

## UI Requirements
- **Top Bar**: Game title "Data Surgeon", current streak (days played consecutively), player total score.
- **Left Panel (Patient File)**: Narrative text, objective, tier badge, stamina bar.
- **Center Panel (SQL Terminal)**: A `<textarea>` for SQL input, an **Execute** button, and a **Submit Final Query** button (only enabled in Surgery phase). Show query history below (collapsible list of past queries and their results/errors).
- **Right Panel (Schema Explorer)**: Tree view of tables. Initially only table names visible. When player runs `PRAGMA table_info(x)` or `SELECT * FROM x LIMIT 0`, reveal that table's columns.
- **Bottom Panel (Results)**: Table output of the last query, or error message in red. Show execution time in ms.
- **Debrief Modal**: Overlay that appears after submission with score, stars, optimal query, and explanation. Buttons: "Back to Cases", "Retry Case".
- **Case Select Screen**: Grid of patient files. Locked cases are greyed out. Unlocked cases show pass/fail status. Unlock rule: complete previous case to unlock next.

## Technical Constraints
- Use `sql.js` loaded from CDN or npm. Initialize one in-memory DB per case. Load `schemaSQL` + `seedSQL` on case start.
- All case data lives in a static `src/cases.js` file. No API calls.
- `localStorage` keys: `ds_progress` (object mapping caseId -> {completed, score, stars, bestQuery}), `ds_streak`, `ds_lastPlayedDate`.
- Make it visually immersive with a medical theme: dark mode, monospace terminal font for SQL, green/amber/red vital-sign colors for success/warning/error. Use CSS gradients, not heavy images.
- Single `App.js` or split into logical components, but keep it simple enough that the entire app is under 10 files.
- Responsive down to mobile: stack panels vertically on small screens.

## Deliverables
Generate a complete, runnable React application. Include:
1. `package.json` with correct dependencies (react, react-dom, sql.js, etc.)
2. `src/cases.js` with 8 fully populated, realistic, and solvable cases
3. `src/App.js` and necessary components
4. `public/init.sql.js` or equivalent WASM loading setup
5. `README.md` with `npm install && npm start` instructions

Do not use any backend. Do not use any external APIs. The game must work entirely offline after `npm install`.
