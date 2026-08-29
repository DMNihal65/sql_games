// Cold Case Noir Detective AI Case Generator & Memory Learning Engine
import { AiProvider } from './aiProvider';

export const DETECTIVE_RANKS = [
  {
    level: 1,
    rank: 'Rookie Patrolman',
    icon: '🕵️‍♂️',
    category: 'Basic Suspect Intake & Phone Logs',
    topics: ['SELECT', 'WHERE', 'ORDER BY', 'Simple JOIN'],
    description: 'Investigate simple murder scenes. 4 tables, 1 red herring. Cross-reference persons with phone records.',
    requiredXp: 0,
    targetXp: 200
  },
  {
    level: 2,
    rank: 'Junior Detective',
    icon: '🔍',
    category: 'Alibi Timelines & Sightings',
    topics: ['JOIN', 'LIKE', 'Time Intervals', 'BETWEEN'],
    description: 'Cross-reference witness sightings with suspect alibis during the exact time of death. 5 tables, 2 red herrings.',
    requiredXp: 200,
    targetXp: 450
  },
  {
    level: 3,
    rank: 'Homicide Investigator',
    icon: '📂',
    category: 'Financial Transfers & Aggregation',
    topics: ['GROUP BY', 'HAVING', 'COUNT()', 'SUM()'],
    description: 'Detect suspicious bank wire transfers and call frequency spikes prior to the homicide. 6 tables, 2 red herrings.',
    requiredXp: 450,
    targetXp: 750
  },
  {
    level: 4,
    rank: 'Senior Inspector',
    icon: '🎙️',
    category: 'Multi-table Relational Forensics',
    topics: ['Multi-table JOINs', 'Self-Joins', 'COALESCE', 'IS NULL'],
    description: 'Correlate hotel keycard logs, vehicle registrations, and financial motives.',
    requiredXp: 750,
    targetXp: 1100
  },
  {
    level: 5,
    rank: 'Forensic Specialist',
    icon: '🧬',
    category: 'Correlated Subqueries & Exclusions',
    topics: ['EXISTS', 'NOT EXISTS', 'Subqueries in WHERE', 'UNION'],
    description: 'Isolate suspects who possess matching DNA/ballistics and have zero verifiable alibis.',
    requiredXp: 1100,
    targetXp: 1500
  },
  {
    level: 6,
    rank: 'Lead Detective',
    icon: '🗂️',
    category: 'Window Functions & Call Sequence Logs',
    topics: ['ROW_NUMBER()', 'LAG() / LEAD()', 'DENSE_RANK()'],
    description: 'Track the exact sequential order of communications leading up to the murder.',
    requiredXp: 1500,
    targetXp: 1950
  },
  {
    level: 7,
    rank: 'Captain of Homicide',
    icon: '📜',
    category: 'Conspiracy Networks & CTE Pipelines',
    topics: ['WITH CTE', 'Multi-step Pipeline', 'Deduplication'],
    description: 'Unravel syndicate murder conspiracies involving multiple conspirators and shell corporations.',
    requiredXp: 1950,
    targetXp: 2450
  },
  {
    level: 8,
    rank: 'Chief of Detectives',
    icon: '⭐',
    category: 'Master Crime Forensics',
    topics: ['Master Forensics', 'Complex Relational Analysis'],
    description: 'Solve cold cases thought to be impossible, combining all investigative SQL techniques.',
    requiredXp: 2450,
    targetXp: 3000
  }
];

