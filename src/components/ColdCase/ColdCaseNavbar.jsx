import React from 'react';
import { 
  Search, 
  Flame, 
  Sparkles, 
  Settings, 
  ChevronRight, 
  Layers, 
  Archive, 
  FolderLock,
  User,
  Fingerprint
} from 'lucide-react';
import { DETECTIVE_RANKS } from '../../services/coldCaseAiGenerator';

export default function ColdCaseNavbar({
  currentLevel,
  xp,
  streak,
  currentUser,
  onOpenJourneyMap,
  onOpenVault,
  onOpenGameHub,
  onOpenAuth,
  onOpenSettings,
  onNewColdCase,
  isGenerating = false,
  archivedCount = 0
}) {
  const rankInfo = DETECTIVE_RANKS.find(r => r.level === currentLevel) || DETECTIVE_RANKS[0];
  const prevXp = rankInfo.requiredXp;
  const nextXp = rankInfo.targetXp;
  const rankProgress = Math.min(100, Math.max(0, ((xp - prevXp) / (nextXp - prevXp)) * 100));

  return (
    <header className="bg-amber-950/20 border-b border-amber-900/30 px-4 py-2.5 sticky top-0 z-30 shadow-xs backdrop-blur-xs bg-[#1a1714]">
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Game Switcher & Detective Rank */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGameHub}
            className="flex items-center gap-2 group px-2 py-1 -ml-1 rounded-xl hover:bg-amber-950/40 transition-colors"
            title="Switch SQL Game or View Arcade Hub"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-2xs group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-amber-100 font-serif">
                  Cold Case Files
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-400 border border-amber-800/80">
                  NOIR FORENSICS
                </span>
                <ChevronRight className="w-3 h-3 text-amber-500/60 group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
          </button>

          <div className="h-5 w-px bg-amber-900/40 hidden sm:block" />

          {/* Level & Detective Rank Badge */}
          <button
            onClick={onOpenJourneyMap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 text-xs font-medium transition-colors border border-amber-900/60 font-serif"
            title="Open Detective Career Ranks"
          >
            <span className="text-sm">{rankInfo.icon}</span>
            <span className="font-semibold text-amber-100">Lvl {currentLevel}: {rankInfo.rank}</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-500/60" />
          </button>
        </div>

        {/* Center: Detective XP Progress */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-amber-300/80 font-mono">
              <span className="text-amber-200 font-semibold">{xp} Detective XP</span>
              <span>Next Rank: {nextXp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-amber-950 rounded-full overflow-hidden border border-amber-900/80">
              <div 
                className="h-full bg-amber-600 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(217,119,6,0.5)]"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Streak, Evidence Vault, New Case, User */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-semibold font-mono"
            title="Consecutive Days on the Force"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{streak}d</span>
          </div>

          {/* Evidence Vault */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border border-amber-900/60 text-xs font-semibold transition-colors font-serif"
            title="Open Solved Case Vault"
          >
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Case Archives</span>
            {archivedCount > 0 && (
              <span className="text-[10px] bg-amber-900/80 text-amber-200 px-1.5 py-0.2 rounded-full border border-amber-700 font-mono font-bold">
                {archivedCount}
              </span>
            )}
          </button>

          {/* New Cold Case Button */}
          <button
            onClick={onNewColdCase}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 disabled:bg-amber-950 text-white disabled:text-amber-500 text-xs font-bold transition-all shadow-md shadow-amber-950/30"
            title="Generate a new homicide case via Gemini AI"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isGenerating ? 'Investigating...' : 'New Cold Case'}</span>
          </button>

          {/* User Account */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border border-amber-900/60 text-xs font-semibold transition-colors"
            title={currentUser ? `Detective ${currentUser.username}` : 'Sign In'}
          >
            <span className="text-sm">{currentUser?.avatar || '🕵️'}</span>
            <span className="hidden xl:inline max-w-[100px] truncate">{currentUser?.username || 'Detective'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-900/60 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
