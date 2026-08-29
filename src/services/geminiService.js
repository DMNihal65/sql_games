// Gemini AI Medical Consultant Engine ("Dr. Turing, Chief of Trauma Data Surgery")

export class GeminiConsultant {
  static getApiKey() {
    return (
      localStorage.getItem('gemini_api_key') ||
      (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') ||
      ''
    );
  }

  static setApiKey(key) {
    localStorage.setItem('gemini_api_key', key.trim());
  }

  static hasKey() {
    return !!this.getApiKey();
  }

  static async callGemini(prompt, systemInstruction = '') {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('No Gemini API Key provided. Please enter your Gemini API key in the settings or AI console.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.error?.message || `API error (${response.status}): ${response.statusText}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Gemini did not return any diagnostic response.');
    }

    return candidate.content.parts[0].text;
  }

  // Diagnostic Error Triage in Medical Metaphors
  static async explainError(errorMsg, currentSql, patientCase) {
    const sysPrompt = `You are Dr. Turing, the Chief of Trauma Data Surgery in a futuristic cyber-hospital. You speak in a blend of clinical urgency, medical terminology, and sharp SQL expertise. Keep responses under 120 words.`;
    const userPrompt = `
Case: ${patientCase.title}
Patient Condition: ${patientCase.condition}
Objective: ${patientCase.objective}

The surgeon ran this SQL:
\`\`\`sql
${currentSql}
\`\`\`

The surgery monitor raised this ERROR:
"${errorMsg}"

Diagnose what went wrong with this SQL query. Explain it in a vivid surgical metaphor (e.g. lacerated syntax, severed foreign keys, necrotic NULLs) and tell the surgeon how to fix the incision without giving away the full answer immediately.`;

    return await this.callGemini(userPrompt, sysPrompt);
  }

  // Tiered Surgical Guidance / Hints
  static async getClinicalHint(patientCase, currentSql, hintLevel = 1) {
    const sysPrompt = `You are Dr. Turing, Senior Attending Data Surgeon. Provide surgical SQL guidance for the patient.`;
    const userPrompt = `
Patient: ${patientCase.patientName} (${patientCase.title})
Condition: ${patientCase.condition}
Objective: ${patientCase.objective}
Schema SQL: ${patientCase.schemaSQL}

Current Surgeon's Query:
\`\`\`sql
${currentSql || '-- (No query written yet)'}
\`\`\`

Request: Give a Tier ${hintLevel} hint:
- Tier 1: High-level anatomical/logic diagnosis (no SQL syntax).
- Tier 2: Suggest specific SQL clauses/functions to use (e.g., JOIN type, GROUP BY, window function).
- Tier 3: Provide a structural skeleton or pseudocode snippet without giving the entire raw solution.
Respond concisely in under 100 words.`;

    return await this.callGemini(userPrompt, sysPrompt);
  }

  // Post-Op Clinical Review
  static async getPostOpReview(patientCase, userSql, score, isSuccess) {
    const sysPrompt = `You are Dr. Turing, Chief of Surgery conducting a post-operative debrief.`;
    const userPrompt = `
Patient: ${patientCase.title}
Result: ${isSuccess ? 'PATIENT SURVIVED' : 'PATIENT CRITICAL / FAILED'}
Surgeon Score: ${score}/100

Surgeon's Final Query:
\`\`\`sql
${userSql}
\`\`\`

Optimal Query:
\`\`\`sql
${patientCase.hiddenSolution}
\`\`\`

Provide a 2-sentence post-op surgical debrief evaluating the query's elegance, index utilization, or alternative SQL techniques.`;

    return await this.callGemini(userPrompt, sysPrompt);
  }

  // Dynamic Emergency Patient Generator
  static async generateCustomEmergencyCase(difficulty = 'Intermediate') {
    const sysPrompt = `You are a Medical Database Case Generator for the game "Data Surgeon". You create valid SQLite scenarios in valid JSON format.`;
    const userPrompt = `Generate a new emergency SQL patient scenario.
Difficulty: ${difficulty}

Output ONLY valid JSON matching this exact structure:
{
  "id": "surgeon-ai-${Date.now()}",
  "tier": 2,
  "tierName": "Special Emergency",
  "title": "Short catchy title",
  "patientName": "Patient Name and Room",
  "patientAge": 35,
  "condition": "Medical condition name",
  "severity": "Critical",
  "narrative": "Story of data corruption in 2 sentences",
  "schemaSQL": "CREATE TABLE ... (valid sqlite DDL)",
  "seedSQL": "INSERT INTO ... (valid sqlite DML with 4-6 rows)",
  "objective": "Exact objective and column sorting requirement",
  "hiddenSolution": "SELECT ... (exact correct sqlite query)",
  "hints": ["Hint 1", "Hint 2"],
  "concepts": ["Concept 1", "Concept 2"],
  "difficulty": "${difficulty}"
}
Do NOT include markdown backticks around JSON if possible, or only pure json.`;

    const raw = await this.callGemini(userPrompt, sysPrompt);
    const cleanJson = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleanJson);
  }
}