export class ColdCaseAiEngine {
  // Generate a dynamic Noir Murder Mystery case
  static async generateColdCase(levelNum = 1, solvedHistory = []) {
    const rankInfo = DETECTIVE_RANKS.find(r => r.level === levelNum) || DETECTIVE_RANKS[0];

    let memoryPrompt = '';
    const relevantHistory = solvedHistory.filter(c => c.level === levelNum).slice(0, 5);
    if (relevantHistory.length > 0) {
      const pastTitles = relevantHistory.map(h => `"${h.title}"`).join(', ');
      memoryPrompt = `\n[Detective Memory]: User previously solved: [${pastTitles}]. Generate a FRESH, UNIQUE noir homicide scenario with new victim/suspect dynamics.`;
    }

    const systemPrompt = `You are the Lead Detective Architect for "Cold Case", a noir SQL detective game.
You generate valid SQLite murder mystery scenarios where the detective starts with NO schema documentation and must discover tables, filter out red-herring tables, and find the killer.
Output ONLY raw valid JSON (no markdown backticks, no extra text).

JSON Schema:
{
  "id": "coldcase-${Date.now()}",
  "gameId": "cold_case",
  "level": ${levelNum},
  "rankTitle": "${rankInfo.rank}",
  "title": "The Name of the Homicide Case",
  "victimName": "Victim Full Name",
  "victimOccupation": "Victim Profession",
  "crimeDate": "1987-10-14",
  "crimeLocation": "Crime Scene Location",
  "narrative": "3-sentence atmospheric noir crime story introducing the victim, date of death, and mysterious circumstances.",
  "schemaSQL": "CREATE TABLE persons (...); CREATE TABLE phone_logs (...); CREATE TABLE sightings (...); CREATE TABLE police_archives (...);",
  "seedSQL": "INSERT INTO persons VALUES ...; INSERT INTO phone_logs VALUES ...;",
  "redHerrings": ["police_archives"],
  "solutionSuspectId": 2,
  "solutionSuspectName": "Diana Cross",
  "solutionMotive": "Financial inheritance & business betrayal",
  "hiddenSolution": "SELECT p.name, p.occupation FROM persons p JOIN phone_logs pl ON p.id = pl.caller_id WHERE ...",
  "requiredEvidencePoints": [
    { "id": "contact", "description": "Called the victim within 1 hour of death", "keywords": ["call", "phone", "contact", "dialed", "receiver"] },
    { "id": "location", "description": "Spotted at crime scene with no alibi", "keywords": ["sighting", "location", "seen", "docks", "spotted", "alibi"] },
    { "id": "motive", "description": "Financial or personal dispute with victim", "keywords": ["money", "wire", "transfer", "debt", "inherit", "business"] }
  ],
  "objective": "Identify the killer and return their name and profession. Then explain the evidence chain in your accusation.",
  "hints": ["Check who communicated with the victim right before the incident", "Look for suspects whose alibis contradict the sighting records"],
  "concepts": ["Schema Discovery", "JOIN", "Time Filtering"]
}`;

    const userPrompt = `Generate a realistic Level ${levelNum} Noir Murder Case (${rankInfo.rank}).
Category: ${rankInfo.category}
Target SQL Concepts: ${rankInfo.topics.join(', ')}
${memoryPrompt}

Requirements:
1. Valid SQLite DDL for 4 to 6 tables, including 1 or 2 red-herring tables (tables that look suspicious like 'anonymous_tips' or 'unrelated_arrests' but contain dead ends).
2. 4-8 realistic seed rows per table. Exactly one suspect must be conclusively guilty based on cross-referencing alibis, locations, calls, or financial records.
3. Output pure JSON only.`;

    try {
      const parsed = await AiProvider.generateJsonCompletion(systemPrompt, userPrompt);
      if (parsed.schemaSQL && parsed.hiddenSolution && parsed.solutionSuspectName) {
        return parsed;
      }
    } catch (err) {
      console.warn('Cold Case AI generation error, using fallback:', err);
    }

    return this.getResilientColdCaseFallback(levelNum);
  }

