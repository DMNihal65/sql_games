import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Send, 
  Lightbulb, 
  AlertCircle, 
  Key, 
  Check, 
  RefreshCw, 
  Cpu, 
  ShieldAlert,
  HelpCircle,
  Stethoscope
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { GeminiConsultant } from '../services/geminiService';

export default function AiConsultantModal({
  isOpen,
  onClose,
  currentCase,
  currentSql,
  lastError,
  onAdmitCustomCase
}) {
  const [apiKey, setApiKey] = useState(GeminiConsultant.getApiKey());
  const [isEditingKey, setIsEditingKey] = useState(!GeminiConsultant.hasKey());
  const [messages, setMessages] = useState([
    {
      sender: 'turing',
      text: `Greetings, Doctor. I am Dr. Turing, Chief of Trauma Data Surgery. I monitor all clinical SQL operations in this theater. How can I assist with patient "${currentCase?.patientName || 'current record'}"?`
    }
  ]);
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [genDifficulty, setGenDifficulty] = useState('Intermediate');

  if (!isOpen) return null;

  const saveKey = () => {
    sound.playExecute();
    GeminiConsultant.setApiKey(apiKey);
    setIsEditingKey(false);
  };

  const handleSendCustom = async (textToSend) => {
    const prompt = textToSend || customInput;
    if (!prompt.trim()) return;

    sound.playExecute();
    const userMsg = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setCustomInput('');
    setIsLoading(true);

    try {
      const response = await GeminiConsultant.callGemini(
        `Patient Case: ${currentCase.title}
Clinical Condition: ${currentCase.condition}
Objective: ${currentCase.objective}
Surgeon Query so far:
${currentSql}

Surgeon question: ${prompt}`,
        'You are Dr. Turing, Chief of Trauma Data Surgery in a cyberpunk medical hospital. Give sharp, clinical, educational SQL advice under 120 words.'
      );

      setMessages(prev => [...prev, { sender: 'turing', text: response }]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'turing', 
          text: `⚠️ Telemetry Link Error: ${err.message}. Please check your Gemini API key.` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHint = async (level) => {
    sound.playExecute();
    setIsLoading(true);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Requesting Tier ${level} Clinical Guidance for "${currentCase.title}"` }
    ]);

    try {
      const hint = await GeminiConsultant.getClinicalHint(currentCase, currentSql, level);
      setMessages(prev => [...prev, { sender: 'turing', text: hint }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'turing', text: `⚠️ Consult Error: ${err.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriageError = async () => {
    if (!lastError) {
      setMessages(prev => [
        ...prev,
        { sender: 'turing', text: 'No active surgical malfunction is currently detected in telemetry logs. Your previous query executed without SQLite engine failure.' }
      ]);
      return;
    }

    sound.playExecute();
    setIsLoading(true);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Triage recent SQL Error: "${lastError}"` }
    ]);

    try {
      const diagnosis = await GeminiConsultant.explainError(lastError, currentSql, currentCase);
      setMessages(prev => [...prev, { sender: 'turing', text: diagnosis }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'turing', text: `⚠️ Error during triage: ${err.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCase = async () => {
    sound.playScalpelSwoosh();
    setIsLoading(true);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Synthesizing dynamic ${genDifficulty} emergency patient case...` }
    ]);

    try {
      const newCase = await GeminiConsultant.generateCustomEmergencyCase(genDifficulty);
      setMessages(prev => [
        ...prev,
        { 
          sender: 'turing', 
          text: `🚨 EMERGENCY ADMISSION CREATED: "${newCase.title}". Patient "${newCase.patientName}" admitted with condition "${newCase.condition}". Admitting to Operating Room now!` 
        }
      ]);
      setTimeout(() => {
        onAdmitCustomCase(newCase);
        onClose();
      }, 1200);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'turing', text: `⚠️ Case Generation Failure: ${err.message}. Ensure Gemini API key is valid.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Bot className="w-6 h-6 animate-pulse text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-slate-100 uppercase tracking-wider">
                  Dr. Turing, Chief AI Surgeon
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="font-mono text-xs text-slate-400">
                Senior Operating Room Consultant & Clinical Diagnostic AI
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playExecute();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Key Bar */}
        <div className="mb-3 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
            {isEditingKey ? (
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200 outline-none focus:border-purple-500 flex-1"
              />
            ) : (
              <span className="font-mono text-xs text-slate-300 truncate">
                {apiKey ? 'API Key Configured: ••••••••••••••••' : 'No API key set (Running in demo mode)'}
              </span>
            )}
          </div>

          {isEditingKey ? (
            <button
              onClick={saveKey}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-mono text-xs font-bold transition-colors"
            >
              Save Key
            </button>
          ) : (
            <button
              onClick={() => setIsEditingKey(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-xs transition-colors"
            >
              Change Key
            </button>
          )}
        </div>

        {/* Quick Action Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => handleRequestHint(1)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-950/80 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 font-bold mb-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Tier 1 Logic</span>
            </div>
            <p className="text-[10px] text-slate-400">High-level anatomy pointer</p>
          </button>

          <button
            onClick={() => handleRequestHint(2)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-950/80 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 font-bold mb-0.5">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tier 2 Syntax</span>
            </div>
            <p className="text-[10px] text-slate-400">SQL clauses & functions</p>
          </button>

          <button
            onClick={handleTriageError}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-950/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300 font-bold mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Triage Error</span>
            </div>
            <p className="text-[10px] text-slate-400">Diagnose syntax failure</p>
          </button>

          <button
            onClick={handleGenerateCase}
            disabled={isLoading}
            className="p-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Emergency Case</span>
            </div>
            <p className="text-[10px] text-purple-300/80">Generate new patient</p>
          </button>
        </div>

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 custom-scrollbar mb-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'turing' && (
                <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl p-3 font-mono text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-200 border border-slate-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 p-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Dr. Turing analyzing surgical telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendCustom()}
            placeholder="Ask Dr. Turing any SQL or trauma diagnosis question..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 outline-none"
          />
          <button
            onClick={() => handleSendCustom()}
            disabled={isLoading || !customInput.trim()}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
