import React, { useState } from 'react';
import { 
  X, 
  Archive, 
  Search, 
  Filter, 
  CheckCircle2, 
  RotateCcw, 
  Code, 
  ChevronRight, 
  HeartPulse, 
  Calendar,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { SURGEON_RANKS } from '../services/aiCaseGenerator';

export default function CaseVaultModal({
  isOpen,
  onClose,
  pastCases = [],
  onSelectCaseToResolve
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCaseId, setExpandedCaseId] = useState(null);

  if (!isOpen) return null;

  const filteredCases = pastCases.filter(c => {
    const matchesSearch = 
      (c.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.patientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.condition?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === 'all' || c.level === parseInt(levelFilter, 10);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Archive className="w-5 h-5 text-teal-600" />
              <span>Patient Case Vault & Medical Archive</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and re-solve any past patient cases synced to Neon PostgreSQL.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients, conditions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-slate-50"
            />
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">All Residency Ranks</option>
            {SURGEON_RANKS.map(r => (
              <option key={r.level} value={r.level}>
                Rank {r.level}: {r.rank}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="solved">Stabilized (Solved)</option>
            <option value="unsolved">In Progress (Unsolved)</option>
          </select>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredCases.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-sans">
              <Database className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span>No archived patient records match your filter criteria.</span>
            </div>
          ) : (
            filteredCases.map((c) => {
              const caseId = c.caseId || c.case_id || c.id;
              const isSolved = c.status === 'solved';
              const isExpanded = expandedCaseId === caseId;
              const patientName = c.patientName || c.patient_name || 'Patient Record';
              const condition = c.condition || 'Data Trauma';
              const rankName = c.rankTitle || c.rank_title || `Rank ${c.level}`;

              return (
                <div
                  key={caseId}
                  className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 p-3.5 transition-all shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSolved 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {isSolved ? <CheckCircle2 className="w-4 h-4" /> : <HeartPulse className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{c.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            Lvl {c.level}: {rankName}
                          </span>
                          {isSolved ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Stabilized
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Admitted
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>Patient: <b className="text-slate-700 font-medium">{patientName}</b></span>
                          <span>•</span>
                          <span className="text-rose-600 font-medium">{condition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedCaseId(isExpanded ? null : caseId)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                      >
                        {isExpanded ? 'Hide Details' : 'View File'}
                      </button>

                      <button
                        onClick={() => {
                          onSelectCaseToResolve(c);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs"
                      >
                        <span>Re-Operate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded File View */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1 text-[11px] uppercase">
                          Surgical Objective:
                        </span>
                        <p className="text-slate-800 font-medium">{c.objective}</p>
                      </div>

                      {c.best_query || c.bestQuery ? (
                        <div className="bg-teal-50/60 p-2.5 rounded-lg border border-teal-200 font-mono text-[11px]">
                          <span className="font-bold text-teal-800 block mb-1 font-sans text-xs">
                            Your Previous Stabilizing Query:
                          </span>
                          <pre className="text-teal-950 whitespace-pre-wrap">{c.best_query || c.bestQuery}</pre>
                        </div>
                      ) : null}

                      {c.hidden_solution || c.hiddenSolution ? (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                          <span className="font-bold text-slate-700 block mb-1 font-sans text-xs">
                            Canonical Solution:
                          </span>
                          <pre className="text-slate-800 whitespace-pre-wrap">{c.hidden_solution || c.hiddenSolution}</pre>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
