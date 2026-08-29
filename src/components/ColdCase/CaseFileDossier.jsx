import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  User, 
  MapPin, 
  Calendar, 
  Edit3, 
  Lightbulb, 
  HelpCircle, 
  FileText, 
  Eye, 
  Skull,
  Fingerprint,
  Target
} from 'lucide-react';

export default function CaseFileDossier({
  problem,
  onInsertSql
}) {
  const [caseNotes, setCaseNotes] = useState(() => {
    return localStorage.getItem(`coldcase_notes_${problem?.id}`) || '';
  });
  const [revealedHints, setRevealedHints] = useState(0);

  useEffect(() => {
    if (problem?.id) {
      const saved = localStorage.getItem(`coldcase_notes_${problem.id}`) || '';
      setCaseNotes(saved);
      setRevealedHints(0);
    }
  }, [problem?.id]);

  const handleNotesChange = (text) => {
    setCaseNotes(text);
    if (problem?.id) {
      localStorage.setItem(`coldcase_notes_${problem.id}`, text);
    }
  };

  if (!problem) return null;

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1.5 pb-6">
      {/* Manila Police File Folder Card */}
      <div className="bg-[#fbf7ee] rounded-2xl border-2 border-[#e6dcbf] p-4 shadow-sm space-y-3 relative text-amber-950 flex-shrink-0">
        {/* Top Case File Tag */}
        <div className="flex items-center justify-between border-b-2 border-[#e2d5b3] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-900/10 border border-amber-900/20 flex items-center justify-center text-amber-900 font-bold text-sm shadow-inner">
              <Skull className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-800/80 block tracking-widest">
                HOMICIDE CASE FILE #{problem.id?.slice(-4) || '8704'}
              </span>
              <h2 className="text-base font-serif font-bold text-amber-950 leading-tight">
                {problem.title}
              </h2>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-amber-900/10 text-amber-900 border border-amber-900/20">
            Lvl {problem.level} Homicide
          </span>
        </div>

        {/* Victim & Crime Scene Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#f4ecdc] p-2.5 rounded-xl border border-[#ded1b5] text-xs font-mono">
          <div>
            <span className="text-[10px] text-amber-800 block uppercase font-bold">Victim:</span>
            <span className="font-bold text-amber-950 truncate block">{problem.victimName || 'Unknown Victim'}</span>
          </div>
          <div>
            <span className="text-[10px] text-amber-800 block uppercase font-bold">Occupation:</span>
            <span className="text-amber-900 truncate block">{problem.victimOccupation || 'Citizen'}</span>
          </div>
          <div>
            <span className="text-[10px] text-amber-800 block uppercase font-bold">Date of Incident:</span>
            <span className="text-amber-900 block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-700" />
              {problem.crimeDate || '1987-10-14'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-amber-800 block uppercase font-bold">Crime Scene:</span>
            <span className="text-amber-900 truncate block flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-700" />
              {problem.crimeLocation || 'City Limits'}
            </span>
          </div>
        </div>

        {/* Narrative */}
        <div className="bg-[#f7f0e1] p-3 rounded-xl border border-[#e2d5b3] text-xs text-amber-950 leading-relaxed font-serif space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-800 block tracking-wider">
            Detective Field Briefing:
          </span>
          <p className="italic">{problem.narrative}</p>
        </div>

        {/* Investigative Objective */}
        <div className="bg-amber-900/10 border-2 border-amber-900/20 rounded-xl p-3 text-xs text-amber-950 font-serif">
          <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1 text-xs">
            <Target className="w-4 h-4 text-amber-800" />
            <span>Investigative Objective</span>
          </div>
          <p className="leading-relaxed font-medium">{problem.objective}</p>
        </div>
      </div>

      {/* Detective's Case Notepad */}
      <div className="bg-[#fbf7ee] rounded-2xl border-2 border-[#e6dcbf] p-3.5 shadow-sm space-y-2 text-amber-950 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-950">
            <Edit3 className="w-3.5 h-3.5 text-amber-800" />
            <span>Detective's Case Notebook</span>
          </div>
          <span className="text-[10px] font-mono text-amber-800/80">
            Auto-saved locally
          </span>
        </div>

        <textarea
          value={caseNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Type your detective notes here (suspect alibis, call times, suspicious transactions)..."
          className="w-full h-24 p-2.5 text-xs font-mono bg-[#f4ecdc] rounded-xl border border-[#ded1b5] outline-none focus:border-amber-700 resize-none text-amber-950 placeholder:text-amber-800/50 leading-relaxed"
        />
      </div>

      {/* Forensic Consultation Hints */}
      {problem.hints && problem.hints.length > 0 && (
        <div className="bg-[#fbf7ee] rounded-2xl border-2 border-[#e6dcbf] p-3.5 shadow-sm space-y-2 text-amber-950 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-950">
              <Lightbulb className="w-4 h-4 text-amber-700" />
              <span>Forensic Consultation Clues</span>
            </div>
            <span className="text-[10px] font-mono text-amber-800/80">
              {revealedHints} / {problem.hints.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {problem.hints.slice(0, revealedHints).map((hint, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#f4ecdc] border border-[#ded1b5] text-xs font-serif text-amber-950 leading-relaxed"
              >
                🔍 {hint}
              </div>
            ))}
          </div>

          {revealedHints < problem.hints.length && (
            <button
              onClick={() => setRevealedHints(prev => prev + 1)}
              className="w-full py-1.5 px-3 rounded-xl text-xs font-mono font-bold bg-[#eedfc5] hover:bg-[#e4d1b0] text-amber-950 border border-[#ded1b5] transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Reveal Detective Clue #{revealedHints + 1}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
