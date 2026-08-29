// Medical Data Surgeon AI Generator & Memory Learning Engine
import { AiProvider } from './aiProvider';

export const SURGEON_RANKS = [
  {
    level: 1,
    rank: 'Intern Resident',
    icon: '🔬',
    category: 'Patient Intake & Basic Filtering',
    topics: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT', 'Column Aliases'],
    description: 'Query central intake registries, filter patient admissions by ward, blood group, or age, and sort records.',
    requiredXp: 0,
    targetXp: 200 // Requires ~8 cases
  },
  {
    level: 2,
    rank: 'Junior Resident',
    icon: '🩺',
    category: 'Telemetry Drops & NULL Imputation',
    topics: ['COALESCE()', 'IS NULL', 'LIKE', 'IN', 'BETWEEN', 'CASE WHEN'],
    description: 'Impute missing vitals from faulty sensor drops, pattern match doctor notes, and format emergency alerts.',
    requiredXp: 200,
    targetXp: 450 // Requires ~10 cases
  },
  {
    level: 3,
    rank: 'Senior Resident',
    icon: '📊',
    category: 'ICU Telemetry & Sepsis Aggregation',
    topics: ['COUNT()', 'AVG()', 'SUM()', 'GROUP BY', 'HAVING', 'ROUND()'],
    description: 'Aggregate hourly ICU telemetry, detect septic fever spike outliers, and compute ward patient averages.',
    requiredXp: 450,
    targetXp: 750 // Requires ~12 cases
  },
  {
    level: 4,
    rank: 'Fellow Surgeon',
    icon: '💊',
    category: 'Pharmacology & Schedule Conflicts',
    topics: ['INNER JOIN', 'LEFT JOIN', 'Self-Join', 'Relational Overlaps'],
    description: 'Cross-reference prescription contraindications, correlate patient-doctor assignments, and resolve OR double-bookings.',
    requiredXp: 750,
    targetXp: 1100
  },
  {
    level: 5,
    rank: 'Attending Surgeon',
    icon: '☣️',
    category: 'Batch Recalls & Correlated Subqueries',
    topics: ['NOT EXISTS', 'EXISTS', 'Correlated Subqueries', 'Subqueries in WHERE / FROM'],
    description: 'Isolate contaminated pharmaceutical batch administrations and patients who have never received clean replacements.',
    requiredXp: 1100,
    targetXp: 1500
  },
  {
    level: 6,
    rank: 'Chief Surgeon',
    icon: '🪟',
    category: 'Infection Velocity & Window Analytics',
    topics: ['ROW_NUMBER()', 'RANK() / DENSE_RANK()', 'LAG() / LEAD()', 'Moving Averages'],
    description: 'Calculate moving 3-day post-op infection moving averages, triage velocity, and department compensation ranks.',
    requiredXp: 1500,
    targetXp: 1950
  },
  {
    level: 7,
    rank: 'Department Head',
    icon: '🫀',
    category: 'Organ Allocation & CTE Pipelines',
    topics: ['WITH CTE (Common Table Expressions)', 'Deduplication', 'Multi-factor Priority'],
    description: 'Construct transplant priority queues with multi-factor scoring pipelines and deduplicate botched ETL migrations.',
    requiredXp: 1950,
    targetXp: 2450
  },
  {
    level: 8,
    rank: 'Director of Medical Data',
    icon: '👑',
    category: 'Hospital-Wide Trauma Crisis',
    topics: ['Complex Real-World Cleanse', 'Multi-CTE Analytics', 'End-to-End Surgery'],
    description: 'Perform complex multi-table crisis restorations combining subqueries, window functions, and CTE pipelines.',
    requiredXp: 2450,
    targetXp: 3000
  }
];

