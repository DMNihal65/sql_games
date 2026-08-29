// Unified AI Provider Service (OpenRouter + Gemini)

export const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Fast & Accurate)', provider: 'OpenAI' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', provider: 'Meta' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (V3)', provider: 'DeepSeek' }
];

export class AiProvider {
  static getProvider() {
    return (
      localStorage.getItem('ai_provider') ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_PROVIDER) ||
      'openrouter'
    );
  }

  static setProvider(provider) {
    localStorage.setItem('ai_provider', provider);
  }

  static getOpenRouterKey() {
    return (
      localStorage.getItem('openrouter_api_key') ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) ||
      ''
    );
  }

  static setOpenRouterKey(key) {
    localStorage.setItem('openrouter_api_key', key.trim());
  }

  static getOpenRouterModel() {
    return (
      localStorage.getItem('openrouter_model') ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_MODEL) ||
      'openai/gpt-4o-mini'
    );
  }

  static setOpenRouterModel(model) {
    localStorage.setItem('openrouter_model', model);
  }

  static getGeminiKey() {
    return (
      localStorage.getItem('gemini_api_key') ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
      ''
    );
  }

  static setGeminiKey(key) {
    localStorage.setItem('gemini_api_key', key.trim());
  }

  // Generate structured JSON via active AI provider (OpenRouter or Gemini)
  static async generateJsonCompletion(systemPrompt, userPrompt) {
    const provider = this.getProvider();

    if (provider === 'openrouter') {
      try {
        return await this.callOpenRouter(systemPrompt, userPrompt);
      } catch (err) {
        console.warn('OpenRouter call failed, falling back to Gemini:', err);
        return await this.callGemini(systemPrompt, userPrompt);
      }
    } else {
      try {
        return await this.callGemini(systemPrompt, userPrompt);
      } catch (err) {
        console.warn('Gemini call failed, falling back to OpenRouter:', err);
        return await this.callOpenRouter(systemPrompt, userPrompt);
      }
    }
  }

  // OpenRouter API Call
  static async callOpenRouter(systemPrompt, userPrompt) {
    const key = this.getOpenRouterKey();
    const model = this.getOpenRouterModel();

    if (!key) {
      throw new Error('OpenRouter API key is missing. Please configure your key in Settings.');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "SQL Arcade",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return this.parseJsonSafely(content);
  }

  // Google Gemini API Call
  static async callGemini(systemPrompt, userPrompt) {
    const key = this.getGeminiKey();
    if (!key) {
      throw new Error('Gemini API key is missing. Please configure your key in Settings.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.parseJsonSafely(content);
  }

  // Resilient JSON parser
  static parseJsonSafely(text) {
    if (!text) throw new Error('Empty AI response');
    const clean = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      return JSON.parse(clean);
    } catch {
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(clean.substring(start, end + 1));
      }
      throw new Error('Could not parse valid JSON from AI response');
    }
  }
}
