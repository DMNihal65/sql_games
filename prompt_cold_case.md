# Build Prompt: Cold Case — SQL MVP

## Your Task
Build a complete, playable React web app called **Cold Case**. It is a single-player SQL learning game where the player is a noir detective solving murders by reverse-engineering a completely undocumented database. Use **React 18+**, **sql.js** (SQLite in the browser via WASM), and **Tailwind CSS** (or plain CSS). No backend. Everything client-side. Persist progress in `localStorage`.

## Game Concept
Each day the player gets one cold case file. They know the victim, the date, and a short narrative. They have access to a police database, but **there is zero schema documentation**. They must use SQL to discover what tables exist, what columns they have, and what data means. They must find the correct suspect and submit both the SQL query that identifies the suspect AND a written explanation of the evidence chain. The game validates the query result and uses a simple rule-based check (or pre-stored logic) to verify the explanation covers the key facts.

## Core Mechanics
1. **Daily Case Rotation**: Pool of 8 pre-built cases. One per calendar day. Unlocked progressively. Case #1 unlocked immediately.
2. **Blind Discovery**: The player starts with no schema visible. They must run:
   - `SELECT name FROM sqlite_master WHERE type='table'` to find tables
   - `PRAGMA table_info(table_name)` to find columns
   - Then explore data with `SELECT * FROM table LIMIT 5`
3. **Red Herrings**: Each case has 2-3 tables that look suspicious but are irrelevant. For example, a table named `murder_weapon` that only contains generic item data, or `anonymous_tips` that are all dead ends. The real evidence is in relational data (phone logs, financials, alibis).
4. **The Accusation**: When the player thinks they know the killer, they click "Make Accusation". This opens a form with:
   - **Evidence Query**: A textarea where they paste the SQL query that returns the suspect's name/ID and supporting facts.
   - **Evidence Narrative**: A textarea where they explain in 2-5 sentences *why* this suspect, using specific data points (e.g., "Suspect X had no alibi between 9-11 PM, received a $50k transfer from the victim the day before, and was spotted at the crime location per the sightings table").
5. **Validation**:
   - **Query Check**: Run the player's query. Does it return the correct `solutionSuspectId` (or name) as the first column of the first row? If not, wrong suspect.
   - **Explanation Check**: The case object has a `requiredEvidencePoints` array (e.g., `["no_alibi", "financial_transfer", "location_sighting"]`). The player's explanation text must contain keywords associated with at least 2 of these points (simple keyword matching is fine for MVP). If they found the right suspect but their explanation is nonsense, the case is marked "Lucky Guess — Incomplete".
6. **Grading**:
   - **Correct Suspect + Valid Explanation**: Case Solved. 3 stars.
   - **Correct Suspect + Weak Explanation**: Case Closed (Dubious). 1 star.
   - **Wrong Suspect**: Cold Case Remains Open. 0 stars.
   - **Bonus**: "Master Detective" badge if solved in under 8 discovered tables and under 15 total queries.
7. **Debrief**: Show the correct suspect, the optimal evidence query, a breakdown of the evidence chain, and which red herrings fooled the player (if any).
8. **Progression / Tiers**:
   - Tier 1 (Cases 1-2): 4 tables, 1 red herring. Simple `JOIN` between persons and phone_records.
   - Tier 2 (Cases 3-4): 5 tables, 2 red herrings. Requires `JOIN` + time filtering.
   - Tier 3 (Cases 5-6): 6 tables, 2 red herrings. Requires aggregation (e.g., who had the most contact with victim).
   - Tier 4 (Cases 7-8): 7 tables, 3 red herrings. Complex multi-step reasoning (financial + location + alibi + witness).

