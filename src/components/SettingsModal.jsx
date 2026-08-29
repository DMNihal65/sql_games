import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Key, 
  Trash2, 
  Keyboard, 
  Info, 
  Check, 
  ShieldAlert 
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { GeminiConsultant } from '../services/geminiService';

export default function SettingsModal({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  onResetAllProgress
}) {
  const [apiKey, setApiKey] = useState(GeminiConsultant.getApiKey());
  const [savedKey, setSavedKey] = useState(false);
  const [volume, setVolume] = useState(sound.volume);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    sound.playExecute();
    GeminiConsultant.setApiKey(apiKey);
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
    sound.playVitalBeep(700, 0.05);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-black text-lg text-slate-100 uppercase tracking-wider">
              Operating Room Configuration
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playExecute();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="mb-4 bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>Procedural Medical Audio:</span>
            </span>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors ${
                isMuted
                  ? 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isMuted ? 'MUTED' : 'ACTIVE'}
            </button>
          </div>

          {!isMuted && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] text-slate-400">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-cyan-300 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Gemini API Key */}
        <div className="mb-4 bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Gemini AI API Key (For Dr. Turing)</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Used for real-time surgical hints, medical error triage, and infinite emergency case generation.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSaveKey}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              {savedKey ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedKey ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Cheat Sheet */}
        <div className="mb-4 bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold mb-1">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>Surgical Keyboard Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Execute Query</span>
              <kbd className="px-1.5 py-0.5 bg-slate-950 text-cyan-300 rounded border border-slate-700">Ctrl+Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Submit Final Fix</span>
              <kbd className="px-1.5 py-0.5 bg-slate-950 text-emerald-300 rounded border border-slate-700">Ctrl+Shift+Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Indent 2 Spaces</span>
              <kbd className="px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-700">Tab</kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Close Overlay</span>
              <kbd className="px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-700">Esc</kbd>
            </div>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="bg-rose-950/20 rounded-xl p-3.5 border border-rose-500/30 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-rose-300 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Reset Surgical Records</span>
            </span>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-lg text-xs transition-colors"
              >
                Clear Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playDefibZap();
                    onResetAllProgress();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            Resets completed case stars, high scores, and streak data stored in browser localStorage.
          </p>
        </div>
      </div>
    </div>
  );
}
