import React, { useState } from 'react';
import { 
  Table, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  GitCompare, 
  Layers, 
  Eye, 
  Bot,
  HelpCircle
} from 'lucide-react';
import { sound } from '../services/soundEngine';

export default function QueryResults({
  results,
  error,
  lastSql,
  expectedResult = [],
  onAskAiDiagnosis
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'diff' | 'explain'

  const columns = results?.columns || [];
  const rows = results?.values || [];
  const executionTimeMs = results?.executionTimeMs || 0;
  const explainPlan = results?.explainPlan || [];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-cyan-500/30 p-3 shadow-md backdrop-blur-sm relative">
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Table className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">
              Clinical Telemetry Monitor
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'output'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Output ({rows.length})
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'diff'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3 h-3" />
              <span>Target Diff</span>
            </button>
            {explainPlan.length > 0 && (
              <button
                onClick={() => setActiveTab('explain')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === 'explain'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Query Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Execution Metrics */}
        {results && !error && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{executionTimeMs} ms</span>
            </span>
            <span className="text-emerald-400 font-semibold">
              {rows.length} rows returned
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Error State */}
        {error ? (
          <div className="h-full overflow-y-auto bg-rose-950/20 border border-rose-500/40 rounded-lg p-4 font-mono animate-fadeIn flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>SURGICAL MALFUNCTION DETECTED:</span>
              </div>
              <pre className="text-xs text-rose-200/90 whitespace-pre-wrap break-all bg-slate-950/80 p-3 rounded-lg border border-rose-500/30">
                {error}
              </pre>
            </div>

            {/* Instant AI Error Triage */}
            <div className="mt-3 pt-3 border-t border-rose-500/30 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Need trauma advice on this SQL error?
              </span>
              <button
                onClick={() => {
                  sound.playExecute();
                  onAskAiDiagnosis(error, lastSql);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-xs font-mono transition-all duration-150 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>Triage Error with Dr. Turing</span>
              </button>
            </div>
          </div>
        ) : activeTab === 'output' ? (
          /* Table Output Grid */
          columns.length > 0 ? (
            <div className="h-full overflow-auto rounded-lg border border-slate-800 bg-cyber-darker custom-scrollbar">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 border-b border-cyan-500/30 z-10">
                  <tr>
                    <th className="px-3 py-2 text-slate-500 font-bold w-12 text-right">#</th>
                    {columns.map((col, idx) => (
                      <th key={idx} className="px-3 py-2 text-cyan-300 font-bold uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rows.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className="hover:bg-cyan-950/20 transition-colors"
                    >
                      <td className="px-3 py-1.5 text-slate-600 font-mono text-right text-[11px]">
                        {rIdx + 1}
                      </td>
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 text-slate-200">
                          {val === null || val === undefined ? (
                            <span className="italic text-rose-400/80 font-semibold bg-rose-950/40 px-1 rounded">
                              NULL
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : results?.message ? (
            <div className="h-full flex items-center justify-center text-center p-4 bg-slate-950/40 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto animate-pulse" />
                <p className="font-mono text-xs text-slate-200">{results.message}</p>
                <p className="font-mono text-[11px] text-slate-500">
                  Executed in {executionTimeMs}ms
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 font-mono text-xs">
              <Eye className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
              <span>Awaiting surgical query execution...</span>
              <span className="text-[11px] text-slate-600 mt-1">
                Run non-destructive SELECT or PRAGMA queries to inspect organ databases.
              </span>
            </div>
          )
        ) : activeTab === 'diff' ? (
          /* Target Diff Mode */
          <div className="h-full overflow-auto p-2 bg-slate-950/60 rounded-lg border border-slate-800 custom-scrollbar space-y-3">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Expected Target Rows: <b className="text-emerald-400">{expectedResult.length}</b></span>
              <span>Your Current Rows: <b className="text-cyan-300">{rows.length}</b></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Target Expected State */}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-2.5">
                <div className="font-bold text-emerald-400 text-xs mb-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Expected Healthy Patient State</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {expectedResult.map((expRow, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-slate-950/80 border border-emerald-500/20 text-[11px] text-slate-300">
                      {JSON.stringify(expRow)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Player State */}
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/10 p-2.5">
                <div className="font-bold text-cyan-300 text-xs mb-1.5 flex items-center gap-1">
                  <Table className="w-3.5 h-3.5" />
                  <span>Your Current Output</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {rows.length === 0 ? (
                    <div className="text-slate-500 text-center py-4 text-[11px]">
                      No rows returned yet.
                    </div>
                  ) : (
                    rows.map((userRow, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-950/80 border border-cyan-500/20 text-[11px] text-slate-300">
                        {JSON.stringify(userRow)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Explain Query Plan */
          <div className="h-full overflow-auto p-3 bg-slate-950/80 rounded-lg border border-slate-800 custom-scrollbar font-mono text-xs space-y-2">
            <div className="text-slate-400 font-bold text-xs flex items-center gap-1.5 text-cyan-300">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>SQLite Query Execution Engine Plan:</span>
            </div>
            {explainPlan.map((step, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs">
                {step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
