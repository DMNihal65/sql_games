import React, { useRef } from 'react';
import { 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Terminal, 
  Code2,
  Sparkles,
  Scissors
} from 'lucide-react';

export default function EditorSection({
  sql,
  setSql,
  onRunQuery,
  onSubmitSolution,
  onResetDb,
  isEvaluating = false
}) {
  const textareaRef = useRef(null);

  const lines = (sql || '').split('\n');
  const lineCount = Math.max(lines.length, 5);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onSubmitSolution();
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
      setSql(prev => prev + ' ' + snippet);
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
    'SELECT * FROM ',
    'WHERE ',
    'GROUP BY ',
    'HAVING ',
    'ORDER BY ',
    'LIMIT ',
    'COALESCE(, )',
    'JOIN '
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Code2 className="w-4 h-4 text-teal-600" />
          <span>Surgical SQL Terminal</span>
        </div>

        {/* Quick Snippets */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
          {quickSnippets.map((snip, idx) => (
            <button
              key={idx}
              onClick={() => insertSnippet(snip)}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {snip.trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Box */}
      <div className="flex-1 min-h-[160px] rounded-lg border border-slate-200 bg-slate-50/50 flex overflow-hidden font-mono text-xs md:text-sm">
        {/* Line numbers */}
        <div className="w-8 bg-slate-100/70 border-r border-slate-200/80 py-3 text-right pr-2 select-none text-slate-400 text-xs">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="-- Formulate surgical SQL remedy here...&#10;-- e.g. SELECT * FROM emergency_intake WHERE ...&#10;-- Press Ctrl + Enter to test query, Ctrl + Shift + Enter to submit fix"
          className="flex-1 bg-transparent text-slate-900 p-3 outline-none resize-none leading-6 placeholder:text-slate-400 font-mono"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <span>Shortcut:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700">
            Ctrl + Enter
          </kbd>
          <span>to test</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Query / DB */}
          <button
            onClick={onResetDb}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Restore patient database to original state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Test Query */}
          <button
            onClick={onRunQuery}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/90 text-slate-800 font-semibold transition-colors border border-slate-200"
          >
            <Play className="w-3.5 h-3.5 fill-current text-slate-700" />
            <span>Test Query</span>
          </button>

          {/* Submit Final Solution */}
          <button
            onClick={onSubmitSolution}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit Surgical Fix</span>
          </button>
        </div>
      </div>
    </div>
  );
}
