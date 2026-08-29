import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Trophy, 
  Copy, 
  Check, 
  RotateCcw,
  HeartHandshake,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export default function SuccessModal({
  isOpen,
  problem,
  xpEarned = 50,
  isLevelUp = false,
  newLevel = 1,
  onNextChallenge,
  onRetry,
  onClose
}) {
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#10b981', '#f59e0b', '#06b6d4']
      });
    }
  }, [isOpen]);

  if (!isOpen || !problem) return null;

  const copySolution = () => {
    if (problem.hiddenSolution) {
      navigator.clipboard.writeText(problem.hiddenSolution.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
        {/* Header Badge */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-2">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Patient Vitals Stabilized!
          </h2>

          <p className="text-xs text-slate-500">
            Surgical fix successful. Corrupted medical data restored to healthy benchmark state.
          </p>

          {/* XP Gained & Level Up */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold mt-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>+{xpEarned} Surgeon XP Earned</span>
          </div>

          {isLevelUp && (
            <div className="mt-2 p-2.5 rounded-xl bg-teal-50 border border-teal-300 text-xs font-bold text-teal-900 flex items-center justify-center gap-2 animate-bounce">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>PROMOTION! You reached Rank Level {newLevel}!</span>
            </div>
          )}
        </div>

        {/* Canonical Solution Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Canonical Surgical SQL Remedy:</span>
            </span>
            <button
              onClick={copySolution}
              className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-medium"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 overflow-x-auto">
            <pre className="whitespace-pre-wrap">{problem.hiddenSolution?.trim()}</pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-operate</span>
          </button>

          <button
            onClick={onNextChallenge}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>Admit Next Patient</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
