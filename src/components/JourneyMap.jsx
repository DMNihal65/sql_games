import React from 'react';
import { 
  X, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Trophy,
  Flame,
  Layers,
  Stethoscope
} from 'lucide-react';
import { SURGEON_RANKS } from '../services/aiCaseGenerator';

export default function JourneyMap({
  isOpen,
  onClose,
  currentLevel,
  unlockedLevel = 1,
  xp = 0,
  solvedCount = 0,
  onSelectLevel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <span>Surgical Residency Career Roadmap</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Progress through 8 medical data ranks. Gemini AI generates clinical cases on demand.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Stats Ribbon */}
        <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Current Rank</span>
            <span className="text-base font-bold text-teal-700">Level {currentLevel}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Surgeon XP</span>
            <span className="text-base font-bold text-slate-800">{xp} XP</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Patients Stabilized</span>
            <span className="text-base font-bold text-emerald-600">{solvedCount} Saved</span>
          </div>
        </div>

        {/* Levels Roadmap List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {SURGEON_RANKS.map((lvl) => {
            const isUnlocked = lvl.level <= unlockedLevel || xp >= lvl.requiredXp;
            const isCurrent = currentLevel === lvl.level;
            const isCompleted = xp >= lvl.targetXp;

            return (
              <div
                key={lvl.level}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.level);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                  !isUnlocked
                    ? 'bg-slate-50/50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : isCurrent
                    ? 'bg-teal-50/50 border-teal-300 ring-1 ring-teal-400 shadow-xs cursor-pointer'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="text-2xl">{lvl.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        Rank {lvl.level}: {lvl.rank}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                          Active Rank
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Mastered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-teal-800 font-medium mt-0.5">
                      {lvl.category}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 font-sans">
                      {lvl.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {lvl.topics.map((t, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <button className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-teal-50 text-teal-700 transition-colors shadow-xs">
                      {isCurrent ? 'Operating' : 'Select'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{lvl.requiredXp} XP</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