export class AiCaseEngine {
  // Generate a realistic, solvable clinical patient case dynamically via OpenRouter / Gemini with Memory Injection
  static async generateClinicalCase(levelNum = 1, solvedHistory = []) {
    const rankInfo = SURGEON_RANKS.find(r => r.level === levelNum) || SURGEON_RANKS[0];

    // Build memory context from past solved cases at this rank
    let memoryPrompt = '';
    const relevantHistory = solvedHistory.filter(c => c.level === levelNum).slice(0, 5);
    if (relevantHistory.length > 0) {
      const pastTitles = relevantHistory.map(h => `"${h.title}" (tested: ${h.concepts?.join(', ') || 'basics'})`).join('; ');
      memoryPrompt = `\n[Surgeon Memory Context]: The user has already mastered these past cases at this rank: [${pastTitles}].\nGenerate a NEW, NOVEL scenario with different clinical entities and slightly more advanced edge cases for this rank. Avoid repeating the exact same problem structure.`;
    }

    const systemPrompt = `You are the Chief AI Medical Systems Architect. You generate valid SQLite clinical scenarios for "Data Surgeon", an interactive SQL game where players heal corrupted hospital databases.
Output ONLY raw valid JSON (no markdown backticks, no preamble).

JSON Schema:
{
  "id": "patient-case-${Date.now()}",
  "level": ${levelNum},
  "rankTitle": "${rankInfo.rank}",
  "patientName": "Realistic Patient Name or Clinical Ward",
  "patientAge": 38,
  "condition": "Medical Pathology (e.g. Telemetry Glitch, Toxic Dosage Overlap, Sepsis Outlier)",
  "severity": "Moderate | High | Critical",
  "title": "Short Catchy Case Title",
  "narrative": "A 2-sentence medical story explaining the database corruption and why the clinical team urgently needs the clean data.",
  "schemaSQL": "CREATE TABLE ... (valid SQLite DDL for 1 or 2 tables)",
  "seedSQL": "INSERT INTO ... (valid SQLite DML with 5-8 realistic clinical rows)",
  "objective": "Unambiguous instructions specifying the exact columns and ORDER BY required in the final output.",
  "hiddenSolution": "SELECT ... (the exact correct canonical SQLite query)",
  "hints": ["Helpful clinical hint 1", "Helpful SQL hint 2"],
  "concepts": ["Concept1", "Concept2"]
}`;

    const userPrompt = `Generate a realistic Rank ${levelNum} clinical SQL scenario.
Rank: ${rankInfo.rank}
Category: ${rankInfo.category}
Target SQL Concepts: ${rankInfo.topics.join(', ')}
${memoryPrompt}

Requirements:
1. Valid SQLite syntax that runs cleanly in WebAssembly SQLite.
2. The hiddenSolution query produces at least 1-6 rows when executed against seedSQL.
3. The objective clearly specifies all column names and ORDER BY sorting order.
Output pure JSON only.`;

    try {
      const parsed = await AiProvider.generateJsonCompletion(systemPrompt, userPrompt);
      if (parsed.schemaSQL && parsed.hiddenSolution && parsed.objective) {
        return parsed;
      }
    } catch (err) {
      console.warn('AI dynamic case generation error, using fallback:', err);
    }

    return this.getResilientClinicalFallback(levelNum);
  }

  // Clinical Error Diagnosis with AI
  static async explainClinicalSqlError(errorMsg, userSql, currentCase) {
    try {
      const systemPrompt = "You are Dr. Turing, Senior Attending Data Surgeon. Explain SQL errors concisely in 2 sentences in a medical context.";
      const userPrompt = `Explain this SQL error concisely:
Case: ${currentCase.title}
Patient: ${currentCase.patientName} (${currentCase.condition})
Objective: ${currentCase.objective}
Surgeon SQL:
${userSql}
SQL Error:
${errorMsg}`;

      const res = await AiProvider.generateJsonCompletion(
        systemPrompt,
        userPrompt + "\nOutput JSON: {\"explanation\": \"...\"}"
      );
      if (res?.explanation) return res.explanation;
    } catch {
      // Fallback
    }

    return 'Check that table names, column names, and SQL clauses match the patient database schema.';
  }

  // Neon DB Serverless Sync APIs
  static async fetchProfile(userId = 'guest_surgeon') {
    try {
      const res = await fetch(`/api/progress?userId=${userId}&gameId=data_surgeon`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Neon profile fetch offline fallback:', err);
    }
    return null;
  }

  static async saveProfile(profileData) {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Neon profile save offline fallback:', err);
    }
    return null;
  }