  // Evaluate Detective's Accusation Narrative & Evidence Points
  static evaluateEvidenceNarrative(userNarrative = '', requiredEvidencePoints = []) {
    if (!userNarrative || userNarrative.length < 15) {
      return {
        isValid: false,
        coveredPoints: 0,
        totalPoints: requiredEvidencePoints.length,
        matchedDetails: [],
        feedback: 'Your accusation explanation is too brief. Provide a 2-3 sentence summary of the evidence chain.'
      };
    }

    const lower = userNarrative.toLowerCase();
    const matched = [];

    requiredEvidencePoints.forEach(pt => {
      const isMatch = pt.keywords.some(kw => lower.includes(kw.toLowerCase()));
      if (isMatch) {
        matched.push(pt);
      }
    });

    const isValid = matched.length >= Math.min(2, requiredEvidencePoints.length);

    return {
      isValid,
      coveredPoints: matched.length,
      totalPoints: requiredEvidencePoints.length,
      matchedDetails: matched,
      feedback: isValid 
        ? 'Solid evidence chain! Your indictment connects the critical forensic data points.'
        : 'Incomplete evidence chain. Make sure to cite specific evidence (phone records, alibi discrepancies, or financial motives).'
    };
  }

  // Fallback Cases
  static getResilientColdCaseFallback(levelNum) {
    const fallbacks = {
      1: {
        id: `coldcase-fallback-1-${Date.now()}`,
        gameId: 'cold_case',
        level: 1,
        rankTitle: 'Rookie Patrolman',
        title: 'The Harbor Pier Homicide',
        victimName: 'Victor Hale',
        victimOccupation: 'Shipping Magnate',
        crimeDate: '1987-10-14',
        crimeLocation: 'Pier 42 Docks',
        narrative: 'On October 14th, 1987, shipping tycoon Victor Hale was found dead near the cargo cranes. The police database has zero schema documentation. Explore the database, find the suspects, cross-examine phone records and harbor sightings, and identify the killer.',
        schemaSQL: `
          CREATE TABLE persons (id INTEGER PRIMARY KEY, name TEXT, occupation TEXT, alibi TEXT);
          CREATE TABLE phone_logs (caller_id INTEGER, receiver_id INTEGER, call_time TEXT, duration_sec INTEGER);
          CREATE TABLE harbor_sightings (person_id INTEGER, location TEXT, sighting_time TEXT);
          CREATE TABLE anonymous_tips (tip_id INTEGER, tip_text TEXT); -- RED HERRING
        `,
        seedSQL: `
          INSERT INTO persons VALUES
          (1, 'Victor Hale', 'Victim (Deceased)', 'Deceased at scene'),
          (2, 'Diana Cross', 'Business Partner', 'Claimed home alone'),
          (3, 'Leo Vance', 'Dockworker', 'Working shift at Warehouse B'),
          (4, 'Clara Reyes', 'Accountant', 'At dinner with family');

          INSERT INTO phone_logs VALUES
          (2, 1, '1987-10-14 21:45', 180),
          (3, 4, '1987-10-14 18:30', 45),
          (4, 1, '1987-10-13 14:00', 300);

          INSERT INTO harbor_sightings VALUES
          (2, 'Pier 42 Docks', '1987-10-14 22:15'),
          (3, 'Warehouse B', '1987-10-14 22:00');

          INSERT INTO anonymous_tips VALUES
          (101, 'Saw a strange blue van near 5th Avenue.'),
          (102, 'The mob is taking over the shipping lines.');
        `,
        redHerrings: ['anonymous_tips'],
        solutionSuspectId: 2,
        solutionSuspectName: 'Diana Cross',
        solutionMotive: 'Hostile takeover of harbor shipping routes',
        hiddenSolution: `
          SELECT p.name, p.occupation 
          FROM persons p 
          JOIN phone_logs ph ON p.id = ph.caller_id 
          JOIN harbor_sightings hs ON p.id = hs.person_id 
          WHERE ph.receiver_id = 1 
            AND hs.location = 'Pier 42 Docks'
        `,
        requiredEvidencePoints: [
          { id: 'phone', description: 'Called Victor Hale at 21:45 shortly before murder', keywords: ['call', 'phone', '21:45', 'spoke', 'contact'] },
          { id: 'sighting', description: 'Spotted at Pier 42 Docks despite claiming to be home alone', keywords: ['pier', 'docks', 'sighting', 'spotted', 'alone', 'alibi'] },
          { id: 'partner', description: 'Business partner with direct motive', keywords: ['partner', 'business', 'money', 'shipping'] }
        ],
        objective: 'Identify the killer. Return their name and occupation. Then write an explanation citing the phone call and dock sighting.',
        hints: [
          'Run SELECT name FROM sqlite_master WHERE type="table" to uncover the crime database tables.',
          'Cross-reference who called the victim (receiver_id = 1) and who was spotted at Pier 42 Docks.'
        ],
        concepts: ['Schema Blind Discovery', 'JOIN', 'Relational Evidence']
      },
      2: {
        id: `coldcase-fallback-2-${Date.now()}`,
        level: 2,
        rankTitle: 'Junior Detective',
        title: 'Midnight Heist at the Sterling Bank',
        victimName: 'Arthur Vance',
        victimOccupation: 'Chief Security Officer',
        crimeDate: '1988-03-22',
        crimeLocation: 'Sterling Vault Corridors',
        narrative: 'Arthur Vance was poisoned in the private security corridors at 23:30. Keycard logs, employee badge scans, and financial wire transfers hold the truth. Watch out for red-herring janitorial logs.',
        schemaSQL: `
          CREATE TABLE staff (staff_id INTEGER PRIMARY KEY, full_name TEXT, title TEXT, badge_code TEXT);
          CREATE TABLE keycard_logs (badge_code TEXT, room_name TEXT, access_time TEXT);
          CREATE TABLE wire_transfers (sender TEXT, receiver_name TEXT, amount REAL, transfer_date TEXT);
          CREATE TABLE maintenance_records (log_id INTEGER, notes TEXT); -- RED HERRING
        `,
        seedSQL: `
          INSERT INTO staff VALUES
          (1, 'Arthur Vance', 'Victim (Chief Security)', 'BDG-01'),
          (2, 'Marcus Thorne', 'Deputy Vault Manager', 'BDG-02'),
          (3, 'Elena Rostova', 'Bank Teller', 'BDG-03'),
          (4, 'Frank Castle', 'Night Guard', 'BDG-04');

          INSERT INTO keycard_logs VALUES
          ('BDG-02', 'Vault Corridors', '1988-03-22 23:25'),
          ('BDG-04', 'Front Lobby', '1988-03-22 23:30'),
          ('BDG-03', 'Breakroom', '1988-03-22 22:00');

          INSERT INTO wire_transfers VALUES
          ('Offshore Shell Corp', 'Marcus Thorne', 75000.00, '1988-03-21'),
          ('Payroll', 'Elena Rostova', 1200.00, '1988-03-20');

          INSERT INTO maintenance_records VALUES
          (1, 'HVAC air filter replaced on 3rd floor.'),
          (2, 'Lightbulb flickering in lobby.');
        `,
        redHerrings: ['maintenance_records'],
        solutionSuspectId: 2,
        solutionSuspectName: 'Marcus Thorne',
        solutionMotive: 'Received $75k wire transfer from offshore shell corp',
        hiddenSolution: `
          SELECT s.full_name, s.title
          FROM staff s
          JOIN keycard_logs k ON s.badge_code = k.badge_code
          JOIN wire_transfers w ON s.full_name = w.receiver_name
          WHERE k.room_name = 'Vault Corridors' AND w.amount >= 50000;
        `,
        requiredEvidencePoints: [
          { id: 'keycard', description: 'Badge scanned in Vault Corridors at 23:25 right before death', keywords: ['keycard', 'vault', 'corridor', 'badge', '23:25'] },
          { id: 'wire', description: 'Received $75k offshore wire transfer day before', keywords: ['wire', '75000', 'transfer', 'offshore', 'money', 'bribe'] }
        ],
        objective: 'Find the killer (full_name and title) who accessed the Vault Corridors and received a suspicious offshore transfer.',
        hints: ['Check keycard_logs around 23:25', 'Check wire_transfers for large unexplained sums'],
        concepts: ['Multi-table JOIN', 'Filtering', 'Financial Tracking']
      }
    };

    return fallbacks[levelNum] || fallbacks[1];
  }
}
