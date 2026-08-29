import React, { useEffect, useRef, useState } from 'react';
import { 
  HeartPulse, 
  AlertTriangle, 
  FileText, 
  Target, 
  Lightbulb, 
  BatteryMedium, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { sound } from '../services/soundEngine';

export default function PatientVitals({
  currentCase,
  stamina,
  maxStamina = 15,
  phase = 'diagnostic', // 'diagnostic' | 'surgery'
  isCaseCompleted = false,
  onAskAiHint
}) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(true);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Reset revealed hints when case changes
  useEffect(() => {
    setRevealedHints(0);
  }, [currentCase.id]);

  // ECG Pulse Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    let x = 0;
    let step = 0;
    const points = [];
    const maxPoints = Math.floor(width / 2);

    // Heart rate speed based on stamina & phase
    let speed = 2;
    if (stamina <= 3) speed = 4.5;
    else if (phase === 'surgery') speed = 3;

    const render = () => {
      ctx.fillStyle = 'rgba(7, 11, 19, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 15) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Generate ECG waveform pattern
      step = (step + 1) % 120;
      let y = height / 2;

      if (stamina === 0 && !isCaseCompleted) {
        // Flatline
        y = height / 2;
      } else {
        // Heart wave (P-Q-R-S-T)
        if (step === 20) y -= height * 0.15; // P wave
        else if (step === 30) y += height * 0.1; // Q dip
        else if (step === 34) y -= height * 0.45; // R peak
        else if (step === 38) y += height * 0.35; // S dip
        else if (step === 55) y -= height * 0.2; // T wave
        else y += (Math.random() - 0.5) * 2; // subtle baseline noise
      }

      points.push({ x, y });
      if (points.length > maxPoints) {
        points.shift();
      }

      // Draw glowing ECG line
      ctx.beginPath();
      ctx.lineWidth = 2;
      if (stamina <= 3) {
        ctx.strokeStyle = '#ef4444'; // Red alarm
        ctx.shadowColor = '#ef4444';
      } else if (phase === 'surgery') {
        ctx.strokeStyle = '#f59e0b'; // Amber surgery active
        ctx.shadowColor = '#f59e0b';
      } else {
        ctx.strokeStyle = '#10b981'; // Green normal
        ctx.shadowColor = '#10b981';
      }
      ctx.shadowBlur = 8;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const drawX = (i / maxPoints) * width;
        if (i === 0) ctx.moveTo(drawX, pt.y);
        else ctx.lineTo(drawX, pt.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Scanning cursor
      x = (x + speed) % width;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stamina, phase, isCaseCompleted]);

  // Periodic vital sign audio pulse when stamina is low or in surgery
  useEffect(() => {
    if (stamina <= 3 && stamina > 0) {
      const interval = setInterval(() => {
        sound.playCriticalAlarm();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [stamina]);

  const staminaPercent = (stamina / maxStamina) * 100;
  const getStaminaColor = () => {
    if (stamina > 8) return 'from-emerald-500 to-teal-400';
    if (stamina > 3) return 'from-amber-500 to-yellow-400';
    return 'from-rose-600 to-red-500 animate-pulse';
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 select-none custom-scrollbar">
      {/* Patient Telemetry & ECG Card */}
      <div className="rounded-xl bg-slate-900/80 border border-cyan-500/30 p-3.5 shadow-md shadow-cyan-950/20 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HeartPulse className={`w-4 h-4 ${stamina <= 3 ? 'text-rose-400 animate-ping' : 'text-emerald-400'}`} />
            <span className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">
              Patient Telemetry HUD
            </span>
          </div>
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold ${getSeverityBadge(currentCase.severity)}`}>
            {currentCase.severity || 'Urgent'} Priority
          </span>
        </div>

        {/* Real-time ECG Waveform */}
        <div className="relative w-full h-14 rounded-lg bg-cyber-darker/90 border border-slate-800 overflow-hidden mb-3">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute top-1 right-2 flex items-center gap-3 text-[10px] font-mono">
            <span className="text-slate-400">HR: <b className={`${stamina <= 3 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>{stamina <= 3 ? '135 BPM ⚠️' : '78 BPM'}</b></span>
            <span className="text-slate-400">SPO2: <b className="text-cyan-300">98%</b></span>
          </div>
        </div>

        {/* Patient Identity Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400 text-[10px] block">PATIENT NAME</span>
            <span className="text-slate-100 font-semibold truncate block">{currentCase.patientName || 'Anonymous Record'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">CLINICAL CONDITION</span>
            <span className="text-rose-300 font-semibold truncate block">{currentCase.condition || 'Data Trauma'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">TIER & LEVEL</span>
            <span className="text-cyan-300 block">{currentCase.tierName} (T{currentCase.tier})</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">DIFFICULTY</span>
            <span className="text-amber-300 block font-medium">{currentCase.difficulty}</span>
          </div>
        </div>

        {/* Surgical Stamina Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <BatteryMedium className={`w-3.5 h-3.5 ${stamina <= 3 ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
              <span className="font-semibold text-[11px]">Surgical Stamina:</span>
            </div>
            <span className={`font-bold ${stamina <= 3 ? 'text-rose-400 text-sm' : 'text-cyan-300'}`}>
              {stamina} / {maxStamina} Attempts
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getStaminaColor()}`}
              style={{ width: `${staminaPercent}%` }}
            />
          </div>
          {stamina <= 3 && stamina > 0 && (
            <p className="text-[10px] font-mono text-rose-400 flex items-center gap-1 mt-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              CRITICAL: Patient nearing cardiac arrest! Plan final fix carefully.
            </p>
          )}
          {stamina === 0 && (
            <p className="text-[10px] font-mono text-rose-500 flex items-center gap-1 mt-1 font-bold">
              <ShieldAlert className="w-3 h-3 flex-shrink-0" />
              FLATLINE: Stamina exhausted. Patient requires defibrillator reset.
            </p>
          )}
        </div>
      </div>

      {/* Narrative & Surgical Objective */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 shadow-md backdrop-blur-sm space-y-3">
        {/* Narrative */}
        <div>
          <button
            onClick={() => setIsNarrativeExpanded(!isNarrativeExpanded)}
            className="flex items-center justify-between w-full text-left group mb-1.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 group-hover:text-cyan-300 font-bold uppercase">
              <FileText className="w-3.5 h-3.5" />
              <span>Medical Trauma Narrative</span>
            </div>
            {isNarrativeExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          {isNarrativeExpanded && (
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
              {currentCase.narrative}
            </p>
          )}
        </div>

        {/* Objective */}
        <div className="rounded-lg bg-gradient-to-br from-cyan-950/50 to-slate-950 border border-cyan-500/40 p-3 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 uppercase mb-1">
            <Target className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Surgical Objective</span>
          </div>
          <p className="text-xs font-medium text-slate-100 leading-relaxed">
            {currentCase.objective}
          </p>
        </div>

        {/* Clinical Concepts */}
        {currentCase.concepts && currentCase.concepts.length > 0 && (
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Required Surgical Concepts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentCase.concepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 text-[11px] font-mono border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progressive Hints & Clinical Guidance */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold uppercase">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Surgical Consult Hints</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {revealedHints} of {currentCase.hints?.length || 0} Unlocked
          </span>
        </div>

        {/* Revealed Hints */}
        <div className="space-y-2 mb-2">
          {currentCase.hints?.slice(0, revealedHints).map((hint, idx) => (
            <div
              key={idx}
              className="text-xs font-mono text-amber-200/90 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg flex items-start gap-2 animate-fadeIn"
            >
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-snug text-[11px]">{hint}</p>
            </div>
          ))}
        </div>

        {/* Reveal Next Hint Button & AI Ask */}
        <div className="flex items-center gap-2">
          {currentCase.hints && revealedHints < currentCase.hints.length && (
            <button
              onClick={() => {
                sound.playExecute();
                setRevealedHints(prev => prev + 1);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-mono transition-all duration-150"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Reveal Hint #{revealedHints + 1}</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playExecute();
              onAskAiHint();
            }}
            className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 text-xs font-mono transition-all duration-150 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
            title="Ask Chief of Surgery Dr. Turing for clinical consult"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Advice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