  static async fetchPastCases(userId = 'guest_surgeon', filter = {}) {
    try {
      const params = new URLSearchParams({ userId, ...filter });
      const res = await fetch(`/api/cases?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Neon cases fetch offline fallback:', err);
    }
    return [];
  }

  static async saveCase(caseData) {
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Neon case save offline fallback:', err);
    }
    return null;
  }

  static getResilientClinicalFallback(levelNum) {
    const fallbacks = {
      1: {
        id: `patient-fallback-1-${Date.now()}`,
        level: 1,
        rankTitle: 'Intern Resident',
        patientName: 'Admissions Central Registry (Ward 3B)',
        patientAge: 54,
        condition: 'Emergency Triage Backlog',
        severity: 'Moderate',
        title: 'Emergency Intake Roster',
        narrative: 'The emergency intake registry received several trauma patient admissions during night shift. The triage nurse needs an active roster of all patients in "Critical" or "Urgent" condition with systolic blood pressure over 130.',
        schemaSQL: `
          CREATE TABLE emergency_intake (
            intake_id INTEGER PRIMARY KEY,
            patient_name TEXT,
            blood_type TEXT,
            condition_severity TEXT,
            systolic_bp INTEGER,
            ward_no INTEGER
          );
        `,
        seedSQL: `
          INSERT INTO emergency_intake VALUES
          (1, 'Marcus Vance', 'O+', 'Critical', 145, 102),
          (2, 'Sarah Jenkins', 'A-', 'Stable', 115, 103),
          (3, 'David Kim', 'B+', 'Urgent', 138, 102),
          (4, 'Elena Rostova', 'O-', 'Critical', 160, 101),
          (5, 'Chloe Bennett', 'AB+', 'Stable', 120, 104),
          (6, 'Liam Cooper', 'A+', 'Urgent', 125, 105);
        `,
        objective: 'Select intake_id, patient_name, blood_type, systolic_bp, and ward_no for patients where condition_severity IN ("Critical", "Urgent") AND systolic_bp > 130. Order by systolic_bp DESC.',
        hiddenSolution: `
          SELECT intake_id, patient_name, blood_type, systolic_bp, ward_no
          FROM emergency_intake
          WHERE condition_severity IN ('Critical', 'Urgent') AND systolic_bp > 130
          ORDER BY systolic_bp DESC;
        `,
        hints: [
          'Filter with condition_severity IN ("Critical", "Urgent") AND systolic_bp > 130.',
          'Sort output with ORDER BY systolic_bp DESC.'
        ],
        concepts: ['SELECT', 'WHERE', 'IN', 'AND', 'ORDER BY']
      },
      2: {
        id: `patient-fallback-2-${Date.now()}`,
        level: 2,
        rankTitle: 'Junior Resident',
        patientName: 'Amara Vance (Telemetry Bed 04)',
        patientAge: 29,
        condition: 'Sensor Drop Asystole',
        severity: 'High',
        title: 'Sensor Drop Imputation',
        narrative: 'A telemetry packet glitch caused several heart_rate and systolic_bp telemetry readings to be recorded as NULL. The telemetry monitor needs an emergency imputed vital record where missing heart rates default to 75 and missing systolic_bp defaults to 120.',
        schemaSQL: `
          CREATE TABLE telemetry_logs (
            log_id INTEGER PRIMARY KEY,
            patient_name TEXT,
            heart_rate INTEGER,
            systolic_bp INTEGER,
            recorded_time TEXT
          );
        `,
        seedSQL: `
          INSERT INTO telemetry_logs VALUES
          (101, 'Amara Vance', 118, 140, '12:00'),
          (102, 'Amara Vance', NULL, 135, '12:05'),
          (103, 'Amara Vance', 112, NULL, '12:10'),
          (104, 'Amara Vance', NULL, NULL, '12:15'),
          (105, 'Carlos Ruiz', 80, 115, '12:00');
        `,
        objective: 'Query all logs for "Amara Vance", replacing NULL heart_rate with 75 and NULL systolic_bp with 120. Return columns: log_id, sanitized_hr (heart_rate), sanitized_bp (systolic_bp), recorded_time ordered by log_id ASC.',
        hiddenSolution: `
          SELECT 
            log_id,
            COALESCE(heart_rate, 75) AS sanitized_hr,
            COALESCE(systolic_bp, 120) AS sanitized_bp,
            recorded_time
          FROM telemetry_logs
          WHERE patient_name = 'Amara Vance'
          ORDER BY log_id ASC;
        `,
        hints: [
          'Use COALESCE(heart_rate, 75) AS sanitized_hr and COALESCE(systolic_bp, 120) AS sanitized_bp.'
        ],
        concepts: ['COALESCE()', 'NULL Handling', 'Aliases']
      }
    };

    return fallbacks[levelNum] || fallbacks[1];
  }
}
