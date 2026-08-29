import React, { useState } from 'react';
import { 
  X, 
  Gavel, 
  FileText, 
  Code, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

export default function AccusationModal({
  isOpen,
  onClose,
  problem,
  initialSql = '',
  onSubmitAccusation
}) {
  const [evidenceSql, setEvidenceSql] = useState(initialSql);
  const [evidenceNarrative, setEvidenceNarrative] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !problem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!evidenceSql.trim()) {
      setError('Please provide your Evidence SQL query.');
      return;
    }
    if (!evidenceNarrative.trim() || evidenceNarrative.trim().length < 15) {
      setError('Please provide a written explanation of the evidence chain (at least 2-3 sentences).');
      return;
    }

    setError('');
    onSubmitAccusation({
      evidenceSql: evidenceSql.trim(),
      evidenceNarrative: evidenceNarrative.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#fbf7ee] border-4 border-[#3d362e] rounded-2xl p-6 shadow-2xl space-y-4 text-amber-950">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#ded1b5]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center shadow-md">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-800 tracking-widest block">
                POLICE DEPARTMENT • FORMAL INDICTMENT
              </span>
              <h2 className="text-lg font-serif font-bold text-amber-950 leading-tight">
                Accusation Brief: {problem.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-800 hover:text-amber-950 hover:bg-[#ded1b5]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Evidence SQL Query */}
          <div>
            <label className="text-xs font-serif font-bold text-amber-950 block mb-1 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-amber-800" />
              <span>Step 1: Final Evidence SQL Query</span>
            </label>
            <p className="text-[11px] text-amber-800/80 mb-1.5 font-sans">
              Enter the SQL query that isolates the killer suspect and key incriminating rows.
            </p>
            <textarea
              value={evidenceSql}
              onChange={(e) => setEvidenceSql(e.target.value)}
              placeholder="SELECT ... FROM persons JOIN ... WHERE ..."
              className="w-full h-28 p-3 text-xs font-mono bg-[#1c1917] text-amber-100 rounded-xl border border-[#3d362e] outline-none focus:border-amber-600 resize-none leading-relaxed"
            />
          </div>

          {/* Step 2: Evidence Narrative */}
          <div>
            <label className="text-xs font-serif font-bold text-amber-950 block mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-800" />
              <span>Step 2: Written Evidence Chain & Motive</span>
            </label>
            <p className="text-[11px] text-amber-800/80 mb-1.5 font-sans">
              Explain why this suspect is guilty. Cite specific forensic facts (alibi contradictions, phone timestamps, sighting locations, wire transfers).
            </p>
            <textarea
              value={evidenceNarrative}
              onChange={(e) => setEvidenceNarrative(e.target.value)}
              placeholder="e.g. Suspect X claimed to be home alone, but harbor sightings place them at Pier 42 at 22:15. Furthermore, phone logs show they dialed the victim right before the incident..."
              className="w-full h-28 p-3 text-xs font-serif bg-[#f4ecdc] text-amber-950 rounded-xl border border-[#ded1b5] outline-none focus:border-amber-800 resize-none leading-relaxed placeholder:text-amber-800/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#ded1b5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-800 hover:bg-[#eedfc5] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-serif font-bold text-xs transition-colors shadow-md"
            >
              <span>Submit Formal Indictment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
