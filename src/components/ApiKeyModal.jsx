import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Cpu,
  Layers,
  Database,
  Trash2
} from 'lucide-react';
import { 
  AiProvider, 
  OPENROUTER_MODELS, 
  DEFAULT_OPENROUTER_KEY, 
  DEFAULT_GEMINI_KEY 
} from '../services/aiProvider';

export default function ApiKeyModal({
  isOpen,
  onClose,
  onResetProgress
}) {
  const [provider, setProvider] = useState(() => AiProvider.getProvider());
  const [openRouterKey, setOpenRouterKey] = useState(() => AiProvider.getOpenRouterKey());
  const [openRouterModel, setOpenRouterModel] = useState(() => AiProvider.getOpenRouterModel());
  const [geminiKey, setGeminiKey] = useState(() => AiProvider.getGeminiKey());
  const [isSaved, setIsSaved] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    AiProvider.setProvider(provider);
    AiProvider.setOpenRouterKey(openRouterKey);
    AiProvider.setOpenRouterModel(openRouterModel);
    AiProvider.setGeminiKey(geminiKey);

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleClearAllData = async () => {
    if (window.confirm('⚠️ Are you sure you want to clear all cloud database cases, progress, and local storage? This will reset all games to clean Level 1.')) {
      setIsClearing(true);
      try {
        // Clear all localStorage keys
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('sql_') || k.startsWith('coldcase_')) {
            localStorage.removeItem(k);
          }
        });

        if (onResetProgress) {
          await onResetProgress();
        }

        alert('✨ All local and cloud database data cleared successfully!');
        window.location.reload();
      } catch (err) {
        alert('Error clearing data: ' + err.message);
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Engine & Provider Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure OpenRouter or Gemini for 100% dynamic case generation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Active AI Provider:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvider('openrouter')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                provider === 'openrouter'
                  ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">OpenRouter AI</span>
                {provider === 'openrouter' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                GPT-4o Mini, Llama 3.3, DeepSeek
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProvider('gemini')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                provider === 'gemini'
                  ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Google Gemini Direct</span>
                {provider === 'gemini' && <Check className="w-3.5 h-3.5 text-teal-600" />}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Gemini 2.5 Flash API
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3 pt-1">
          {provider === 'openrouter' ? (
            <>
              {/* OpenRouter Model Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  OpenRouter Model:
                </label>
                <select
                  value={openRouterModel}
                  onChange={(e) => setOpenRouterModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 font-medium"
                >
                  {OPENROUTER_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              {/* OpenRouter Key Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  OpenRouter API Key:
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Google Gemini API Key:
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-slate-50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved & Activated!' : 'Save & Activate AI Provider'}</span>
          </button>
        </form>

        {/* Clear All Data Section */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Database & Progress Reset
            </span>
            <span className="text-[11px] text-slate-500">
              Clear all records and start fresh from Level 1
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearAllData}
            disabled={isClearing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isClearing ? 'Clearing...' : 'Clear All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
