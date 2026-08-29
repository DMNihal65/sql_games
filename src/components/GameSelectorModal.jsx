import React from 'react';
import { 
  X, 
  Gamepad2, 
  Stethoscope, 
  Search, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  Terminal,
  Fingerprint
} from 'lucide-react';

export const ARCADE_GAMES = [
  {
    id: 'data_surgeon',
    title: 'Data Surgeon',
    subtitle: 'Trauma SQL Operating Theater',
    icon: '🩺',
    badge: 'LIVE & ACTIVE',
    status: 'active',
    themeColor: 'teal',
    description: 'Diagnose corrupted electronic health records, impute sensor drop telemetry, cross-reference fatal drug interactions, and stabilize patient databases.',
    mechanics: [
      '100% Dynamic Gemini AI Cases',
      '8-Rank Surgical Residency Career',
      'In-Memory SQLite WASM Engine',
      'Neon Cloud Synchronization'
    ],
    accentClasses: 'border-teal-500 bg-teal-50/50 text-teal-800 ring-1 ring-teal-400'
  },
  {
    id: 'cold_case',
    title: 'Cold Case Files',
    subtitle: 'Noir Forensic SQL Detective',
    icon: '🔍',
    badge: 'LIVE & ACTIVE',
    status: 'active',
    themeColor: 'amber',
    description: 'Investigate unsolved homicides by reverse-engineering completely undocumented police databases. Filter out red-herring evidence and unmask the killer.',
    mechanics: [
      'Blind Database Discovery',
      'Alibi & Financial Forensics',
      'Red Herring Elimination',
      'Accusation Indictment Builder'
    ],
    accentClasses: 'border-amber-500 bg-amber-50/50 text-amber-900 ring-1 ring-amber-400'
  },
  {
    id: 'heist_protocol',
    title: 'Heist Protocol',
    subtitle: 'Cyber Mainframe Vault Infiltration',
    icon: '⚡',
    badge: 'COMING SOON',
    status: 'locked',
    themeColor: 'slate',
    description: 'Infiltrate high-security corporate databases, map out hidden schemas during Recon phase, and extract target payloads without triggering security honeypots.',
    mechanics: [
      'Reconnaissance vs Extraction Phases',
      'Honeypot Alarm Detection',
      'Single-Attempt Extraction',
      'Heat Level & Stealth Rating'
    ],
    accentClasses: 'border-slate-300 bg-slate-50/70 text-slate-700 opacity-80'
  }
];

export default function GameSelectorModal({
  isOpen,
  onClose,
  activeGameId = 'data_surgeon',
  onSelectGame
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                SQL Arcade — Game Hub
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a specialized SQL game. Each universe features unique themes, mechanics, and progressive challenges.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Games Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4 pr-1">
          {ARCADE_GAMES.map((game) => {
            const isActive = activeGameId === game.id;
            const isLive = game.status === 'active';

            return (
              <div
                key={game.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 ${
                  isActive
                    ? game.id === 'cold_case'
                      ? 'border-amber-700 bg-amber-50/50 shadow-md ring-2 ring-amber-600/30'
                      : 'border-teal-500 bg-teal-50/30 shadow-md ring-2 ring-teal-500/20'
                    : isLive
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs cursor-pointer'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{game.icon}</span>
                    {isLive ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        {game.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {game.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {game.title}
                  </h3>
                  <p className={`text-[11px] font-medium mb-2 ${game.id === 'cold_case' ? 'text-amber-800' : 'text-teal-700'}`}>
                    {game.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {game.description}
                  </p>

                  {/* Mechanics Pills */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Game Mechanics:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {game.mechanics.map((m, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-3 border-t border-slate-100">
                  {isLive ? (
                    <button
                      onClick={() => {
                        onSelectGame(game.id);
                        onClose();
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                        game.id === 'cold_case'
                          ? 'bg-amber-800 hover:bg-amber-900'
                          : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      <span>{isActive ? 'Currently Active' : 'Launch Game'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-xl bg-slate-200 text-slate-500 text-xs font-medium cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlocks in Next Update</span>
                    </button>
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
