// Clinical Cases Database for Data Surgeon
// Tiers 1-4: Beginner to Master Data Trauma Surgeon

export const CLINICAL_CASES = [
  {
    id: 'surgeon-001',
    tier: 1,
    tierName: 'Intern Resident',
    title: 'Duplicate Patient Records',
    patientName: 'John "Ghost" Doe (Record #4092)',
    patientAge: 44,
    condition: 'Data Replication Shock',
    severity: 'Moderate',
    narrative: 'Patient John Doe has multiple conflicting duplicate entries in the central intake registry following a chaotic automated ETL migration. The most recent record (latest created_at) contains his actual emergency insurance and blood group. The older ghost duplicates are causing dosage calculation errors in pharmacy.',
    schemaSQL: `
      CREATE TABLE patients (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT,
        blood_type TEXT,
        created_at TEXT
      );
    `,
    seedSQL: `
      INSERT INTO patients (id, name, email, blood_type, created_at) VALUES
      (1, 'John Doe', 'johndoe@mednet.org', 'O+', '2024-01-10 08:30:00'),
      (2, 'Jane Smith', 'jane.smith@health.io', 'A+', '2024-02-14 09:15:00'),
      (3, 'John Doe', 'johndoe@mednet.org', 'O+', '2024-05-20 14:22:00'),
      (4, 'Carlos Mendez', 'carlos.m@hospital.com', 'B-', '2024-03-01 11:00:00'),
      (5, 'John Doe', 'johndoe@mednet.org', 'O+', '2024-06-01 19:45:00'),
      (6, 'Jane Smith', 'jane.smith@health.io', 'A+', '2024-01-05 10:00:00');
    `,
    objective: 'Extract the deduplicated patient roster keeping only the single most recent record (highest created_at) for each distinct email. Return columns: id, name, email, blood_type, created_at ordered by id ASC.',
    hiddenSolution: `
      SELECT id, name, email, blood_type, created_at
      FROM patients
      WHERE (email, created_at) IN (
        SELECT email, MAX(created_at)
        FROM patients
        GROUP BY email
      )
      ORDER BY id ASC;
    `,
    expectedResult: [
      [2, 'Jane Smith', 'jane.smith@health.io', 'A+', '2024-02-14 09:15:00'],
      [4, 'Carlos Mendez', 'carlos.m@hospital.com', 'B-', '2024-03-01 11:00:00'],
      [5, 'John Doe', 'johndoe@mednet.org', 'O+', '2024-06-01 19:45:00']
    ],
    hints: [
      'Use GROUP BY email with MAX(created_at) to identify the latest record timestamp per patient.',
      'You can filter using a subquery with WHERE (email, created_at) IN (...) or a window function ROW_NUMBER().',
      'Remember to order the final output by id ASC.'
    ],
    concepts: ['GROUP BY', 'MAX() Aggregation', 'Subqueries', 'ROW_NUMBER()'],
    difficulty: 'Beginner'
  },
  {
    id: 'surgeon-002',
    tier: 1,
    tierName: 'Intern Resident',
    title: 'Emergency Triage NULL Vitals',
    patientName: 'Amara Vance (Trauma Bed 03)',
    patientAge: 29,
    condition: 'Sensor Drop Asystole',
    severity: 'High',
    narrative: 'A telemetry packet glitch caused several heart_rate and systolic_bp telemetry readings to be recorded as NULL or empty strings. During triage, the monitor needs an emergency imputed vital record where missing heart rates default to 75 (baseline resting) and missing systolic_bp defaults to 120.',
    schemaSQL: `
      CREATE TABLE triage_logs (
        log_id INTEGER PRIMARY KEY,
        patient_name TEXT,
        room_no INTEGER,
        heart_rate INTEGER,
        systolic_bp INTEGER,
        recorded_time TEXT
      );
    `,
    seedSQL: `
      INSERT INTO triage_logs (log_id, patient_name, room_no, heart_rate, systolic_bp, recorded_time) VALUES
      (101, 'Amara Vance', 103, 118, 140, '2024-07-10 12:00'),
      (102, 'Amara Vance', 103, NULL, 135, '2024-07-10 12:05'),
      (103, 'Amara Vance', 103, 112, NULL, '2024-07-10 12:10'),
      (104, 'Amara Vance', 103, NULL, NULL, '2024-07-10 12:15'),
      (105, 'David Kim', 104, 82, 115, '2024-07-10 12:00'),
      (106, 'David Kim', 104, NULL, 118, '2024-07-10 12:05');
    `,
    objective: 'Query all logs for "Amara Vance", replacing any NULL heart_rate with 75, and any NULL systolic_bp with 120. Return columns: log_id, heart_rate (as sanitized_hr), systolic_bp (as sanitized_bp), recorded_time ordered by log_id ASC.',
    hiddenSolution: `
      SELECT 
        log_id,
        COALESCE(heart_rate, 75) AS sanitized_hr,
        COALESCE(systolic_bp, 120) AS sanitized_bp,
        recorded_time
      FROM triage_logs
      WHERE patient_name = 'Amara Vance'
      ORDER BY log_id ASC;
    `,
    expectedResult: [
      [101, 118, 140, '2024-07-10 12:00'],
      [102, 75, 135, '2024-07-10 12:05'],
      [103, 112, 120, '2024-07-10 12:10'],
      [104, 75, 120, '2024-07-10 12:15']
    ],
    hints: [
      'The SQL COALESCE(value, default_val) function returns the first non-null argument.',
      'Filter with WHERE patient_name = "Amara Vance".',
      'Make sure you sort by log_id ASC.'
    ],
    concepts: ['COALESCE()', 'NULL Handling', 'WHERE Filtering', 'Aliases'],
    difficulty: 'Beginner'
  },
  {
    id: 'surgeon-003',
    tier: 2,
    tierName: 'Junior Attending',
    title: 'Fatal Drug Interaction Cross-Check',
    patientName: 'Evelyn Reed (Ward 7B)',
    patientAge: 68,
    condition: 'Pharmacological Anaphylaxis Alert',
    severity: 'Critical',
    narrative: 'Patient Evelyn Reed was prescribed multiple medications across two attending shifts. We have a prescriptions table and a blacklisted_interactions table. We must identify any patient currently prescribed TWO medications that form a dangerous interaction pair.',
    schemaSQL: `
      CREATE TABLE patients (
        patient_id INTEGER PRIMARY KEY,
        full_name TEXT
      );
      CREATE TABLE prescriptions (
        prescription_id INTEGER PRIMARY KEY,
        patient_id INTEGER,
        medication_name TEXT,
        dosage_mg INTEGER
      );
      CREATE TABLE dangerous_interactions (
        drug_a TEXT,
        drug_b TEXT,
        severity_level TEXT
      );
    `,
    seedSQL: `
      INSERT INTO patients VALUES (1, 'Evelyn Reed'), (2, 'Marcus Brody'), (3, 'Sarah Connor');
      INSERT INTO prescriptions VALUES
      (1, 1, 'Warfarin', 5),
      (2, 1, 'Aspirin', 100),
      (3, 1, 'Lisinopril', 10),
      (4, 2, 'Metformin', 500),
      (5, 2, 'Lisinopril', 20),
      (6, 3, 'Warfarin', 5),
      (7, 3, 'Amoxicillin', 500);
      INSERT INTO dangerous_interactions VALUES
      ('Warfarin', 'Aspirin', 'HIGH_BLEED_RISK'),
      ('Metformin', 'Contrast_Dye', 'RENAL_FAILURE'),
      ('Sildenafil', 'Nitroglycerin', 'FATAL_HYPOTENSION');
    `,
    objective: 'Find all patients taking a lethal combination. Return full_name, medication_1 (drug_a), medication_2 (drug_b), severity_level. Match interactions whether stored as (A, B) or (B, A). Order by full_name ASC.',
    hiddenSolution: `
      SELECT DISTINCT 
        p.full_name,
        d.drug_a AS medication_1,
        d.drug_b AS medication_2,
        d.severity_level
      FROM patients p
      JOIN prescriptions rx1 ON p.patient_id = rx1.patient_id
      JOIN prescriptions rx2 ON p.patient_id = rx2.patient_id AND rx1.prescription_id != rx2.prescription_id
      JOIN dangerous_interactions d 
        ON (rx1.medication_name = d.drug_a AND rx2.medication_name = d.drug_b)
        OR (rx1.medication_name = d.drug_b AND rx2.medication_name = d.drug_a)
      ORDER BY p.full_name ASC;
    `,
    expectedResult: [
      ['Evelyn Reed', 'Warfarin', 'Aspirin', 'HIGH_BLEED_RISK']
    ],
    hints: [
      'Self-join the prescriptions table to compare two distinct medication records for the same patient.',
      'Join with dangerous_interactions matching both (rx1 = drug_a AND rx2 = drug_b) or the reverse.',
      'Use DISTINCT to avoid duplicate permutations of the pair.'
    ],
    concepts: ['Multiple INNER JOINs', 'Self-Join', 'Disjunctive Conditions', 'DISTINCT'],
    difficulty: 'Intermediate'
  },
  {
    id: 'surgeon-004',
    tier: 2,
    tierName: 'Junior Attending',
    title: 'Operating Room Double-Booking Disaster',
    patientName: 'OR Schedule Conflict Matrix',
    patientAge: 0,
    condition: 'Surgical Suite Deadlock',
    severity: 'High',
    narrative: 'The hospital surgical board crashed due to timezone conversion bugs. Two surgical teams have booked the exact same Operating Room for overlapping time windows! We need to detect all conflicting bookings (same room_id, where surgery A begins before surgery B ends, and surgery B begins before surgery A ends).',
    schemaSQL: `
      CREATE TABLE or_bookings (
        booking_id INTEGER PRIMARY KEY,
        room_id INTEGER,
        lead_surgeon TEXT,
        start_time TEXT,
        end_time TEXT
      );
    `,
    seedSQL: `
      INSERT INTO or_bookings VALUES
      (201, 1, 'Dr. Strange', '2024-08-01 08:00', '2024-08-01 12:00'),
      (202, 1, 'Dr. House', '2024-08-01 10:30', '2024-08-01 14:00'),
      (203, 1, 'Dr. Grey', '2024-08-01 14:30', '2024-08-01 17:00'),
      (204, 2, 'Dr. McCoy', '2024-08-01 09:00', '2024-08-01 11:00'),
      (205, 2, 'Dr. Bailey', '2024-08-01 11:30', '2024-08-01 13:30');
    `,
    objective: 'Identify overlapping bookings in the same room. Return: room_id, surgeon_1, start_1, end_1, surgeon_2, start_2, end_2. Ensure each conflict is listed once (b1.booking_id < b2.booking_id) ordered by room_id ASC, b1.booking_id ASC.',
    hiddenSolution: `
      SELECT 
        b1.room_id,
        b1.lead_surgeon AS surgeon_1,
        b1.start_time AS start_1,
        b1.end_time AS end_1,
        b2.lead_surgeon AS surgeon_2,
        b2.start_time AS start_2,
        b2.end_time AS end_2
      FROM or_bookings b1
      JOIN or_bookings b2 
        ON b1.room_id = b2.room_id 
        AND b1.booking_id < b2.booking_id
        AND b1.start_time < b2.end_time 
        AND b2.start_time < b1.end_time
      ORDER BY b1.room_id ASC, b1.booking_id ASC;
    `,
    expectedResult: [
      [1, 'Dr. Strange', '2024-08-01 08:00', '2024-08-01 12:00', 'Dr. House', '2024-08-01 10:30', '2024-08-01 14:00']
    ],
    hints: [
      'Two intervals [S1, E1] and [S2, E2] overlap if and only if S1 < E2 AND S2 < E1.',
      'Use b1.booking_id < b2.booking_id to prevent pairing a booking with itself or producing reverse duplicate pairs.',
      'Join on b1.room_id = b2.room_id.'
    ],
    concepts: ['Temporal Interval Join', 'Self-Join with Inequality', 'Alias Scoping'],
    difficulty: 'Intermediate'
  },
  {
    id: 'surgeon-005',
    tier: 3,
    tierName: 'Senior Surgeon',
    title: 'ICU Sepsis Outlier Aggregation',
    patientName: 'ICU High-Risk Cluster #88',
    patientAge: 57,
    condition: 'Systemic Inflammatory Storm',
    severity: 'Critical',
    narrative: 'The ICU automated telemetry engine monitors patients with suspected septic shock. We need to identify ICU patients who had at least 3 distinct fever spikes (temperature >= 38.5 Celsius) AND an average heart rate strictly greater than 100 bpm across all their hourly readings.',
    schemaSQL: `
      CREATE TABLE icu_vitals (
        reading_id INTEGER PRIMARY KEY,
        patient_id INTEGER,
        patient_name TEXT,
        temp_celsius REAL,
        heart_rate INTEGER,
        hour_recorded INTEGER
      );
    `,
    seedSQL: `
      INSERT INTO icu_vitals VALUES
      (1, 10, 'Robert Taylor', 38.6, 105, 1),
      (2, 10, 'Robert Taylor', 38.9, 110, 2),
      (3, 10, 'Robert Taylor', 38.7, 102, 3),
      (4, 10, 'Robert Taylor', 37.4, 98, 4),
      (5, 20, 'Elena Rostova', 38.8, 85, 1),
      (6, 20, 'Elena Rostova', 39.0, 90, 2),
      (7, 20, 'Elena Rostova', 38.9, 88, 3),
      (8, 30, 'Chen Wei', 37.1, 115, 1),
      (9, 30, 'Chen Wei', 37.2, 120, 2),
      (10, 40, 'Fatima Al-Mansoor', 39.1, 108, 1),
      (11, 40, 'Fatima Al-Mansoor', 39.2, 112, 2),
      (12, 40, 'Fatima Al-Mansoor', 38.8, 104, 3);
    `,
    objective: 'Find all patient_id, patient_name, total_fever_spikes (count of readings where temp_celsius >= 38.5), and avg_heart_rate (rounded to 1 decimal place) for patients who have total_fever_spikes >= 3 AND avg_heart_rate > 100. Order by avg_heart_rate DESC.',
    hiddenSolution: `
      SELECT 
        patient_id,
        patient_name,
        COUNT(CASE WHEN temp_celsius >= 38.5 THEN 1 END) AS total_fever_spikes,
        ROUND(AVG(heart_rate), 1) AS avg_heart_rate
      FROM icu_vitals
      GROUP BY patient_id, patient_name
      HAVING COUNT(CASE WHEN temp_celsius >= 38.5 THEN 1 END) >= 3
         AND AVG(heart_rate) > 100
      ORDER BY avg_heart_rate DESC;
    `,
    expectedResult: [
      [40, 'Fatima Al-Mansoor', 3, 108.0],
      [10, 'Robert Taylor', 3, 103.8]
    ],
    hints: [
      'Use conditional aggregation: COUNT(CASE WHEN temp_celsius >= 38.5 THEN 1 END) to count specific event occurrences.',
      'Filter aggregate metrics in the HAVING clause, not in the WHERE clause.',
      'Use ROUND(AVG(heart_rate), 1) and sort by avg_heart_rate DESC.'
    ],
    concepts: ['GROUP BY', 'HAVING Filter', 'Conditional Aggregation', 'ROUND / AVG'],
    difficulty: 'Advanced'
  },
  {
    id: 'surgeon-006',
    tier: 3,
    tierName: 'Senior Surgeon',
    title: 'Contaminated Vaccine Batch Recall',
    patientName: 'Vaccine Cryo-Storage Ward',
    patientAge: 0,
    condition: 'Pathogenic Contamination Recall',
    severity: 'High',
    narrative: 'A supplier informed us that certain vaccine batches produced at facility "Lab-Alpha" contain temperature degradation. We must identify all patients who received doses strictly from recalled batches and have NOT yet received any certified clean batch replacement.',
    schemaSQL: `
      CREATE TABLE patients (
        patient_id INTEGER PRIMARY KEY,
        full_name TEXT
      );
      CREATE TABLE vaccine_batches (
        batch_id TEXT PRIMARY KEY,
        facility TEXT,
        is_contaminated INTEGER
      );
      CREATE TABLE patient_administrations (
        admin_id INTEGER PRIMARY KEY,
        patient_id INTEGER,
        batch_id TEXT,
        admin_date TEXT
      );
    `,
    seedSQL: `
      INSERT INTO patients VALUES (1, 'Alice Young'), (2, 'Bob Vance'), (3, 'Charlie Duke'), (4, 'Diana Prince');
      INSERT INTO vaccine_batches VALUES
      ('BAT-001', 'Lab-Alpha', 1),
      ('BAT-002', 'Lab-Alpha', 1),
      ('BAT-003', 'Bio-Safe', 0),
      ('BAT-004', 'Bio-Safe', 0);
      INSERT INTO patient_administrations VALUES
      (1, 1, 'BAT-001', '2024-05-01'), -- Alice got contaminated only
      (2, 2, 'BAT-001', '2024-05-02'), -- Bob got contaminated
      (3, 2, 'BAT-003', '2024-05-15'), -- Bob also got clean batch! (Safe)
      (4, 3, 'BAT-003', '2024-05-03'), -- Charlie got clean only
      (5, 4, 'BAT-002', '2024-05-04'); -- Diana got contaminated only
    `,
    objective: 'Select patient_id and full_name for patients who received at least one contaminated batch (is_contaminated = 1) AND have NEVER received any uncontaminated batch (is_contaminated = 0). Order by patient_id ASC.',
    hiddenSolution: `
      SELECT p.patient_id, p.full_name
      FROM patients p
      WHERE EXISTS (
        SELECT 1 FROM patient_administrations pa
        JOIN vaccine_batches vb ON pa.batch_id = vb.batch_id
        WHERE pa.patient_id = p.patient_id AND vb.is_contaminated = 1
      )
      AND NOT EXISTS (
        SELECT 1 FROM patient_administrations pa
        JOIN vaccine_batches vb ON pa.batch_id = vb.batch_id
        WHERE pa.patient_id = p.patient_id AND vb.is_contaminated = 0
      )
      ORDER BY p.patient_id ASC;
    `,
    expectedResult: [
      [1, 'Alice Young'],
      [4, 'Diana Prince']
    ],
    hints: [
      'Use EXISTS to check for contaminated doses and NOT EXISTS for clean doses.',
      'Alternatively, use set operations (EXCEPT) or GROUP BY with conditional aggregation.',
      'Remember Bob received both, so Bob is excluded.'
    ],
    concepts: ['EXISTS / NOT EXISTS', 'Correlated Subqueries', 'Set Logic Exclusion'],
    difficulty: 'Advanced'
  },
  {
    id: 'surgeon-007',
    tier: 4,
    tierName: 'Chief of Surgery',
    title: 'Post-Op Infection Velocity & Moving Window',
    patientName: 'Post-Surgical Infectious Cluster',
    patientAge: 0,
    condition: 'Epidemic Spike Velocity',
    severity: 'Critical',
    narrative: 'Infectious Disease Control needs an epidemiology report calculating the 3-day trailing moving average of new post-op infection cases and the day-over-day case delta to pinpoint the exact outbreak acceleration day.',
    schemaSQL: `
      CREATE TABLE daily_infections (
        report_date TEXT PRIMARY KEY,
        case_count INTEGER
      );
    `,
    seedSQL: `
      INSERT INTO daily_infections VALUES
      ('2024-09-01', 2),
      ('2024-09-02', 3),
      ('2024-09-03', 5),
      ('2024-09-04', 12),
      ('2024-09-05', 18),
      ('2024-09-06', 20),
      ('2024-09-07', 15);
    `,
    objective: 'For each report_date, return: report_date, case_count, prev_day_count (case count of previous day, or 0 if NULL), daily_delta (case_count - prev_day_count), and moving_avg_3d (the 3-day average of case_count including current day and 2 prior days, rounded to 2 decimal places). Order by report_date ASC.',
    hiddenSolution: `
      SELECT 
        report_date,
        case_count,
        COALESCE(LAG(case_count, 1) OVER (ORDER BY report_date ASC), 0) AS prev_day_count,
        case_count - COALESCE(LAG(case_count, 1) OVER (ORDER BY report_date ASC), 0) AS daily_delta,
        ROUND(AVG(case_count) OVER (
          ORDER BY report_date ASC
          ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2) AS moving_avg_3d
      FROM daily_infections
      ORDER BY report_date ASC;
    `,
    expectedResult: [
      ['2024-09-01', 2, 0, 2, 2.0],
      ['2024-09-02', 3, 2, 1, 2.5],
      ['2024-09-03', 5, 3, 2, 3.33],
      ['2024-09-04', 12, 5, 7, 6.67],
      ['2024-09-05', 18, 12, 6, 11.67],
      ['2024-09-06', 20, 18, 2, 16.67],
      ['2024-09-07', 15, 20, -5, 17.67]
    ],
    hints: [
      'Use LAG(case_count, 1) OVER (ORDER BY report_date ASC) to fetch previous day value.',
      'Use ROWS BETWEEN 2 PRECEDING AND CURRENT ROW within AVG(...) OVER (...) for 3-day moving average.',
      'Handle the first day NULL with COALESCE(..., 0).'
    ],
    concepts: ['Window Functions', 'LAG()', 'Moving Averages', 'Window Frame Clauses'],
    difficulty: 'Master'
  },
  {
    id: 'surgeon-008',
    tier: 4,
    tierName: 'Chief of Surgery',
    title: 'Organ Transplant Priority Allocation Queue',
    patientName: 'Organ Allocation Matrix 9000',
    patientAge: 0,
    condition: 'Triage Allocation Deadlock',
    severity: 'Critical',
    narrative: 'A donor heart is available for blood type "O+". The organ transplant committee calculates allocation priority with a CTE pipeline: base score = (100 - waiting_days_rank * 5) + (urgency_level * 20). If pediatric (age < 18), add +30 bonus points. Rank the final candidates strictly by total_score DESC, waiting_days DESC.',
    schemaSQL: `
      CREATE TABLE transplant_waitlist (
        candidate_id INTEGER PRIMARY KEY,
        candidate_name TEXT,
        blood_type TEXT,
        age INTEGER,
        urgency_level INTEGER, -- 1 (low) to 5 (extreme emergency)
        waiting_days INTEGER
      );
    `,
    seedSQL: `
      INSERT INTO transplant_waitlist VALUES
      (501, 'Liam Cooper', 'O+', 12, 4, 180),
      (502, 'Sophia Martin', 'O+', 45, 5, 320),
      (503, 'Noah Bennett', 'A+', 30, 5, 400), -- Wrong blood type
      (504, 'Lucas Wright', 'O+', 16, 3, 90),
      (505, 'Olivia Hughes', 'O+', 55, 4, 450);
    `,
    objective: 'For all candidates with blood_type = "O+", calculate priority_score = (urgency_level * 20) + (waiting_days / 10) + (CASE WHEN age < 18 THEN 30 ELSE 0 END). Return candidate_id, candidate_name, age, urgency_level, priority_score, and allocation_rank (DENSE_RANK() OVER (ORDER BY priority_score DESC)). Order by allocation_rank ASC.',
    hiddenSolution: `
      WITH RankedCandidates AS (
        SELECT 
          candidate_id,
          candidate_name,
          age,
          urgency_level,
          (urgency_level * 20) + (waiting_days / 10) + (CASE WHEN age < 18 THEN 30 ELSE 0 END) AS priority_score
        FROM transplant_waitlist
        WHERE blood_type = 'O+'
      )
      SELECT 
        candidate_id,
        candidate_name,
        age,
        urgency_level,
        priority_score,
        DENSE_RANK() OVER (ORDER BY priority_score DESC) AS allocation_rank
      FROM RankedCandidates
      ORDER BY allocation_rank ASC;
    `,
    expectedResult: [
      [502, 'Sophia Martin', 45, 5, 132, 1],
      [501, 'Liam Cooper', 12, 4, 128, 2],
      [505, 'Olivia Hughes', 55, 4, 125, 3],
      [504, 'Lucas Wright', 16, 3, 99, 4]
    ],
    hints: [
      'Filter for blood_type = "O+" first.',
      'Use a Common Table Expression (WITH CTE AS ...) to compute the composite priority_score.',
      'Apply DENSE_RANK() OVER (ORDER BY priority_score DESC) for clean allocation hierarchy.'
    ],
    concepts: ['Common Table Expressions (WITH CTE)', 'DENSE_RANK()', 'CASE Expressions', 'Score Formulations'],
    difficulty: 'Master'
  }
];
