import React, { useState } from 'react';
import { 
  BookOpen, 
  Table, 
  Columns, 
  HelpCircle, 
  Eye, 
  Search, 
  Tag, 
  Check, 
  AlertTriangle,
  FileQuestion,
  Lock,
  Plus,
  Compass
} from 'lucide-react';

export default function EvidenceNotebook({
  discoveredTables = [],
  tableSchemas = {},
  onInsertSql,
  onInspectTables,
  onGetTableSample
}) {
  const [redHerringTags, setRedHerringTags] = useState({});
  const [activePreview, setActivePreview] = useState(null);
  const [sampleData, setSampleData] = useState({});

  const toggleRedHerring = (tbl) => {
    setRedHerringTags(prev => ({
      ...prev,
      [tbl]: !prev[tbl]
    }));
  };

  const toggleSample = (tbl) => {
    if (activePreview === tbl) {
      setActivePreview(null);
    } else {
      setActivePreview(tbl);
      if (!sampleData[tbl] && onGetTableSample) {
        const data = onGetTableSample(tbl);
        setSampleData(prev => ({ ...prev, [tbl]: data }));
      }
    }
  };

  return (
    <div className="bg-[#fbf7ee] rounded-2xl border-2 border-[#e6dcbf] p-4 shadow-sm space-y-3 text-amber-950 flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#ded1b5] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-900/10 border border-amber-900/20 flex items-center justify-center text-amber-900">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-amber-800 tracking-wider block">
              DETECTIVE EVIDENCE BOARD
            </span>
            <span className="font-serif font-bold text-sm text-amber-950">
              Discovered Police Tables ({discoveredTables.length} Found)
            </span>
          </div>
        </div>

        <button
          onClick={onInspectTables}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#eedfc5] hover:bg-[#e4d1b0] text-amber-950 rounded-xl border border-[#ded1b5] transition-colors shadow-2xs"
          title="Run query to discover all tables in police database"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Scan All Tables</span>
        </button>
      </div>

      {/* Discovered Tables Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {discoveredTables.length === 0 ? (
          <div className="p-8 bg-[#f4ecdc] rounded-2xl border-2 border-dashed border-[#ded1b5] text-center text-xs font-serif text-amber-900/80 space-y-3 my-auto">
            <FileQuestion className="w-10 h-10 mx-auto text-amber-700/60" />
            <div>
              <p className="font-bold text-sm text-amber-950">Database Schema is Undocumented</p>
              <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
                In blind cold case forensics, you must run discovery queries to find what tables and clues exist in the mainframe.
              </p>
            </div>
            <button
              onClick={onInspectTables}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 text-amber-100 font-mono text-xs font-bold rounded-xl hover:bg-amber-800 transition-colors shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Run Master Schema Discovery</span>
            </button>
          </div>
        ) : (
          discoveredTables.map(tableName => {
            const columns = tableSchemas[tableName] || [];
            const isRedHerringTagged = !!redHerringTags[tableName];
            const isPreviewing = activePreview === tableName;
            const currentSample = sampleData[tableName];

            return (
              <div
                key={tableName}
                className={`rounded-xl border-2 transition-all overflow-hidden text-xs ${
                  isRedHerringTagged 
                    ? 'border-rose-300 bg-rose-50/40' 
                    : 'border-[#ded1b5] bg-[#f7f0e1]'
                }`}
              >
                {/* Table Header */}
                <div className="p-3 flex flex-wrap items-center justify-between gap-2 bg-[#fbf7ee] border-b border-[#e2d5b3]">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-amber-800" />
                    <span
                      onClick={() => onInsertSql && onInsertSql(tableName)}
                      className="font-mono font-bold text-sm text-amber-950 hover:text-amber-700 cursor-pointer"
                      title="Click to insert table name into terminal"
                    >
                      {tableName}
                    </span>
                    {isRedHerringTagged && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        ❓ Planted Red Herring
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleRedHerring(tableName)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-colors ${
                        isRedHerringTagged
                          ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                          : 'bg-[#f4ecdc] text-amber-900 border-[#ded1b5] hover:bg-[#eedfc5]'
                      }`}
                      title="Flag or unflag this table as a suspected dead end"
                    >
                      {isRedHerringTagged ? 'Untag Herring' : 'Tag Herring'}
                    </button>

                    <button
                      onClick={() => toggleSample(tableName)}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-[#f4ecdc] text-amber-900 border border-[#ded1b5] hover:bg-[#eedfc5] transition-colors"
                    >
                      {isPreviewing ? 'Hide Data' : 'Inspect Rows'}
                    </button>
                  </div>
                </div>

                {/* Columns */}
                <div className="p-2.5 flex flex-wrap gap-1.5">
                  {columns.length === 0 ? (
                    <button
                      onClick={() => onInsertSql && onInsertSql(`PRAGMA table_info(${tableName});`)}
                      className="text-[11px] font-mono text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                    >
                      <span>Click to run: PRAGMA table_info({tableName})</span>
                    </button>
                  ) : (
                    columns.map((col, idx) => (
                      <button
                        key={idx}
                        onClick={() => onInsertSql && onInsertSql(col.name)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fbf7ee] hover:bg-[#eedfc5] border border-[#ded1b5] text-amber-950 font-mono text-[11px] transition-colors shadow-2xs"
                        title="Click to insert column into query"
                      >
                        <Columns className="w-3 h-3 text-amber-700" />
                        <span>{col.name}</span>
                        <span className="text-[9px] text-amber-700 uppercase">({col.type})</span>
                      </button>
                    ))
                  )}
                </div>

                {/* Sample Data Table */}
                {isPreviewing && currentSample && currentSample.columns?.length > 0 && (
                  <div className="p-2.5 bg-white border-t-2 border-[#ded1b5] overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#ded1b5] text-amber-900">
                          {currentSample.columns.map((c, i) => (
                            <th key={i} className="py-1 px-2 font-bold bg-[#f4ecdc] whitespace-nowrap">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {currentSample.values.map((row, rI) => (
                          <tr key={rI} className="hover:bg-slate-50">
                            {row.map((val, cI) => (
                              <td key={cI} className="py-1 px-2 whitespace-nowrap">
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
          })
        )}
      </div>
    </div>
  );
}
