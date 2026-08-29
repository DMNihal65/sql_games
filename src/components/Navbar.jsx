import React from 'react';
import { 
  Stethoscope, 
  Flame, 
  Sparkles, 
  Settings, 
  ChevronRight, 
  Layers, 
  Archive, 
  Gamepad2,
  User,
  LogIn
} from 'lucide-react';
import { SURGEON_RANKS } from '../services/aiCaseGenerator';

export default function Navbar({
  currentLevel,
  xp,
  streak,
  currentUser,
  onOpenJourneyMap,
  onOpenVault,
  onOpenGameHub,
  onOpenAuth,
  onOpenSettings,
  onAdmitNextPatient,
  isGenerating = false,
  archivedCount = 0
}) {
  const rankInfo = SURGEON_RANKS.find(r => r.level === currentLevel) || SURGEON_RANKS[0];
  const prevXp = rankInfo.requiredXp;
  const nextXp = rankInfo.targetXp;
  const rankProgress = Math.min(100, Math.max(0, ((xp - prevXp) / (nextXp - prevXp)) * 100));

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Arcade Game Hub Switcher & Brand */}
        <div className="flex items-center gap-3">
          {/* Game Hub Switcher */}
          <button
            onClick={onOpenGameHub}
            className="flex items-center gap-2 group px-2 py-1 -ml-1 rounded-xl hover:bg-slate-100 transition-colors"
            title="Switch SQL Game or View Arcade Hub"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  Data Surgeon
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  SQL Arcade
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Level & Rank Badge */}
          <button
            onClick={onOpenJourneyMap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-colors border border-slate-200"
            title="Open Residency Career Roadmap"
          >
            <span className="text-sm">{rankInfo.icon}</span>
            <span className="font-semibold text-slate-800">Lvl {currentLevel}: {rankInfo.rank}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Center: XP & Promotion Progress */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="text-slate-700 font-semibold">{xp} XP</span>
              <span>Next Rank: {nextXp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Operating Streak, Case Vault, Admit Next Patient, User Profile, Settings */}
        <div className="flex items-center gap-2">
          {/* Operating Streak */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold"
            title="Consecutive Days Operating"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>{streak}d</span>
          </div>

          {/* Case Vault */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
            title="Open Patient Case Vault & History"
          >
            <Archive className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden lg:inline">Vault</span>
            {archivedCount > 0 && (
              <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-full border border-slate-200 font-bold">
                {archivedCount}
              </span>
            )}
          </button>

          {/* Admit Next Patient AI Button */}
          <button
            onClick={onAdmitNextPatient}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold transition-colors shadow-xs"
            title="Admit a new emergency clinical patient case via Gemini AI"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isGenerating ? 'Synthesizing...' : 'Admit Patient'}</span>
          </button>

          {/* User Account / Profile button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
            title={currentUser ? `Logged in as ${currentUser.username}` : 'Sign In / Register'}
          >
            <span className="text-sm">{currentUser?.avatar || '🩺'}</span>
            <span className="hidden xl:inline max-w-[100px] truncate">{currentUser?.username || 'Sign In'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Gemini AI Key & Neon Database Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
