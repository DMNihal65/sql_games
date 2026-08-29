import React, { useState, useEffect, useCallback } from 'react';
import { ColdCaseAiEngine, DETECTIVE_RANKS } from '../../services/coldCaseAiGenerator';
import { SqlEngine } from '../../services/sqlEngine';
import { AiCaseEngine } from '../../services/aiCaseGenerator';

import ColdCaseNavbar from './ColdCaseNavbar';
import CaseFileDossier from './CaseFileDossier';
import DetectiveTerminal from './DetectiveTerminal';
import EvidenceNotebook from './EvidenceNotebook';
import AccusationModal from './AccusationModal';
import CaseClosedDebriefModal from './CaseClosedDebriefModal';
import CaseVaultModal from '../CaseVaultModal';
import JourneyMap from '../JourneyMap';
import AuthModal from '../AuthModal';
import ApiKeyModal from '../ApiKeyModal';
import GameSelectorModal from '../GameSelectorModal';
import { Terminal, BookOpen, Columns, SplitSquareVertical } from 'lucide-react';

export default function ColdCaseGame({
  currentUser,
  onSwitchGame
}) {
  const userId = currentUser?.id || 'guest_detective';

  // Detective state
  const [currentLevel, setCurrentLevel] = useState(() => {
    return parseInt(localStorage.getItem(`coldcase_level_${userId}`) || '1', 10);
  });

  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    return parseInt(localStorage.getItem(`coldcase_unlocked_${userId}`) || '1', 10);
  });

  const [xp, setXp] = useState(() => {
    return parseInt(localStorage.getItem(`coldcase_xp_${userId}`) || '0', 10);
  });

  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem(`coldcase_streak_${userId}`) || '1', 10);
  });

  const [solvedCount, setSolvedCount] = useState(() => {
    return parseInt(localStorage.getItem(`coldcase_solved_${userId}`) || '0', 10);
  });

  // Problem & SQLite engine state
  const [currentProblem, setCurrentProblem] = useState(null);
  const [pastCases, setPastCases] = useState([]);
  const [sqlEngine, setSqlEngine] = useState(null);
  const [discoveredTables, setDiscoveredTables] = useState([]);
  const [tableSchemas, setTableSchemas] = useState({});
  const [sql, setSql] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [lastError, setLastError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Right column active view: 'terminal' | 'evidence' | 'split'
  const [activeRightView, setActiveRightView] = useState('terminal');

  // Modals state
  const [isAccusationOpen, setIsAccusationOpen] = useState(false);
  const [isDebriefOpen, setIsDebriefOpen] = useState(false);
  const [debriefEval, setDebriefEval] = useState(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isJourneyMapOpen, setIsJourneyMapOpen] = useState(false);
  const [isGameHubOpen, setIsGameHubOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync profile & cases from Neon on mount / user change
  const syncWithNeon = useCallback(async (activeUserId) => {
    try {
      const res = await fetch(`/api/progress?userId=${activeUserId}&gameId=cold_case`);
      if (res.ok) {
        const prog = await res.json();
        if (prog) {
          if (prog.xp !== undefined) {
            setXp(prog.xp);
            localStorage.setItem(`coldcase_xp_${activeUserId}`, prog.xp.toString());
          }
          if (prog.level !== undefined) {
            setCurrentLevel(prog.level);
            localStorage.setItem(`coldcase_level_${activeUserId}`, prog.level.toString());
          }
          if (prog.streak !== undefined) {
            setStreak(prog.streak);
            localStorage.setItem(`coldcase_streak_${activeUserId}`, prog.streak.toString());
          }
          if (prog.solved_count !== undefined) {
            setSolvedCount(prog.solved_count);
            localStorage.setItem(`coldcase_solved_${activeUserId}`, prog.solved_count.toString());
          }
        }
      }

      const cases = await AiCaseEngine.fetchPastCases(activeUserId, { gameId: 'cold_case' });
      if (cases && Array.isArray(cases)) {
        setPastCases(cases);
      }
    } catch (err) {
      console.warn('Cold Case Neon sync error:', err);
    }
  }, []);

  useEffect(() => {
    syncWithNeon(userId);
  }, [userId, syncWithNeon]);

  // Setup fresh SQLite database
  const setupProblemDatabase = useCallback(async (problem) => {
    if (sqlEngine) {
      sqlEngine.close();
    }

    const engine = new SqlEngine(problem);
    await engine.init();

    setSqlEngine(engine);
    // Blind discovery: start with 0 discovered tables initially!
    setDiscoveredTables([]);
    setTableSchemas({});
    setSql('');
    setQueryResults(null);
    setLastError('');
    setAttemptCount(0);
  }, []);

  // Inspect schema whenever detective runs discovery queries
  const inspectDiscovery = useCallback((executedSql, results) => {
    if (!sqlEngine) return;

    // If detective ran SELECT name FROM sqlite_master...
    const masterMatch = /sqlite_master/i.test(executedSql);
    if (masterMatch && results?.values) {
      const found = results.values.map(r => r[0]);
      setDiscoveredTables(prev => Array.from(new Set([...prev, ...found])));
    }

    // If detective ran PRAGMA table_info(x)
    const pragmaMatch = executedSql.match(/PRAGMA\s+table_info\s*\(\s*['"]?([a-zA-Z0-9_]+)['"]?\s*\)/i);
    if (pragmaMatch && results?.values) {
      const tbl = pragmaMatch[1];
      const cols = results.values.map(r => ({ name: r[1], type: r[2] || 'TEXT' }));
      setDiscoveredTables(prev => Array.from(new Set([...prev, tbl])));
      setTableSchemas(prev => ({ ...prev, [tbl]: cols }));
    }

    // If detective ran SELECT ... FROM tableName
    const fromMatch = executedSql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch && results?.columns) {
      const tbl = fromMatch[1];
      setDiscoveredTables(prev => Array.from(new Set([...prev, tbl])));
      if (!tableSchemas[tbl] || tableSchemas[tbl].length === 0) {
        const cols = results.columns.map(c => ({ name: c, type: 'TEXT' }));
        setTableSchemas(prev => ({ ...prev, [tbl]: cols }));
      }
    }
  }, [sqlEngine, tableSchemas]);

  // Load new cold case via Gemini AI
  const loadColdCaseForLevel = useCallback(async (levelNum) => {
    setIsGenerating(true);
    setLastError('');
    try {
      const newProblem = await ColdCaseAiEngine.generateColdCase(levelNum, pastCases);
      setCurrentProblem(newProblem);
      await setupProblemDatabase(newProblem);

      const casePayload = {
        caseId: newProblem.id,
        userId,
        gameId: 'cold_case',
        level: levelNum,
        rankTitle: newProblem.rankTitle,
        title: newProblem.title,
        patientName: newProblem.victimName,
        condition: `Homicide: ${newProblem.victimOccupation}`,
        severity: 'Critical',
        narrative: newProblem.narrative,
        schemaSQL: newProblem.schemaSQL,
        seedSQL: newProblem.seedSQL,
        objective: newProblem.objective,
        hiddenSolution: newProblem.hiddenSolution,
        hints: newProblem.hints,
        concepts: newProblem.concepts,
        status: 'unsolved'
      };

      AiCaseEngine.saveCase(casePayload);
      setPastCases(prev => [casePayload, ...prev.filter(c => (c.caseId || c.id || c.case_id) !== newProblem.id)]);
    } catch (err) {
      console.error('Failed to load cold case:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [pastCases, setupProblemDatabase, userId]);

  useEffect(() => {
    loadColdCaseForLevel(currentLevel);
  }, []);

  // Run SQL query
  const handleRunQuery = () => {
    if (!sqlEngine) return;
    setLastError('');
    setIsExecuting(true);
    setAttemptCount(prev => prev + 1);

    try {
      const res = sqlEngine.executeQuery(sql);
      setQueryResults(res);
      inspectDiscovery(sql, res);
    } catch (err) {
      setLastError(err.message || 'SQLite Execution Error');
      setQueryResults(null);
    } finally {
      setIsExecuting(false);
    }
  };

  // Inspect all tables helper button
  const handleInspectTables = () => {
    if (!sqlEngine) return;
    const query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
    setSql(query);
    try {
      const res = sqlEngine.executeQuery(query);
      setQueryResults(res);
      inspectDiscovery(query, res);
    } catch (err) {
      setLastError(err.message);
    }
  };

  // Submit Formal Accusation Indictment
  const handleSubmitAccusation = async ({ evidenceSql, evidenceNarrative }) => {
    if (!sqlEngine || !currentProblem) return;
    setIsAccusationOpen(false);

    try {
      const queryRes = sqlEngine.executeQuery(evidenceSql);
      const rows = queryRes.values || [];
      const killerName = (currentProblem.solutionSuspectName || '').toLowerCase();
      const killerId = currentProblem.solutionSuspectId;

      let isKillerCorrect = false;
      if (rows.length > 0) {
        const flatRowText = rows[0].map(v => String(v).toLowerCase()).join(' ');
        if (flatRowText.includes(killerName) || flatRowText.includes(String(killerId))) {
          isKillerCorrect = true;
        }
      }

      const narrativeEval = ColdCaseAiEngine.evaluateEvidenceNarrative(
        evidenceNarrative,
        currentProblem.requiredEvidencePoints || []
      );

      let stars = 0;
      let feedback = '';
      let xpEarned = 0;

      if (isKillerCorrect && narrativeEval.isValid) {
        stars = 3;
        xpEarned = 35;
        feedback = `Outstanding Detective Work! You unmasked ${currentProblem.solutionSuspectName} and established an airtight evidence chain.`;
      } else if (isKillerCorrect && !narrativeEval.isValid) {
        stars = 1;
        xpEarned = 15;
        feedback = `Correct Killer Identified, but the evidence explanation was deemed dubious or incomplete by the District Attorney.`;
      } else {
        stars = 0;
        xpEarned = 0;
        feedback = `Wrong Suspect! The evidence query did not identify the true perpetrator. The cold case remains open.`;
      }

      let leveledUp = false;
      let nextLevel = currentLevel;

      if (isKillerCorrect) {
        const newXp = xp + xpEarned;
        setXp(newXp);
        localStorage.setItem(`coldcase_xp_${userId}`, newXp.toString());

        const newSolved = solvedCount + 1;
        setSolvedCount(newSolved);
        localStorage.setItem(`coldcase_solved_${userId}`, newSolved.toString());

        const rankDef = DETECTIVE_RANKS.find(r => r.level === currentLevel);
        if (rankDef && newXp >= rankDef.targetXp && currentLevel < 8) {
          nextLevel = currentLevel + 1;
          const nextUnlocked = Math.max(unlockedLevel, nextLevel);
          setCurrentLevel(nextLevel);
          setUnlockedLevel(nextUnlocked);
          localStorage.setItem(`coldcase_level_${userId}`, nextLevel.toString());
          localStorage.setItem(`coldcase_unlocked_${userId}`, nextUnlocked.toString());
          leveledUp = true;
        }

        const casePayload = {
          caseId: currentProblem.id,
          userId,
          gameId: 'cold_case',
          level: currentProblem.level || currentLevel,
          rankTitle: currentProblem.rankTitle,
          title: currentProblem.title,
          patientName: currentProblem.victimName,
          condition: `Solved Homicide (${currentProblem.solutionSuspectName})`,
          severity: 'Critical',
          narrative: currentProblem.narrative,
          schemaSQL: currentProblem.schemaSQL,
          seedSQL: currentProblem.seedSQL,
          objective: currentProblem.objective,
          hiddenSolution: currentProblem.hiddenSolution,
          hints: currentProblem.hints,
          concepts: currentProblem.concepts,
          status: 'solved',
          bestQuery: evidenceSql,
          solvedAt: new Date().toISOString()
        };

        AiCaseEngine.saveCase(casePayload);
        AiCaseEngine.saveProfile({
          userId,
          gameId: 'cold_case',
          level: nextLevel,
          xp: newXp,
          streak,
          solvedCount: newSolved,
          lastPlayedDate: new Date().toDateString()
        });

        setPastCases(prev => [
          casePayload,
          ...prev.filter(c => (c.caseId || c.id || c.case_id) !== currentProblem.id)
        ]);
      }

      setDebriefEval({
        isKillerCorrect,
        stars,
        xpEarned,
        feedback,
        isLevelUp: leveledUp,
        newLevel: nextLevel,
        matchedPoints: narrativeEval.matchedDetails
      });

      setIsDebriefOpen(true);
    } catch (err) {
      setLastError(err.message || 'Error evaluating formal accusation');
    }
  };

  // Re-open past case
  const handleSelectCaseToResolve = (selectedCase) => {
    const formatted = {
      id: selectedCase.caseId || selectedCase.case_id || selectedCase.id,
      level: selectedCase.level,
      rankTitle: selectedCase.rankTitle || selectedCase.rank_title,
      title: selectedCase.title,
      victimName: selectedCase.patientName || selectedCase.patient_name || 'Victim',
      victimOccupation: selectedCase.condition || 'Citizen',
      crimeDate: '1987-10-14',
      crimeLocation: 'City Archive',
      narrative: selectedCase.narrative,
      schemaSQL: selectedCase.schemaSQL || selectedCase.schema_sql,
      seedSQL: selectedCase.seedSQL || selectedCase.seed_sql,
      objective: selectedCase.objective,
      hiddenSolution: selectedCase.hiddenSolution || selectedCase.hidden_solution,
      hints: Array.isArray(selectedCase.hints) ? selectedCase.hints : [],
      concepts: Array.isArray(selectedCase.concepts) ? selectedCase.concepts : [],
      bestQuery: selectedCase.bestQuery || selectedCase.best_query
    };

    setCurrentProblem(formatted);
    setupProblemDatabase(formatted);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#141210] text-amber-100 font-serif">
      {/* Top Navbar */}
      <ColdCaseNavbar
        currentLevel={currentLevel}
        xp={xp}
        streak={streak}
        currentUser={currentUser}
        onOpenJourneyMap={() => setIsJourneyMapOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenGameHub={() => setIsGameHubOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewColdCase={() => loadColdCaseForLevel(currentLevel)}
        isGenerating={isGenerating}
        archivedCount={pastCases.length}
      />

      {/* Main Workspace with Proper Full Height & Scrolling */}
      <main className="flex-1 p-3 md:p-4 max-w-[1680px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 h-auto lg:h-[calc(100vh-4.5rem)] overflow-hidden">
        {/* Left Column: Manila Dossier & Case Notes (5 cols) */}
        <section className="lg:col-span-5 h-[520px] lg:h-full overflow-hidden flex flex-col">
          {currentProblem ? (
            <CaseFileDossier
              problem={currentProblem}
              onInsertSql={(text) => setSql(prev => prev ? `${prev} ${text}` : text)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-[#fbf7ee] rounded-2xl border-2 border-[#e6dcbf] p-8 text-amber-900 text-xs space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-amber-800 border-t-transparent animate-spin" />
              <span className="font-mono">Unsealing new homicide case file via Gemini AI...</span>
            </div>
          )}
        </section>

        {/* Right Column: Terminal & Evidence Board (7 cols) */}
        <section className="lg:col-span-7 flex flex-col h-[580px] lg:h-full overflow-hidden space-y-2.5">
          {/* View Mode Switcher Header */}
          <div className="flex items-center justify-between p-1.5 bg-[#1c1917] rounded-xl border border-[#3d362e] flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveRightView('terminal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeRightView === 'terminal'
                    ? 'bg-amber-900 text-amber-100 shadow-xs'
                    : 'text-amber-400/80 hover:text-amber-200 hover:bg-[#292524]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Police Terminal</span>
              </button>

              <button
                onClick={() => setActiveRightView('evidence')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeRightView === 'evidence'
                    ? 'bg-amber-900 text-amber-100 shadow-xs'
                    : 'text-amber-400/80 hover:text-amber-200 hover:bg-[#292524]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Evidence Board ({discoveredTables.length})</span>
              </button>

              <button
                onClick={() => setActiveRightView('split')}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeRightView === 'split'
                    ? 'bg-amber-900 text-amber-100 shadow-xs'
                    : 'text-amber-400/80 hover:text-amber-200 hover:bg-[#292524]'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-amber-500/60 hidden sm:inline pr-2">
              Level {currentLevel} • {currentProblem?.rankTitle || 'Investigator'}
            </span>
          </div>

          {/* View Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeRightView === 'terminal' && (
              <div className="h-full">
                <DetectiveTerminal
                  sql={sql}
                  setSql={setSql}
                  onRunQuery={handleRunQuery}
                  onOpenAccusation={() => setIsAccusationOpen(true)}
                  onResetDb={() => setupProblemDatabase(currentProblem)}
                  queryResults={queryResults}
                  error={lastError}
                  isExecuting={isExecuting}
                />
              </div>
            )}

            {activeRightView === 'evidence' && (
              <div className="h-full">
                <EvidenceNotebook
                  discoveredTables={discoveredTables}
                  tableSchemas={tableSchemas}
                  onInsertSql={(text) => {
                    setSql(prev => prev ? `${prev} ${text}` : text);
                    setActiveRightView('terminal');
                  }}
                  onInspectTables={handleInspectTables}
                  onGetTableSample={(tbl) => sqlEngine?.getTableSample(tbl)}
                />
              </div>
            )}

            {activeRightView === 'split' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 h-full">
                <div className="h-full">
                  <DetectiveTerminal
                    sql={sql}
                    setSql={setSql}
                    onRunQuery={handleRunQuery}
                    onOpenAccusation={() => setIsAccusationOpen(true)}
                    onResetDb={() => setupProblemDatabase(currentProblem)}
                    queryResults={queryResults}
                    error={lastError}
                    isExecuting={isExecuting}
                  />
                </div>
                <div className="h-full">
                  <EvidenceNotebook
                    discoveredTables={discoveredTables}
                    tableSchemas={tableSchemas}
                    onInsertSql={(text) => setSql(prev => prev ? `${prev} ${text}` : text)}
                    onInspectTables={handleInspectTables}
                    onGetTableSample={(tbl) => sqlEngine?.getTableSample(tbl)}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Accusation Indictment Modal */}
      <AccusationModal
        isOpen={isAccusationOpen}
        onClose={() => setIsAccusationOpen(false)}
        problem={currentProblem}
        initialSql={sql}
        onSubmitAccusation={handleSubmitAccusation}
      />

      {/* Case Closed Debrief Modal */}
      <CaseClosedDebriefModal
        isOpen={isDebriefOpen}
        problem={currentProblem}
        evaluation={debriefEval}
        onNextCase={() => {
          setIsDebriefOpen(false);
          loadColdCaseForLevel(currentLevel);
        }}
        onRetry={() => {
          setIsDebriefOpen(false);
          setupProblemDatabase(currentProblem);
        }}
        onClose={() => setIsDebriefOpen(false)}
      />

      {/* Case Vault Modal */}
      <CaseVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        pastCases={pastCases}
        onSelectCaseToResolve={handleSelectCaseToResolve}
      />

      {/* Game Selector Arcade Hub */}
      <GameSelectorModal
        isOpen={isGameHubOpen}
        onClose={() => setIsGameHubOpen(false)}
        activeGameId="cold_case"
        onSelectGame={onSwitchGame}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={() => setIsAuthOpen(false)}
      />

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetProgress={() => {
          localStorage.removeItem(`coldcase_xp_${userId}`);
          localStorage.removeItem(`coldcase_level_${userId}`);
          setXp(0);
          setCurrentLevel(1);
          loadColdCaseForLevel(1);
        }}
      />
    </div>
  );
}
