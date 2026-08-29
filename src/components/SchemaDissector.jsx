import React, { useState } from 'react';
import { 
  Database, 
  Table2, 
  Columns3, 
  Eye, 
  Lock, 
  Unlock, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  PlusCircle, 
  SearchCode
} from 'lucide-react';
import { sound } from '../services/soundEngine';

export default function SchemaDissector({
  schema = {},
  onInsertSql,
  onProbeTable
}) {
  const [expandedTables, setExpandedTables] = useState(() => {
    // Default expand all discovered tables
    const init = {};
    Object.keys(schema).forEach(tbl => { init[tbl] = true; });
    return init;
  });

  const toggleTable = (tableName) => {
    sound.playExecute();
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const tableNames = Object.keys(schema);

  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-xl border border-cyan-500/30 p-3 shadow-md backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">
            Schema Anatomical Dissector
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20">
          {tableNames.length} Organs / Tables
        </span>
      </div>

      {/* Exploration Guidance */}
      <div className="text-[11px] font-mono text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800 mb-2.5 flex items-center justify-between">
        <span>💡 Click table/column to insert into SQL query</span>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {tableNames.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            Scanning patient database schema...
          </div>
        ) : (
          tableNames.map(tableName => {
            const columns = schema[tableName] || [];
            const isDiscovered = columns.length > 0;
            const isExpanded = !!expandedTables[tableName];

            return (
              <div 
                key={tableName}
                className="rounded-lg bg-slate-950/60 border border-slate-800/80 overflow-hidden transition-all duration-200 hover:border-cyan-500/40"
              >
                {/* Table Header Row */}
                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 transition-colors">
                  <button
                    onClick={() => toggleTable(tableName)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    )}
                    <Table2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                      {tableName}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Discovered Status Badge */}
                    {isDiscovered ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        <Unlock className="w-2.5 h-2.5" />
                        <span>{columns.length} Cols</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playExecute();
                          onProbeTable(tableName);
                        }}
                        className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-colors"
                        title="Scan columns with PRAGMA table_info"
                      >
                        <SearchCode className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Dissect</span>
                      </button>
                    )}

                    {/* Insert table name button */}
                    <button
                      onClick={() => {
                        sound.playExecute();
                        onInsertSql(tableName);
                      }}
                      className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-colors"
                      title={`Insert "${tableName}" into SQL terminal`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Columns Tree */}
                {isExpanded && (
                  <div className="px-3 pb-2 pt-1 border-t border-slate-900 bg-slate-950/40">
                    {isDiscovered ? (
                      <div className="space-y-1">
                        {columns.map((colStr, idx) => {
                          // colStr might be "id (INTEGER)" or just "id"
                          const match = colStr.match(/^([a-zA-Z0-9_]+)(\s*\((.+)\))?$/);
                          const colName = match ? match[1] : colStr;
                          const colType = match && match[3] ? match[3] : 'TEXT';

                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                sound.playExecute();
                                onInsertSql(colName);
                              }}
                              className="group flex items-center justify-between px-2 py-1 rounded bg-slate-900/50 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 cursor-pointer transition-all duration-150"
                            >
                              <div className="flex items-center gap-2">
                                <Columns3 className="w-3 h-3 text-cyan-500/70 group-hover:text-cyan-400" />
                                <span className="font-mono text-xs text-slate-300 group-hover:text-cyan-200 font-medium">
                                  {colName}
                                </span>
                              </div>
                              <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400 group-hover:text-cyan-400 uppercase">
                                {colType}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-2 px-1 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Columns concealed under anatomical tissue</span>
                        </div>
                        <button
                          onClick={() => {
                            sound.playExecute();
                            onProbeTable(tableName);
                          }}
                          className="w-full text-xs font-mono py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <SearchCode className="w-3 h-3" />
                          <span>Run PRAGMA Diagnostic Scan</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick PRAGMA diagnostic action */}
      <div className="pt-2 mt-2 border-t border-slate-800">
        <button
          onClick={() => {
            sound.playExecute();
            if (tableNames.length > 0) {
              onInsertSql(`PRAGMA table_info(${tableNames[0]});`);
            }
          }}
          className="w-full py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
        >
          <SearchCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Insert PRAGMA Probe Template</span>
        </button>
      </div>
    </div>
  );
}
