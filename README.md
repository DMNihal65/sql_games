# 🩺 Data Surgeon — Trauma SQL Operating Theater

**Data Surgeon** is an interactive, gamified SQL learning simulation where you play as an emergency trauma database surgeon. Patients arrive in critical condition with corrupt medical databases, severed tables, and anomalous telemetry data. Your mission is to diagnose the pathology and operate using SQL to restore data integrity.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development operating theater
npm run dev

# 3. Build production bundle
npm run build
```

---

## 🌟 Key Features & Cyber-Medical UX

- 🫀 **Live ECG Heartbeat Telemetry**: An animated pulse monitor reflects patient condition and remaining stamina in real-time, accelerating during critical triage and flatlining upon exhaustion.
- 🔬 **Two Clinical Phases**:
  - **Diagnostic Phase (Stethoscope)**: Non-destructive exploratory querying (`SELECT`, `PRAGMA table_info`). DML is safely prevented to avoid damaging live tissue.
  - **Surgery Phase (Scalpel Active)**: Unlocks DML (`UPDATE`, `DELETE`, `INSERT`) and enables the glowing **Submit Final Fix** incision button.
- 🧬 **Interactive Schema Dissector**: Anatomical tree view where table columns remain shrouded until probed. Click any table or column name to insert directly into your query.
- 🔊 **Procedural Web Audio Engine**: Zero-asset realistic audio feedback synthesized directly in the browser (vital monitor beeps, critical flatline alarms, scalpel incisions, query success chords, and defibrillator restoration).
- 🤖 **Dr. Turing (Chief AI Data Surgeon)**: Powered by Google Gemini 2.5 Flash. Provides real-time clinical error triage in medical metaphors, tiered hints (Tier 1 logic -> Tier 2 syntax), post-op reviews, and can generate dynamic emergency cases on demand.
- 📊 **Target Diff & Telemetry Monitor**: Compare your query result set side-by-side with the target healthy database state and inspect SQLite execution plans (`EXPLAIN QUERY PLAN`).
- 🏆 **3-Star Surgical Rating & Progress Persistence**: Evaluates accuracy (50%), query speed (30%), and stamina preservation (20%). Stores streaks, unlocked tiers, high scores, and best queries in `localStorage`.

---

## 🏥 Clinical Case Roster

1. **Tier 1: Intern Resident**
   - *Case 1: Duplicate Patient Records* (`ROW_NUMBER()` / `MAX(created_at)`)
   - *Case 2: Emergency Triage NULL Vitals* (`COALESCE()`, `NULL` imputation)
2. **Tier 2: Junior Attending**
   - *Case 3: Fatal Drug Interaction Cross-Check* (Multi-table `INNER JOIN` & self-joins)
   - *Case 4: Operating Room Double-Booking Disaster* (Time interval overlap logic)
3. **Tier 3: Senior Surgeon**
   - *Case 5: ICU Sepsis Outlier Aggregation* (`GROUP BY`, `HAVING`, conditional `COUNT(CASE...)`)
   - *Case 6: Contaminated Vaccine Batch Recall* (`EXISTS` / `NOT EXISTS` correlated subqueries)
4. **Tier 4: Chief of Surgery**
   - *Case 7: Post-Op Infection Velocity & Moving Window* (Window functions `LAG`, `ROWS BETWEEN 2 PRECEDING`)
   - *Case 8: Organ Transplant Priority Allocation Queue* (Common Table Expressions `WITH CTE`, `DENSE_RANK()`)
5. **AI Emergency Ward**: Infinite procedurally generated trauma scenarios via Gemini.

---

## ⌨️ Surgical Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + Enter` / `Cmd + Enter` | Run Diagnostic / Test Surgical Query |
| `Ctrl + Shift + Enter` | Submit Final Surgical Solution |
| `Tab` | Indent SQL code by 2 spaces |
| `Esc` | Dismiss any open modal overlay |

---

## 🔒 Offline & Gemini Key Security

- All 8 standard clinical cases run **100% offline** in your browser using in-memory WebAssembly SQLite (`sql.js`).
- Gemini API key is stored securely in your browser's `localStorage` and never transmitted to any third-party server.
