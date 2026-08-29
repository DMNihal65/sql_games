import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  Trophy, 
  Sparkles, 
  Skull, 
  AlertTriangle,
  FileQuestion,
  Fingerprint
} from 'lucide-react';

export default function CaseClosedDebriefModal({
  isOpen,
  problem,
  evaluation,
  onNextCase,
  onRetry,
  onClose
}) {
  const [copied, setCopied] = useState(false);

  const isSuccess = evaluation?.isKillerCorrect;
  const stars = evaluation?.stars || 0;
  const xpEarned = evaluation?.xpEarned || 25;
  const isLevelUp = evaluation?.isLevelUp;
  const newLevel = evaluation?.newLevel;

  React.useEffect(() => {
    if (isOpen && isSuccess && stars >= 2) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#b45309', '#78350f', '#f59e0b', '#d97706']
      });
    }
  }, [isOpen, isSuccess, stars]);

  if (!isOpen || !problem) return null;

  const copySolution = () => {
    if (problem.hiddenSolution) {
      navigator.clipboard.writeText(problem.hiddenSolution.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#fbf7ee] border-4 border-[#3d362e] rounded-2xl p-6 shadow-2xl space-y-4 text-amber-950 max-h-[90vh] overflow-y-auto">
        {/* Top Verdict Stamp Banner */}
        <div className="text-center space-y-2">
          {/* Stamp Graphic */}
          <div className="inline-block transform -rotate-3 mb-1">
            {isSuccess ? (
              <div className="border-4 border-emerald-800 text-emerald-800 font-serif font-black text-2xl uppercase px-4 py-1 tracking-widest bg-emerald-50/80 rounded-md shadow-sm">
                ★ CASE CLOSED — PERPETRATOR CONVICTED ★
              </div>
            ) : (
              <div className="border-4 border-rose-800 text-rose-800 font-serif font-black text-2xl uppercase px-4 py-1 tracking-widest bg-rose-50/80 rounded-md shadow-sm">
                ✖ COLD CASE REMAINS OPEN — WRONG SUSPECT ✖
              </div>
            )}
          </div>

          <h2 className="text-xl font-serif font-bold text-amber-950">
            {isSuccess ? 'Homicide Investigation Solved' : 'Insufficient Evidence to Indict'}
          </h2>

          <p className="text-xs font-serif text-amber-800 max-w-lg mx-auto">
            {evaluation?.feedback}
          </p>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-6 h-6 ${
                  s <= stars
                    ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                    : 'text-[#d6c7a7]'
                }`}
              />
            ))}
          </div>

          {/* XP Gained & Level Up */}
          {isSuccess && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/10 text-amber-900 border border-amber-900/20 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>+{xpEarned} Detective XP Earned</span>
            </div>
          )}

          {isLevelUp && (
            <div className="p-2.5 rounded-xl bg-amber-900/15 border-2 border-amber-900/30 text-xs font-serif font-bold text-amber-950 flex items-center justify-center gap-2 animate-bounce">
              <Trophy className="w-4 h-4 text-amber-800" />
              <span>DETECTIVE PROMOTION! You reached Rank {newLevel}!</span>
            </div>
          )}
        </div>

        {/* Unmasked Killer Dossier */}
        <div className="bg-[#f4ecdc] p-3.5 rounded-xl border border-[#ded1b5] space-y-2 text-xs font-serif">
          <div className="flex items-center justify-between border-b border-[#ded1b5] pb-2">
            <span className="font-bold uppercase text-amber-800 text-[11px] tracking-wider">
              Identified Killer / Culprit:
            </span>
            <span className="font-mono font-bold text-amber-950 text-sm">
              {problem.solutionSuspectName || 'Perpetrator'}
            </span>
          </div>

          {problem.solutionMotive && (
            <div>
              <span className="text-[11px] text-amber-800 font-bold block">Forensic Motive:</span>
              <p className="text-amber-900 italic">{problem.solutionMotive}</p>
            </div>
          )}
        </div>

        {/* Evidence Points Checklist */}
        {problem.requiredEvidencePoints && (
          <div className="bg-[#f4ecdc] p-3.5 rounded-xl border border-[#ded1b5] space-y-2 text-xs font-serif">
            <span className="font-bold uppercase text-amber-800 text-[11px] tracking-wider block">
              Forensic Evidence Chain Checklist:
            </span>
            <div className="space-y-1.5">
              {problem.requiredEvidencePoints.map((pt, idx) => {
                const isCovered = evaluation?.matchedPoints?.some(m => m.id === pt.id);
                return (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {isCovered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-800/50 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={isCovered ? 'text-amber-950 font-medium' : 'text-amber-800/70 line-through'}>
                      {pt.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Red Herrings Revealed */}
        {problem.redHerrings && problem.redHerrings.length > 0 && (
          <div className="p-3 bg-amber-900/10 rounded-xl border border-amber-900/20 text-xs font-serif space-y-1">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <FileQuestion className="w-4 h-4 text-amber-800" />
              <span>Red-Herring Dead Ends Revealed:</span>
            </span>
            <p className="text-amber-900">
              The following tables were planted dead-ends: <b className="font-mono">{problem.redHerrings.join(', ')}</b>.
            </p>
          </div>
        )}

        {/* Canonical Solution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-900">
            <span className="font-serif font-bold">Canonical Forensic Query:</span>
            <button
              onClick={copySolution}
              className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-mono font-bold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <div className="p-3 bg-[#1c1917] text-amber-200 border border-[#3d362e] rounded-xl text-xs font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{problem.hiddenSolution?.trim()}</pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#ded1b5]">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-bold text-amber-900 hover:bg-[#eedfc5] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-Investigate Case</span>
          </button>

          <button
            onClick={onNextCase}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-serif font-bold transition-colors shadow-md"
          >
            <span>Open Next Cold Case</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
