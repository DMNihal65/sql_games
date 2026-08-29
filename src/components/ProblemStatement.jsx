import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Target, 
  Lightbulb, 
  Database, 
  Table, 
  Columns, 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  Eye, 
  HeartPulse, 
  AlertTriangle, 
  Sparkles, 
  Stethoscope, 
  Activity,
  ClipboardList
} from 'lucide-react';

export default function ProblemStatement({
  problem,
  tables = [],
  tableSchemas = {},
  onInsertSql,
  onGetTableSample
}) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [activeTablePreview, setActiveTablePreview] = useState(null);
  const [sampleData, setSampleData] = useState({});
  const canvasRef = useRef(null);

  // Subtle clean ECG pulse canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    let step = 0;
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle medical grid
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // ECG wave line
      step = (step + 1.2) % width;
      ctx.beginPath();
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 1.75;

      for (let x = 0; x < width; x++) {
        const offset = (x - step + width) % width;
        let y = height / 2;

        if (offset > 40 && offset < 45) y -= 4; // P
        else if (offset >= 45 && offset < 48) y += 3; // Q
        else if (offset >= 48 && offset < 54) y -= 14; // R peak
        else if (offset >= 54 && offset < 58) y += 8; // S dip
        else if (offset >= 70 && offset < 80) y -= 6; // T

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleSample = (tableName) => {
    if (activeTablePreview === tableName) {
      setActiveTablePreview(null);
    } else {
      setActiveTablePreview(tableName);
      if (!sampleData[tableName] && onGetTableSample) {
        const data = onGetTableSample(tableName);
        setSampleData(prev => ({ ...prev, [tableName]: data }));
      }
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1">
      {/* Patient Admission File & Clinical Dossier */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 relative overflow-hidden">
        {/* Top Mini Heartbeat Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shadow-2xs">
              <HeartPulse className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                PATIENT ADMISSION DOSSIER
              </span>
              <span className="text-sm font-bold text-slate-900 leading-tight">
                {problem.patientName || 'Emergency Patient Record'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Subtle ECG Line */}
            <div className="w-20 h-6 hidden sm:block rounded-md bg-slate-50 border border-slate-200/80 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getSeverityBadge(problem.severity)}`}>
              {problem.severity || 'Urgent'}
            </span>
          </div>
        </div>

        {/* Pathology & Title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pathology: {problem.condition || 'Database Trauma'}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 leading-snug">
            {problem.title}
          </h1>
        </div>

        {/* Medical Narrative */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-xs text-slate-600 leading-relaxed font-sans space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical History:</span>
          </div>
          <p>{problem.narrative}</p>
        </div>

        {/* Target Surgical Objective Card */}
        <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-1">
            <Target className="w-4 h-4 text-teal-700" />
            <span>Surgical Treatment Objective</span>
          </div>
          <p className="text-xs font-medium text-teal-950 leading-relaxed">
            {problem.objective}
          </p>
        </div>

        {/* Concept Badges */}
        {problem.concepts && problem.concepts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Required Skills:</span>
            {problem.concepts.map((c, i) => (
              <span 
                key={i} 
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Patient Database Schema Inspector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Database className="w-4 h-4 text-teal-600" />
            <span>Database Tables & Schema</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {tables.length} table{tables.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="space-y-2">
          {tables.map(tableName => {
            const columns = tableSchemas[tableName] || [];
            const isPreviewing = activeTablePreview === tableName;
            const currentSample = sampleData[tableName];

            return (
              <div 
                key={tableName}
                className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden text-xs"
              >
                {/* Table Header */}
                <div className="p-2.5 flex items-center justify-between bg-white border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <Table className="w-3.5 h-3.5 text-teal-600" />
                    <span 
                      onClick={() => onInsertSql && onInsertSql(tableName)}
                      className="font-mono font-bold text-slate-900 hover:text-teal-700 cursor-pointer"
                      title="Click to insert table name into SQL terminal"
                    >
                      {tableName}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleSample(tableName)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors border ${
                      isPreviewing 
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isPreviewing ? 'Hide Data' : 'Inspect Records'}</span>
                  </button>
                </div>

                {/* Columns List */}
                <div className="p-2 flex flex-wrap gap-1.5">
                  {columns.map((col, idx) => (
                    <button
                      key={idx}
                      onClick={() => onInsertSql && onInsertSql(col.name)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-700 hover:text-teal-800 transition-colors text-[11px] font-mono group shadow-2xs"
                      title="Click to insert column into SQL query"
                    >
                      <Columns className="w-2.5 h-2.5 text-slate-400 group-hover:text-teal-600" />
                      <span>{col.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase">({col.type})</span>
                    </button>
                  ))}
                </div>

                {/* Sample Data Table */}
                {isPreviewing && currentSample && currentSample.columns?.length > 0 && (
                  <div className="p-2 bg-white border-t border-slate-200 overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          {currentSample.columns.map((c, i) => (
                            <th key={i} className="py-1 px-2 font-medium bg-slate-50">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {currentSample.values.map((row, rI) => (
                          <tr key={rI} className="hover:bg-slate-50">
                            {row.map((val, cI) => (
                              <td key={cI} className="py-1 px-2">
                                {val === null ? <span className="text-slate-400 italic">null</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progressive Clinical Hints */}
      {problem.hints && problem.hints.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Clinical Consultation Hints</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {revealedHints} of {problem.hints.length} revealed
            </span>
          </div>

          <div className="space-y-1.5">
            {problem.hints.slice(0, revealedHints).map((hint, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 font-medium leading-relaxed"
              >
                💡 {hint}
              </div>
            ))}
          </div>

          {revealedHints < problem.hints.length && (
            <button
              onClick={() => setRevealedHints(prev => prev + 1)}
              className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Reveal Clinical Hint #{revealedHints + 1}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
