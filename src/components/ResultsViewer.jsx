import React, { useState } from 'react';
import { 
  Table, 
  AlertCircle, 
  CheckCircle, 
  GitCompare, 
  Clock, 
  Sparkles, 
  Activity,
  Bot,
  Eye
} from 'lucide-react';

export default function ResultsViewer({
  results,
  error,
  expectedResult = [],
  onExplainError,
  isExplaining = false,
  aiExplanation = ''
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'diff'

  const columns = results?.columns || [];
  const rows = results?.values || [];
  const rowCount = rows.length;
  const executionTimeMs = results?.executionTimeMs || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'output'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Query Output ({rowCount})
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'diff'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3 h-3" />
              <span>Target Comparator</span>
            </button>
          </div>
        </div>

        {results && !error && (
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{executionTimeMs}ms</span>
            </span>
            <span className="text-teal-700 font-medium">{rowCount} row{rowCount === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>

      {/* Main Results View */}
      <div className="flex-1 overflow-hidden relative">
        {error ? (
          /* Error State */
          <div className="h-full overflow-y-auto p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Clinical Telemetry / SQL Error</span>
              </div>
              <pre className="font-mono text-rose-900 bg-white p-2.5 rounded border border-rose-200 whitespace-pre-wrap break-all">
                {error}
              </pre>
            </div>

            {/* AI Error Explanation */}
            {aiExplanation ? (
              <div className="bg-white p-3 rounded-lg border border-rose-200 text-slate-700 space-y-1">
                <span className="font-bold text-teal-700 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-teal-600" />
                  <span>Dr. Turing's Clinical Diagnosis:</span>
                </span>
                <p className="leading-relaxed">{aiExplanation}</p>
              </div>
            ) : (
              <button
                onClick={onExplainError}
                disabled={isExplaining}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExplaining ? 'Triage Analyzing...' : 'Triage Error with AI'}</span>
              </button>
            )}
          </div>
        ) : activeTab === 'output' ? (
          /* Table Output */
          columns.length > 0 ? (
            <div className="h-full overflow-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold z-10">
                  <tr>
                    <th className="py-1.5 px-3 w-10 text-right text-slate-400">#</th>
                    {columns.map((c, i) => (
                      <th key={i} className="py-1.5 px-3 uppercase tracking-wider">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {rows.map((row, rI) => (
                    <tr key={rI} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-right text-slate-400 text-[11px]">{rI + 1}</td>
                      {row.map((val, cI) => (
                        <td key={cI} className="py-1.5 px-3">
                          {val === null || val === undefined ? (
                            <span className="text-slate-400 italic text-[11px] bg-slate-100 px-1 rounded">null</span>
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
            <div className="h-full flex items-center justify-center text-center p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
              {results.message}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs font-sans">
              <Activity className="w-6 h-6 mb-1.5 text-slate-300" />
              <span>Test or submit a query to observe patient database output</span>
            </div>
          )
        ) : (
          /* Target Diff Mode */
          <div className="h-full overflow-auto space-y-3 p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {/* Expected State */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
                <div className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1 font-sans">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target Healthy Records ({expectedResult.length} rows)</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {expectedResult.map((exp, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-white border border-emerald-100 text-[11px] text-slate-800">
                      {JSON.stringify(exp)}
                    </div>
                  ))}
                </div>
              </div>

              {/* User Output State */}
              <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-2.5">
                <div className="font-bold text-teal-900 mb-1.5 flex items-center gap-1 font-sans">
                  <Table className="w-3.5 h-3.5 text-teal-600" />
                  <span>Your Current Incision ({rows.length} rows)</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {rows.length === 0 ? (
                    <div className="text-slate-400 text-center py-4 text-[11px]">
                      No rows returned
                    </div>
                  ) : (
                    rows.map((userRow, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-white border border-teal-100 text-[11px] text-slate-800">
                        {JSON.stringify(userRow)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
