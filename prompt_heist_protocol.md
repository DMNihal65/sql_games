# Build Prompt: Heist Protocol — SQL MVP

## Your Task
Build a complete, playable React web app called **Heist Protocol**. It is a single-player SQL learning game where the player is a digital infiltrator stealing data from procedurally designed vaults (databases). Use **React 18+**, **sql.js** (SQLite in the browser via WASM), and **Tailwind CSS** (or plain CSS). No backend. Everything client-side. Persist progress in `localStorage`.

## Game Concept
Each day the player gets one target (a bank, casino, crypto exchange, etc.). The vault is a SQLite database. The player must extract specific data without triggering alarms. There are two distinct phases: **Recon** (discover the schema) and **Extraction** (steal the data). Some tables are **honeypots** — querying them triggers an alarm and fails the heist immediately.

## Core Mechanics
1. **Daily Case Rotation**: Pool of 8 pre-built heists. One active per calendar day. Past heists remain playable if unlocked. Heist #1 is unlocked immediately.
2. **Two Phases**:
   - **Recon Phase**: The schema is completely hidden. The player sees only a blinking terminal. They must run SQL to discover tables (`SELECT name FROM sqlite_master WHERE type='table'`). They have **10 Recon queries**. All queries are read-only. If they query a honeypot table during Recon, the alarm triggers and the heist fails immediately. The player can click "Begin Extraction" at any time to lock in their recon knowledge and move to phase 2.
   - **Extraction Phase**: The player has **1 single query attempt** to write the perfect extraction SQL. This query must return exactly the target data. No second chances. If the query touches a honeypot table, alarm triggers. If the query is inefficient (full table scan on a large table, or execution time > 50ms), stealth score drops.
3. **Alarm System**: Honeypot tables have names like `security_logs`, `admin_audit`, `intrusion_alerts`, `sys_keys`. The player must learn to avoid them. If a query's `FROM` or `JOIN` clause references a honeypot, instant fail.
4. **Scoring**:
   - **Accuracy (50%)**: Does the final query return the exact expected rows and columns?
   - **Stealth (40%)**: Did they avoid honeypots? Was the query efficient? Did they use indexes implicitly via `WHERE` clauses?
   - **Recon Efficiency (10%)**: Did they discover the vault layout in fewer than 10 queries?
   - Show a 3-star rating and a "Heat Level" (0% = ghost, 100% = caught).
5. **Debrief**: After extraction, show:
   - Success or "Alarm Triggered" / "Wrong Data"
   - Their score and heat level
   - The optimal extraction query
   - Which tables were honeypots (revealed after attempt)
   - A tip on how to be stealthier
6. **Progression / Tiers**:
   - Tier 1 (Heists 1-2): 3 tables (1 vault, 1 honeypot, 1 decoy). Simple `SELECT` extraction.
   - Tier 2 (Heists 3-4): 5 tables (1 vault, 2 honeypots, 2 decoys). Requires `JOIN` across 2 tables.
   - Tier 3 (Heists 5-6): 6 tables (1 vault, 2 honeypots, 3 decoys). Requires filtering + aggregation.
   - Tier 4 (Heists 7-8): 8 tables (1 vault, 3 honeypots, 4 decoys). Complex multi-table extraction with time-based filters.

## Data Model for a Heist
```js
{
  id: 'heist-001',
  tier: 1,
  target: 'Ironclad National Bank',
  narrative: 'We need the names and account numbers of all VIP clients with a balance over $500,000. The vault has decoy tables and security honeypots. Do not touch anything that looks like logs or audits.',
  schemaSQL: `
    CREATE TABLE vip_clients (id INTEGER, name TEXT, account_number TEXT, balance REAL, status TEXT);
    CREATE TABLE transactions (id INTEGER, amount REAL, date TEXT); -- decoy
    CREATE TABLE security_logs (id INTEGER, event TEXT); -- HONEYPOT
  `,
  seedSQL: `INSERT INTO vip_clients VALUES ...`,
  honeypots: ['security_logs'], // table names that trigger alarm
  objective: 'Extract name and account_number of all VIP clients where balance > 500000.',
  hiddenSolution: 'SELECT name, account_number FROM vip_clients WHERE balance > 500000',
  expectedResult: [['Alice Vault', 'ACC-7721'], ...],
  hints: ['Look for tables related to clients, not systems', 'Check sqlite_master for all table names'],
  concepts: ['SELECT', 'WHERE', 'sqlite_master'],
  difficulty: 'beginner'
}
```

## UI Requirements
- **Top Bar**: Game title "Heist Protocol", current date, total score, infiltration streak.
- **Main Terminal**: Dark hacker aesthetic. Green/amber text on black. Monospace font.
- **Phase Indicator**: Big text showing [RECON] or [EXTRACTION]. In Recon, show remaining queries (e.g., "RECON QUERIES LEFT: 7/10"). In Extraction, show "SINGLE SHOT — MAKE IT COUNT".
- **SQL Input**: Textarea with a "Execute" button in Recon, and "Extract" button in Extraction. In Extraction, require a confirmation dialog because it's one shot.
- **Vault Map**: A visual panel showing discovered tables. Initially empty. As the player discovers tables, they appear as "nodes". Honeypots, if discovered via schema queries, are shown with a skull icon but are NOT named as honeypots until after the heist ends. Decoys show as generic folders.
- **Alarm Overlay**: If triggered, the screen flashes red, a siren sound effect placeholder (visual only), and "CONNECTION TERMINATED" appears.
- **Result Panel**: Shows query output table, execution time, and row count.
- **Debrief Screen**: Shows target image (text-based), success/fail, score breakdown (Accuracy / Stealth / Recon), optimal query, and "Next Target" button.
- **Heist Select**: Grid of target folders. Locked = redacted. Unlocked = target name + best score.

## Technical Constraints
- Use `sql.js` in-memory database. Re-initialize per heist attempt.
- Parse every player query before execution to check if it references a honeypot table name (case-insensitive). If yes, trigger alarm immediately without executing.
- In Extraction phase, compare the final query's result set (sorted, normalized) against `expectedResult`.
- Use `localStorage` for: `heist_progress`, `heist_streak`, `heist_lastPlayedDate`.
- All heist data in `src/heists.js`.
- No backend. No external APIs.
- Keep under 10 main files. Make the UI feel like a terminal + dossier hybrid.
- Responsive: stack terminal and vault map on mobile.

## Deliverables
Generate a complete, runnable React application including:
1. `package.json`
2. `src/heists.js` with 8 fully populated, realistic heists
3. `src/App.js` and components
4. WASM loading setup for sql.js
5. `README.md` with run instructions
