import React from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Star, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  Bot, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { sound } from '../services/soundEngine';

export default function CaseSelectModal({
  isOpen,
  onClose,
  cases = [],
  progress = {},
  currentCaseId,
  onSelectCase,
  onOpenAiGenerator
}) {
  if (!isOpen) return null;

  // Determine Daily Case Index (e.g., based on day of year mod 8)
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const dailyCaseIndex = dayOfYear % cases.length;
  const dailyCaseId = cases[dailyCaseIndex]?.id || cases[0]?.id;

  // Group cases by Tier
  const tiers = [
    { tier: 1, name: 'Tier 1: Intern Resident', desc: 'SELECT, WHERE, NULL Imputation' },
    { tier: 2, name: 'Tier 2: Junior Attending', desc: 'Multi-table JOINs, Self-JOINs' },
    { tier: 3, name: 'Tier 3: Senior Surgeon', desc: 'GROUP BY, HAVING, Subqueries, EXISTS' },
    { tier: 4, name: 'Tier 4: Chief of Surgery', desc: 'Window Functions, CTEs, Complex Cleansing' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl md:text-2xl text-slate-100 uppercase tracking-wider">
                Trauma Operating Ward Directory
              </h2>
              <p className="font-mono text-xs text-slate-400">
                Select an admitted patient file to initiate data surgical procedure
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

        {/* AI Case Generation Banner */}
        <div className="mb-4 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-purple-400 animate-pulse flex-shrink-0" />
            <div>
              <div className="font-display font-bold text-xs text-purple-200 uppercase flex items-center gap-1.5">
                <span>AI Trauma Ward Chamber</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <p className="font-mono text-[11px] text-purple-300/80">
                Generate infinite new clinical emergency scenarios with Gemini AI.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playExecute();
              onOpenAiGenerator();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/50 font-mono text-xs font-bold transition-all duration-150 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-105"
          >
            + Generate Emergency Case
          </button>
        </div>

        {/* Cases Grid Grouped By Tier */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {tiers.map(t => {
            const tierCases = cases.filter(c => c.tier === t.tier);
            if (tierCases.length === 0) return null;

            return (
              <div key={t.tier} className="space-y-2.5">
                {/* Tier Title */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                  <span className="font-display font-bold text-xs text-cyan-400 uppercase tracking-wider">
                    {t.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {t.desc}
                  </span>
                </div>

                {/* Grid of Case Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tierCases.map((patientCase, idx) => {
                    const caseProgress = progress[patientCase.id] || {};
                    const isCompleted = !!caseProgress.completed;
                    const stars = caseProgress.stars || 0;
                    const isSelected = currentCaseId === patientCase.id;
                    const isDaily = dailyCaseId === patientCase.id;

                    // Unlock logic: Case 1 is unlocked. Otherwise unlocked if previous case is completed or already played.
                    const caseIndex = cases.findIndex(c => c.id === patientCase.id);
                    const isUnlocked = caseIndex === 0 || isCompleted || (cases[caseIndex - 1] && progress[cases[caseIndex - 1].id]?.completed);

                    return (
                      <div
                        key={patientCase.id}
                        onClick={() => {
                          if (isUnlocked) {
                            sound.playExecute();
                            onSelectCase(patientCase);
                            onClose();
                          }
                        }}
                        className={`relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                          !isUnlocked
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer'
                            : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer shadow-sm'
                        }`}
                      >
                        {/* Top Meta */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            {isUnlocked ? (
                              <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className="font-mono text-[11px] text-slate-400">
                              Case #{patientCase.id.replace('surgeon-', '')}
                            </span>
                            {isDaily && (
                              <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                                <Calendar className="w-2.5 h-2.5" />
                                Today's Case
                              </span>
                            )}
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= stars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Title & Condition */}
                        <div className="mb-3">
                          <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300">
                            {patientCase.title}
                          </h4>
                          <p className="font-mono text-xs text-rose-300/90 mt-0.5 flex items-center gap-1">
                            <HeartPulse className="w-3 h-3 text-rose-400" />
                            <span>{patientCase.condition}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-sans">
                            {patientCase.narrative}
                          </p>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] font-mono">
                          <span className="text-slate-500">
                            Diff: <b className="text-slate-300">{patientCase.difficulty}</b>
                          </span>
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{caseProgress.score || 100} PTS</span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-cyan-400 flex items-center gap-1 font-medium">
                              <span>Admit</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-slate-600">Locked</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
