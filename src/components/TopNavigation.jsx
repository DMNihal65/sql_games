import React from 'react';
import { 
  Activity, 
  Flame, 
  Trophy, 
  FolderOpen, 
  Volume2, 
  VolumeX, 
  Bot, 
  Settings, 
  Sparkles, 
  Calendar
} from 'lucide-react';
import { sound } from '../services/soundEngine';

export default function TopNavigation({
  streak = 1,
  totalScore = 0,
  currentCase,
  onOpenCases,
  onOpenAi,
  onOpenSettings,
  isMuted,
  onToggleMute,
  solvedCount = 0,
  totalCases = 8
}) {
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });

  const getSurgeonRank = (score) => {
    if (score >= 600) return 'Chief of Surgery 🎖️';
    if (score >= 400) return 'Senior Surgeon 🏥';
    if (score >= 200) return 'Junior Attending 🩺';
    return 'Intern Resident 🔬';
  };

  return (
    <header className="bg-cyber-darker/90 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-lg shadow-cyan-950/20">
      {/* Left: Brand & Daily Case Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity className="w-5 h-5 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                DATA SURGEON
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                TRAUMA SQL v2.5
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span className="text-cyan-400/80 font-medium">Case #{currentCase.id.replace('surgeon-', '')}:</span>
              <span className="truncate max-w-[140px] sm:max-w-[220px] text-slate-200">{currentCase.title}</span>
            </div>
          </div>
        </div>

        {/* Daily Date Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Center: Surgeon Metrics & Streak */}
      <div className="hidden md:flex items-center gap-4">
        {/* Streak */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium shadow-[0_0_10px_rgba(245,158,11,0.15)]"
          title="Consecutive Days Operating"
        >
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{streak} Day Streak</span>
        </div>

        {/* Total Score & Rank */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono">
          <Trophy className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <div className="text-slate-400 text-[10px] leading-tight">SURGEON SCORE</div>
            <div className="text-cyan-300 font-bold leading-tight">{totalScore} PTS</div>
          </div>
          <div className="h-4 w-px bg-cyan-500/20 mx-1" />
          <span className="text-[11px] text-emerald-400 font-medium">{getSurgeonRank(totalScore)}</span>
        </div>

        {/* Patients Stabilized Counter */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <span>Triage:</span>
          <span className="text-emerald-400 font-bold">{solvedCount}</span>
          <span>/</span>
          <span>{totalCases} Saved</span>
        </div>
      </div>

      {/* Right: Actions (Lobby, AI Consultant, Audio, Settings) */}
      <div className="flex items-center gap-2">
        {/* Triage / Case Selection */}
        <button
          onClick={() => {
            sound.playExecute();
            onOpenCases();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-all duration-200 shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          title="Patient Triage Lobby"
        >
          <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">Patient Files</span>
        </button>

        {/* AI Chief of Surgery (Dr. Turing) */}
        <button
          onClick={() => {
            sound.playExecute();
            onOpenAi();
          }}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 text-purple-200 border border-purple-500/40 text-xs font-mono transition-all duration-200 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          title="Consult Dr. Turing (Chief AI Surgeon)"
        >
          <Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="font-semibold">Dr. Turing AI</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            onToggleMute();
            if (isMuted) sound.playVitalBeep(880, 0.05);
          }}
          className={`p-2 rounded-lg border transition-all duration-200 ${
            isMuted 
              ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300' 
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
          }`}
          title={isMuted ? 'Unmute Operating Room Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            sound.playExecute();
            onOpenSettings();
          }}
          className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-200"
          title="Operating Room Settings & Keys"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