## Data Model for a Case
```js
{
  id: 'coldcase-001',
  tier: 1,
  title: 'The Harbor Murder',
  narrative: 'On October 14th, 1987, shipping magnate Victor Hale was found dead at the docks. The database contains persons of interest, phone records, and harbor sightings. Find the killer.',
  schemaSQL: `
    CREATE TABLE persons (id INTEGER, name TEXT, occupation TEXT, alibi TEXT);
    CREATE TABLE phone_records (caller_id INTEGER, receiver_id INTEGER, call_time TEXT, duration INTEGER);
    CREATE TABLE harbor_sightings (person_id INTEGER, location TEXT, sighting_time TEXT);
    CREATE TABLE police_reports (id INTEGER, report_text TEXT); -- RED HERRING
  `,
  seedSQL: `INSERT INTO persons VALUES (1, 'Victor Hale', 'Victim', 'Deceased'), (2, 'Diana Cross', 'Business Partner', 'Home alone'), ...`,
  redHerrings: ['police_reports'], // tables that look important but aren't
  solutionSuspectId: 2, // Diana Cross
  solutionSuspectName: 'Diana Cross',
  hiddenSolutionQuery: 'SELECT p.name, p.occupation FROM persons p JOIN phone_records ph ON p.id = ph.caller_id JOIN harbor_sightings h ON p.id = h.person_id WHERE ph.receiver_id = 1 AND ph.call_time LIKE "1987-10-13%" AND h.sighting_time LIKE "1987-10-14%" AND h.location = "Docks"',
  requiredEvidencePoints: [
    { id: 'phone_contact', keywords: ['phone', 'call', 'contact', 'receiver'], description: 'Called the victim the night before' },
    { id: 'location', keywords: ['dock', 'harbor', 'sighting', 'spotted'], description: 'Spotted at the crime scene' },
    { id: 'motive', keywords: ['partner', 'business', 'money', 'deal'], description: 'Business relationship with victim' }
  ],
  expectedResult: [['Diana Cross', 'Business Partner']],
  hints: ['Check who the victim spoke to last', 'Who was seen at the docks?'],
  concepts: ['JOIN', 'LIKE', 'date filtering', 'schema discovery'],
  difficulty: 'beginner'
}
```

## UI Requirements
- **Aesthetic**: Noir detective. Dark grey/black background, cream/sepia paper accents for the case file, typewriter-style fonts for narrative, monospace green terminal for SQL. Think 1940s detective desk meets hacker terminal.
- **Top Bar**: "Cold Case Unit", current streak, detective rank (based on cases solved: Rookie → Investigator → Sergeant → Lieutenant → Chief).
- **Case File Panel (Left)**: Manila folder aesthetic. Victim photo placeholder (colored square with initials), date, narrative text, and a "Case Notes" textarea where the player can type their own observations (saved per case in localStorage).
- **SQL Terminal (Center)**: Dark terminal. Prompt is `>`. Query history shown above current input like a real terminal scrollback. Show table output below. Error messages in red.
- **Discovery Log (Right)**: Automatically logs every table and column the player discovers. Like a notebook being filled in. Red herrings discovered are marked with a "?" until the case ends.
- **Accusation Modal**: Triggered by "Make Accusation" button. Two-step form: (1) Paste your evidence query, (2) Write your evidence narrative. Submit runs validation.
- **Debrief Screen**: Case closed envelope aesthetic. Shows:
   - Suspect mugshot placeholder (colored block with name)
   - Verdict: Solved / Dubious / Unsolved
   - Evidence chain checklist (which points the player found vs missed)
   - Optimal query
   - "Case Closed" stamp graphic (CSS-based)
- **Case Board (Select Screen)**: Cork board aesthetic. Cases are pinned index cards. Solved cases have a green string connecting them. Unsolved are faded.

## Technical Constraints
- Use `sql.js` in-memory database. Fresh DB per case attempt.
- All case data lives in `src/cases.js`.
- `localStorage` keys: `cc_progress`, `cc_notes` (player's case notes), `cc_streak`, `cc_rank`, `cc_lastPlayedDate`.
- Explanation validation: simple keyword matching against `requiredEvidencePoints` keywords. Count how many points are covered. Require at least 2 out of 3 for a valid explanation. This avoids needing an LLM API.
- No backend. No external APIs. Fully offline after install.
- Keep the app under 10 main source files.
- Responsive: stack case file, terminal, and discovery log vertically on mobile.

## Deliverables
Generate a complete, runnable React application including:
1. `package.json`
2. `src/cases.js` with 8 fully populated, realistic, solvable cold cases
3. `src/App.js` and all necessary components
4. sql.js WASM loading setup
5. `README.md` with `npm install && npm start` instructions
