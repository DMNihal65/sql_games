import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Send, 
  Stethoscope, 
  Scissors, 
  History, 
  RotateCcw, 
  Terminal, 
  Sparkles, 
  Code2, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Maximize2
} from 'lucide-react';
import { sound } from '../services/soundEngine';

export default function SqlTerminal({
  sql,
  setSql,
  phase, // 'diagnostic' | 'surgery'
  onSwitchToSurgery,
  onExecuteQuery,
  onSubmitSurgery,
  onResetDb,
  queryHistory = [],
  stamina = 15,
  isExecuting = false,
  onFormatSql
}) {
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef(null);

  // Line numbers calculation
  const lines = (sql || '').split('\n');
  const lineCount = Math.max(lines.length, 6);

  // Handle Tab key and Keyboard Shortcuts (Ctrl+Enter to Execute, Ctrl+Shift+Enter to Submit)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey && phase === 'surgery') {
        onSubmitSurgery();
      } else {
        onExecuteQuery();
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
    sound.playExecute();
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

  const snippets = [
    { label: 'SELECT * FROM', code: 'SELECT * FROM ' },
    { label: 'WHERE', code: 'WHERE ' },
    { label: 'JOIN ON', code: 'JOIN  ON ' },
    { label: 'GROUP BY', code: 'GROUP BY ' },
    { label: 'HAVING', code: 'HAVING ' },
    { label: 'ORDER BY', code: 'ORDER BY ' },
    { label: 'COALESCE()', code: 'COALESCE(, )' },
    { label: 'ROW_NUMBER()', code: 'ROW_NUMBER() OVER (PARTITION BY  ORDER BY )' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-cyan-500/30 p-3 shadow-md backdrop-blur-sm relative">
      {/* Top Bar: Phase Indicator, Mode Switcher, and Tools */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
        {/* Phase Pill */}
        <div className="flex items-center gap-2">
          {phase === 'diagnostic' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono shadow-[0_0_8px_rgba(20,184,166,0.2)]">
              <Stethoscope className="w-4 h-4 text-teal-400 animate-pulse" />
              <span className="font-bold">DIAGNOSTIC PHASE</span>
              <span className="text-[10px] text-teal-400/70">(Read-Only)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse">
              <Scissors className="w-4 h-4 text-rose-400" />
              <span className="font-bold">SURGERY PHASE ACTIVE</span>
              <span className="text-[10px] text-rose-400/80">(DML Allowed)</span>
            </div>
          )}

          {/* Phase Transition Trigger */}
          {phase === 'diagnostic' && (
            <button
              onClick={() => {
                sound.playScalpelSwoosh();
                onSwitchToSurgery();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-mono text-xs font-bold transition-all duration-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] hover:scale-105"
              title="Transition from diagnostic exploration to active surgical intervention"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Scalpel Ready (Begin Surgery)</span>
            </button>
          )}
        </div>

        {/* Right Tools: Defibrillator Reset, Query History */}
        <div className="flex items-center gap-2">
          {/* History Drawer Button */}
          <button
            onClick={() => {
              sound.playExecute();
              setShowHistory(!showHistory);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
              showHistory 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' 
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="View query history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({queryHistory.length})</span>
          </button>

          {/* Defibrillator DB Reset */}
          <button
            onClick={() => {
              sound.playDefibZap();
              onResetDb();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 text-xs font-mono transition-colors"
            title="Defibrillate / Restore clean initial database state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Defibrillate (Reset DB)</span>
          </button>
        </div>
      </div>

      {/* Snippets Quick Insertion Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 custom-scrollbar text-[11px] font-mono select-none">
        <span className="text-slate-500 text-[10px] uppercase font-bold flex-shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400" />
          Snippets:
        </span>
        {snippets.map((snip, idx) => (
          <button
            key={idx}
            onClick={() => insertSnippet(snip.code)}
            className="px-2 py-0.5 rounded bg-slate-950 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 whitespace-nowrap transition-all duration-150"
          >
            {snip.label}
          </button>
        ))}
      </div>

      {/* Code Editor Area */}
      <div className="relative flex-1 rounded-lg bg-cyber-darker border border-slate-800 overflow-hidden font-mono flex">
        {/* Line Numbers */}
        <div className="w-10 bg-slate-950/80 border-r border-slate-800/80 py-3 text-right pr-2 select-none text-slate-600 text-xs font-mono">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            phase === 'diagnostic'
              ? '-- Enter exploratory SQL (SELECT, PRAGMA table_info)\n-- e.g. SELECT * FROM patients LIMIT 10;\n-- Shortcut: Press Ctrl + Enter to run'
              : '-- SURGERY ACTIVE: Formulate final repair query or DML\n-- e.g. SELECT id, name FROM ...\n-- Press Ctrl + Enter to test, or click Submit Final Fix'
          }
          className="flex-1 bg-transparent text-slate-100 p-3 text-xs md:text-sm font-mono outline-none resize-none leading-6 placeholder:text-slate-600 custom-scrollbar selection:bg-cyan-500/30 selection:text-cyan-100"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />

        {/* Query History Slide-Over Drawer */}
        {showHistory && (
          <div className="absolute inset-y-0 right-0 w-80 bg-slate-950/95 border-l border-cyan-500/30 p-3 z-20 backdrop-blur-md flex flex-col shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-display font-bold text-xs text-cyan-300 uppercase">
                Surgical Query Log
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {queryHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No previous incisions or queries logged.
                </div>
              ) : (
                queryHistory.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      sound.playExecute();
                      setSql(item.sql);
                      setShowHistory(false);
                    }}
                    className="p-2 rounded bg-slate-900 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        {item.success ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>#{queryHistory.length - idx}</span>
                      </span>
                      <span>{item.executionTimeMs}ms</span>
                    </div>
                    <pre className="text-[11px] text-slate-300 font-mono line-clamp-3 group-hover:text-cyan-200 whitespace-pre-wrap break-all">
                      {item.sql}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer: Shortcuts, Run Button, Submit Fix Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-800">
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span>Keyboard:</span>
          <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-cyan-300 font-mono">
            Ctrl + Enter
          </kbd>
          <span className="hidden sm:inline">to execute</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Test / Execute Button */}
          <button
            onClick={() => {
              sound.playExecute();
              onExecuteQuery();
            }}
            disabled={isExecuting || stamina <= 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all duration-200 shadow-md ${
              stamina <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{phase === 'diagnostic' ? 'Run Diagnostic' : 'Test Surgical Query'}</span>
          </button>

          {/* Submit Final Surgery Fix Button (Active in Surgery Phase) */}
          {phase === 'surgery' && (
            <button
              onClick={() => {
                sound.playScalpelSwoosh();
                onSubmitSurgery();
              }}
              disabled={isExecuting || stamina <= 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-black uppercase transition-all duration-200 shadow-lg ${
                stamina <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 animate-pulse'
              }`}
              title="Submit this query as your definitive surgical solution"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Final Fix</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
