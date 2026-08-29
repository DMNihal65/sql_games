import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Copy, 
  Check, 
  Bot, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  HeartCrack,
  Clock,
  BatteryCharging
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { GeminiConsultant } from '../services/geminiService';

export default function SurgeryDebriefModal({
  isOpen,
  evaluation,
  currentCase,
  userSql,
  staminaRemaining,
  maxStamina = 15,
  onRetry,
  onNextCase,
  hasNextCase = false,
  onClose
}) {
  const [copied, setCopied] = useState(false);
  const [aiReview, setAiReview] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const isSuccess = evaluation?.survived;
  const stars = evaluation?.stars || 0;
  const score = evaluation?.score || 0;

  useEffect(() => {
    if (isOpen) {
      if (isSuccess) {
        sound.playSuccess();
        // Trigger celebratory medical confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#38bdf8', '#f59e0b']
        });
      } else {
        sound.playError();
      }

      // Fetch AI post-op review if Gemini key exists
      if (GeminiConsultant.hasKey()) {
        setIsLoadingAi(true);
        GeminiConsultant.getPostOpReview(currentCase, userSql, score, isSuccess)
          .then(res => setAiReview(res))
          .catch(() => setAiReview(''))
          .finally(() => setIsLoadingAi(false));
      }
    }
  }, [isOpen]);

  if (!isOpen || !evaluation) return null;

  const copyReport = () => {
    sound.playExecute();
    const reportText = `[DATA SURGEON DEBRIEF]
Case: ${currentCase.title} (#${currentCase.id})
Outcome: ${isSuccess ? 'PATIENT SURVIVED' : 'PATIENT FLATLINED'}
Score: ${score}/100 (${stars} Stars)
Stamina Remaining: ${staminaRemaining}/${maxStamina}

SURGEON QUERY:
${userSql}

OPTIMAL CLINICAL SOLUTION:
${currentCase.hiddenSolution.trim()}
`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Outcome Header Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl mb-3 bg-slate-950/80 border border-slate-800 shadow-inner">
            {isSuccess ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            ) : (
              <HeartCrack className="w-12 h-12 text-rose-500 animate-pulse" />
            )}
          </div>

          <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wider">
            {isSuccess ? (
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Surgical Operation Successful
              </span>
            ) : (
              <span className="bg-gradient-to-r from-rose-500 via-red-400 to-amber-500 bg-clip-text text-transparent">
                Patient Flatline / Cardiac Arrest
              </span>
            )}
          </h2>

          <p className="font-mono text-xs text-slate-300 mt-1">
            {evaluation.feedback || (isSuccess ? 'Database corruption neutralized.' : 'Data trauma fatal.')}
          </p>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-8 h-8 transition-all duration-300 ${
                  starIdx <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-110'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 font-mono text-center">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase">Correctness (50%)</div>
            <div className="text-lg font-bold text-emerald-400">{evaluation.accuracyScore || 0} / 50</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase">Query Speed (30%)</div>
            <div className="text-lg font-bold text-cyan-300">{evaluation.speedScore || 0} / 30</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase">Stamina Left (20%)</div>
            <div className="text-lg font-bold text-amber-300">{evaluation.staminaScore || 0} / 20</div>
          </div>
        </div>

        {/* Total Score Banner */}
        <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3.5 mb-6 font-mono text-xs">
          <span className="text-slate-300 font-medium">Composite Surgical Rating:</span>
          <span className="text-cyan-300 text-lg font-black">{score} / 100 PTS</span>
        </div>

        {/* Optimal Clinical Solution */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Optimal Clinical SQL Solution</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Benchmark Solution</span>
          </div>
          <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs text-cyan-200 overflow-x-auto custom-scrollbar">
            <pre className="whitespace-pre-wrap">{currentCase.hiddenSolution.trim()}</pre>
          </div>
        </div>

        {/* Clinical Concept Explanations */}
        {currentCase.concepts && (
          <div className="mb-6 bg-slate-950/50 rounded-xl p-3.5 border border-slate-800 font-mono text-xs space-y-1.5">
            <span className="text-slate-400 font-bold block text-[11px] uppercase">
              Key Pathology & Concepts Applied:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentCase.concepts.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 text-[11px]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dr. Turing AI Post-Op Debrief */}
        {aiReview && (
          <div className="mb-6 bg-purple-950/30 border border-purple-500/30 rounded-xl p-3.5 font-mono text-xs text-purple-200">
            <div className="flex items-center gap-2 font-bold text-purple-300 mb-1">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Dr. Turing's Clinical Post-Mortem:</span>
            </div>
            <p className="leading-relaxed text-[11px]">{aiReview}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={copyReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Discharge Copied!' : 'Copy Discharge Summary'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playDefibZap();
                onRetry();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Case</span>
            </button>

            {isSuccess && hasNextCase && (
              <button
                onClick={() => {
                  sound.playExecute();
                  onNextCase();
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono text-xs font-black uppercase transition-all duration-150 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <span>Next Patient</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {!hasNextCase && isSuccess && (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition-colors"
              >
                Back to Triage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
