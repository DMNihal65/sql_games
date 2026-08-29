import React, { useRef } from 'react';
import { 
  Play, 
  Search, 
  RotateCcw, 
  Terminal, 
  Gavel, 
  Code2,
  Clock,
  Sparkles,
  BookOpen,
  Maximize2
} from 'lucide-react';

export default function DetectiveTerminal({
  sql,
  setSql,
  onRunQuery,
  onOpenAccusation,
  onResetDb,
  queryResults,
  error,
  isExecuting = false
}) {
  const textareaRef = useRef(null);

  const lines = (sql || '').split('\n');
  const lineCount = Math.max(lines.length, 6);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onOpenAccusation();
      } else {
        onRunQuery();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newSql = sql.substring(0, start) + '  ' + sql.substring(end);
      setSql(newSql);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const insertSnippet = (snippet) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setSql(prev => prev ? `${prev} ${snippet}` : snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newSql = sql.substring(0, start) + snippet + sql.substring(end);
    setSql(newSql);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    }, 0);
  };

  const quickSnippets = [
    { label: 'Scan Tables', code: "SELECT name FROM sqlite_master WHERE type='table';" },
    { label: 'PRAGMA', code: "PRAGMA table_info();" },
    { label: 'SELECT *', code: "SELECT * FROM " },
    { label: 'JOIN', code: "JOIN  ON " },
    { label: 'WHERE', code: "WHERE " },
    { label: 'LIKE', code: "LIKE '%'" }
  ];

  const columns = queryResults?.columns || [];
  const rows = queryResults?.values || [];

  return (
    <div className="bg-[#1c1917] rounded-2xl border-2 border-[#3d362e] p-3.5 md:p-4 shadow-md flex flex-col h-full text-amber-100 min-h-[500px]">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#332c25]">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>POLICE MAINFRAME SQL TERMINAL</span>
        </div>

        {/* Quick Snippets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono py-0.5">
          {quickSnippets.map((snip, idx) => (
            <button
              key={idx}
              onClick={() => insertSnippet(snip.code)}
              className="px-2.5 py-1 rounded-lg bg-[#292524] hover:bg-[#38332f] text-amber-200 border border-[#443d35] font-medium transition-colors whitespace-nowrap shadow-2xs"
            >
              {snip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="h-44 md:h-52 rounded-xl border border-[#3d362e] bg-[#12100e] flex overflow-hidden font-mono text-xs md:text-sm shadow-inner flex-shrink-0">
        <div className="w-8 bg-[#181614] border-r border-[#2d2720] py-3 text-right pr-2 select-none text-amber-800 text-xs">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="-- Enter forensic SQL queries...&#10;-- Step 1: SELECT name FROM sqlite_master WHERE type='table';&#10;-- Step 2: PRAGMA table_info(tableName);&#10;-- Press Ctrl + Enter to run query"
          className="flex-1 bg-transparent text-amber-100 p-3 outline-none resize-none leading-6 placeholder:text-amber-900/60 font-mono"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 my-2 border-t border-[#332c25] text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-500/80 text-[11px]">
          <span>Execute:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#292524] border border-[#443d35] text-amber-300 font-bold">
            Ctrl + Enter
          </kbd>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset DB */}
          <button
            onClick={onResetDb}
            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-[#292524] border border-[#3d362e] transition-colors"
            title="Reset database to seed state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Run Query */}
          <button
            onClick={onRunQuery}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#292524] hover:bg-[#38332f] text-amber-200 font-bold border border-[#443d35] transition-colors shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Execute SQL</span>
          </button>

          {/* Make Formal Accusation Button */}
          <button
            onClick={onOpenAccusation}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold transition-all shadow-md shadow-amber-950/40"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Make Formal Accusation</span>
          </button>
        </div>
      </div>

      {/* Terminal Results Output Table */}
      <div className="flex-1 min-h-[160px] bg-[#12100e] rounded-xl border border-[#3d362e] p-2 overflow-auto flex flex-col">
        {error ? (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <span>⚠️ SQL SYNTAX OR EXECUTION ERROR:</span>
            </div>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        ) : columns.length > 0 ? (
          <div className="flex-1 overflow-auto">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#2d2720] text-[11px] text-amber-400 font-mono">
              <span>Output: {rows.length} row{rows.length === 1 ? '' : 's'} returned</span>
              <span>{columns.length} column{columns.length === 1 ? '' : 's'}</span>
            </div>
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="sticky top-0 bg-[#24201c] border-b border-[#443d35] text-amber-300">
                <tr>
                  <th className="py-1.5 px-2 w-8 text-amber-700 font-bold">#</th>
                  {columns.map((c, i) => (
                    <th key={i} className="py-1.5 px-2 font-bold uppercase whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201c] text-amber-100">
                {rows.map((row, rI) => (
                  <tr key={rI} className="hover:bg-[#24201c]/80 transition-colors">
                    <td className="py-1 px-2 text-amber-700 text-[11px]">{rI + 1}</td>
                    {row.map((val, cI) => (
                      <td key={cI} className="py-1 px-2 whitespace-nowrap">
                        {val === null ? <span className="text-amber-700 italic">null</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-xs text-amber-700/60 font-mono space-y-1">
            <Terminal className="w-6 h-6 text-amber-800/40" />
            <span>Ready for forensic execution. Run a query above to inspect crime records.</span>
          </div>
        )}
      </div>
    </div>
  );
}
