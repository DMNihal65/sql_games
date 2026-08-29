import React, { useState, useEffect, useCallback } from 'react';
import { AiCaseEngine, SURGEON_RANKS } from './services/aiCaseGenerator';
import { SqlEngine } from './services/sqlEngine';

import Navbar from './components/Navbar';
import JourneyMap from './components/JourneyMap';
import ProblemStatement from './components/ProblemStatement';
import EditorSection from './components/EditorSection';
import ResultsViewer from './components/ResultsViewer';
import SuccessModal from './components/SuccessModal';
import ApiKeyModal from './components/ApiKeyModal';
import CaseVaultModal from './components/CaseVaultModal';
import AuthModal from './components/AuthModal';
import GameSelectorModal from './components/GameSelectorModal';
import ColdCaseGame from './components/ColdCase/ColdCaseGame';

export default function App() {
  // Active Game State: 'data_surgeon' | 'cold_case'
  const [activeGameId, setActiveGameId] = useState(() => {
    return localStorage.getItem('sql_active_game') || 'data_surgeon';
  });

  // User Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sql_arcade_user');
    return saved ? JSON.parse(saved) : {
      id: 'guest_surgeon',
      username: 'Dr. Turing Resident',
      email: 'doctor@sqlarcade.med',
      avatar: '🩺'
    };
  });

  const userId = currentUser?.id || 'guest_surgeon';

  // Data Surgeon Player state & persistence
  const [currentLevel, setCurrentLevel] = useState(() => {
    return parseInt(localStorage.getItem(`sql_level_${userId}`) || '1', 10);
  });

  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    return parseInt(localStorage.getItem(`sql_unlocked_${userId}`) || '1', 10);
  });

  const [xp, setXp] = useState(() => {
    return parseInt(localStorage.getItem(`sql_xp_${userId}`) || '0', 10);
  });

  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem(`sql_streak_${userId}`) || '1', 10);
  });

  const [solvedCount, setSolvedCount] = useState(() => {
    return parseInt(localStorage.getItem(`sql_solved_${userId}`) || '0', 10);
  });

  // Problem, History & Neon sync state
  const [currentProblem, setCurrentProblem] = useState(null);
  const [pastCases, setPastCases] = useState([]);
  const [sqlEngine, setSqlEngine] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableSchemas, setTableSchemas] = useState({});
  const [sql, setSql] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [lastError, setLastError] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Modals state
  const [isJourneyMapOpen, setIsJourneyMapOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isGameHubOpen, setIsGameHubOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [earnedXpAmount, setEarnedXpAmount] = useState(25);

  // Switch Active Arcade Game
  const handleSwitchGame = (gameId) => {
    setActiveGameId(gameId);
    localStorage.setItem('sql_active_game', gameId);
  };

  // Sync Data Surgeon profile & past cases from Neon DB
  const syncUserWithNeon = useCallback(async (activeUserId) => {
    const profile = await AiCaseEngine.fetchProfile(activeUserId);
    if (profile) {
      if (profile.xp !== undefined) {
        setXp(profile.xp);
        localStorage.setItem(`sql_xp_${activeUserId}`, profile.xp.toString());
      }
      if (profile.level !== undefined) {
        setCurrentLevel(profile.level);
        localStorage.setItem(`sql_level_${activeUserId}`, profile.level.toString());
      }
      if (profile.streak !== undefined) {
        setStreak(profile.streak);
        localStorage.setItem(`sql_streak_${activeUserId}`, profile.streak.toString());
      }
      if (profile.solved_count !== undefined) {
        setSolvedCount(profile.solved_count);
        localStorage.setItem(`sql_solved_${activeUserId}`, profile.solved_count.toString());
      }
    }

    const cases = await AiCaseEngine.fetchPastCases(activeUserId, { gameId: 'data_surgeon' });
    if (cases && Array.isArray(cases)) {
      setPastCases(cases);
    }
  }, []);

  useEffect(() => {
    if (activeGameId === 'data_surgeon') {
      syncUserWithNeon(userId);
    }
  }, [userId, activeGameId, syncUserWithNeon]);

  // Handle Login / Registration Success
  const handleLoginSuccess = (user, progress) => {
    setCurrentUser(user);
    localStorage.setItem('sql_arcade_user', JSON.stringify(user));
    if (progress) {
      if (progress.xp !== undefined) setXp(progress.xp);
      if (progress.level !== undefined) setCurrentLevel(progress.level);
      if (progress.streak !== undefined) setStreak(progress.streak);
      if (progress.solved_count !== undefined) setSolvedCount(progress.solved_count);
    }
    syncUserWithNeon(user.id);
  };

  // Initialize SQLite database for a patient case
  const setupProblemDatabase = useCallback(async (problem) => {
    if (sqlEngine) {
      sqlEngine.close();
    }

    const engine = new SqlEngine(problem);
    await engine.init();

    setSqlEngine(engine);
    setTables(engine.tables);
    setTableSchemas(engine.tableSchemas);
    setSql(problem.bestQuery || problem.best_query || '');
    setQueryResults(null);
    setLastError('');
    setAiExplanation('');
    setAttemptCount(0);
  }, []);

  // Load or generate a clinical patient case via Gemini AI with memory
  const loadClinicalCaseForLevel = useCallback(async (levelNum) => {
    setIsGenerating(true);
    setLastError('');
    try {
      const newProblem = await AiCaseEngine.generateClinicalCase(levelNum, pastCases);
      setCurrentProblem(newProblem);
      await setupProblemDatabase(newProblem);

      const casePayload = {
        caseId: newProblem.id,
        userId,
        gameId: 'data_surgeon',
        level: levelNum,
        rankTitle: newProblem.rankTitle,
        title: newProblem.title,
        patientName: newProblem.patientName,
        patientAge: newProblem.patientAge,
        condition: newProblem.condition,
        severity: newProblem.severity,
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
      console.error('Failed to generate clinical case:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [pastCases, setupProblemDatabase, userId]);

  useEffect(() => {
    if (activeGameId === 'data_surgeon') {
      loadClinicalCaseForLevel(currentLevel);
    }
  }, [activeGameId]);

  // Run user SQL query in SQLite
  const handleRunQuery = () => {
    if (!sqlEngine) return;
    setLastError('');
    setAiExplanation('');
    setAttemptCount(prev => prev + 1);

    try {
      const res = sqlEngine.executeQuery(sql);
      setQueryResults(res);
    } catch (err) {
      setLastError(err.message || 'SQLite Syntax or Execution Error');
      setQueryResults(null);
    }
  };

  // Submit final surgical fix
  const handleSubmitSolution = async () => {
    if (!sqlEngine) return;
    setLastError('');
    setAiExplanation('');

    try {
      const res = sqlEngine.executeQuery(sql);
      setQueryResults(res);

      const evaluation = sqlEngine.evaluateResult(res);

      if (evaluation.passed) {
        const xpEarned = attemptCount <= 1 ? 35 : 25;
        setEarnedXpAmount(xpEarned);
        const newXp = xp + xpEarned;
        setXp(newXp);
        localStorage.setItem(`sql_xp_${userId}`, newXp.toString());

        const newSolved = solvedCount + 1;
        setSolvedCount(newSolved);
        localStorage.setItem(`sql_solved_${userId}`, newSolved.toString());

        const today = new Date().toDateString();
        const lastPlayed = localStorage.getItem(`sql_last_date_${userId}`);
        let newStreak = streak;
        if (lastPlayed !== today) {
          newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem(`sql_streak_${userId}`, newStreak.toString());
          localStorage.setItem(`sql_last_date_${userId}`, today);
        }

        const currentDef = SURGEON_RANKS.find(l => l.level === currentLevel);
        let leveledUp = false;
        let nextLevel = currentLevel;
        if (currentDef && newXp >= currentDef.targetXp && currentLevel < 8) {
          nextLevel = currentLevel + 1;
          const nextUnlocked = Math.max(unlockedLevel, nextLevel);
          setCurrentLevel(nextLevel);
          setUnlockedLevel(nextUnlocked);
          localStorage.setItem(`sql_level_${userId}`, nextLevel.toString());
          localStorage.setItem(`sql_unlocked_${userId}`, nextUnlocked.toString());
          leveledUp = true;
        }

        const caseId = currentProblem.id;
        const updatedCasePayload = {
          caseId,
          userId,
          gameId: 'data_surgeon',
          level: currentProblem.level || currentLevel,
          rankTitle: currentProblem.rankTitle,
          title: currentProblem.title,
          patientName: currentProblem.patientName,
          patientAge: currentProblem.patientAge,
          condition: currentProblem.condition,
          severity: currentProblem.severity,
          narrative: currentProblem.narrative,
          schemaSQL: currentProblem.schemaSQL,
          seedSQL: currentProblem.seedSQL,
          objective: currentProblem.objective,
          hiddenSolution: currentProblem.hiddenSolution,
          hints: currentProblem.hints,
          concepts: currentProblem.concepts,
          status: 'solved',
          bestQuery: sql,
          solvedAt: new Date().toISOString()
        };

        AiCaseEngine.saveCase(updatedCasePayload);
        AiCaseEngine.saveProfile({
          userId,
          gameId: 'data_surgeon',
          level: nextLevel,
          xp: newXp,
          streak: newStreak,
          solvedCount: newSolved,
          lastPlayedDate: today
        });

        setPastCases(prev => [
          updatedCasePayload,
          ...prev.filter(c => (c.caseId || c.id || c.case_id) !== caseId)
        ]);

        setIsLevelUp(leveledUp);
        setIsSuccessModalOpen(true);
      } else {
        setLastError(`Surgical Triage Failed: ${evaluation.feedback}`);
      }
    } catch (err) {
      setLastError(err.message || 'SQL Execution Error during surgery evaluation');
    }
  };

  // Re-open and re-solve any past case from Vault
  const handleSelectCaseToResolve = (selectedCase) => {
    const formatted = {
      id: selectedCase.caseId || selectedCase.case_id || selectedCase.id,
      level: selectedCase.level,
      rankTitle: selectedCase.rankTitle || selectedCase.rank_title,
      title: selectedCase.title,
      patientName: selectedCase.patientName || selectedCase.patient_name,
      patientAge: selectedCase.patientAge || selectedCase.patient_age,
      condition: selectedCase.condition,
      severity: selectedCase.severity,
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

  // Explain SQL error with Dr. Turing AI
  const handleExplainError = async () => {
    if (!lastError || !currentProblem) return;
    setIsExplaining(true);
    try {
      const explanation = await AiCaseEngine.explainClinicalSqlError(lastError, sql, currentProblem);
      setAiExplanation(explanation);
    } catch {
      setAiExplanation('Check that table names, column names, and SQL clauses match the patient database schema.');
    } finally {
      setIsExplaining(false);
    }
  };

  // If Cold Case is selected, render the Noir Detective Game view!
  if (activeGameId === 'cold_case') {
    return (
      <ColdCaseGame
        currentUser={currentUser}
        onSwitchGame={handleSwitchGame}
      />
    );
  }

  // Otherwise render Data Surgeon view!
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentLevel={currentLevel}
        xp={xp}
        streak={streak}
        currentUser={currentUser}
        onOpenJourneyMap={() => setIsJourneyMapOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenGameHub={() => setIsGameHubOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        onAdmitNextPatient={() => loadClinicalCaseForLevel(currentLevel)}
        isGenerating={isGenerating}
        archivedCount={pastCases.length}
      />

      {/* Main Clinical Operating Theater */}
      <main className="flex-1 p-3 md:p-4 max-w-[1680px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
        {/* Left Column: Patient File & Medical Dossier (5 cols) */}
        <section className="lg:col-span-5 h-[440px] lg:h-[calc(100vh-5.5rem)]">
          {currentProblem ? (
            <ProblemStatement
              problem={currentProblem}
              tables={tables}
              tableSchemas={tableSchemas}
              onInsertSql={(text) => setSql(prev => prev ? `${prev} ${text}` : text)}
              onGetTableSample={(tbl) => sqlEngine?.getTableSample(tbl)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-8 text-slate-500 text-xs space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              <span>Admitting new clinical patient case via Gemini AI...</span>
            </div>
          )}
        </section>

        {/* Right Column: Surgical SQL Terminal & Telemetry Monitor (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-3 md:gap-4 h-[680px] lg:h-[calc(100vh-5.5rem)]">
          {/* Top Half: Surgical Terminal */}
          <div className="flex-1 min-h-[260px]">
            <EditorSection
              sql={sql}
              setSql={setSql}
              onRunQuery={handleRunQuery}
              onSubmitSolution={handleSubmitSolution}
              onResetDb={() => setupProblemDatabase(currentProblem)}
            />
          </div>

          {/* Bottom Half: Clinical Telemetry Results */}
          <div className="flex-1 min-h-[240px]">
            <ResultsViewer
              results={queryResults}
              error={lastError}
              expectedResult={sqlEngine?.expectedResult || []}
              onExplainError={handleExplainError}
              isExplaining={isExplaining}
              aiExplanation={aiExplanation}
            />
          </div>
        </section>
      </main>

      {/* Game Selector Arcade Hub Modal */}
      <GameSelectorModal
        isOpen={isGameHubOpen}
        onClose={() => setIsGameHubOpen(false)}
        activeGameId={activeGameId}
        onSelectGame={handleSwitchGame}
      />

      {/* User Login & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Residency Roadmap Modal */}
      <JourneyMap
        isOpen={isJourneyMapOpen}
        onClose={() => setIsJourneyMapOpen(false)}
        currentLevel={currentLevel}
        unlockedLevel={unlockedLevel}
        xp={xp}
        solvedCount={solvedCount}
        onSelectLevel={(lvl) => {
          setCurrentLevel(lvl);
          localStorage.setItem(`sql_level_${userId}`, lvl.toString());
          loadClinicalCaseForLevel(lvl);
        }}
      />

      {/* Patient Case Vault & History Modal */}
      <CaseVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        pastCases={pastCases}
        onSelectCaseToResolve={handleSelectCaseToResolve}
      />

      {/* Settings & API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onResetProgress={() => {
          localStorage.removeItem(`sql_xp_${userId}`);
          localStorage.removeItem(`sql_level_${userId}`);
          setXp(0);
          setCurrentLevel(1);
          loadClinicalCaseForLevel(1);
        }}
      />

      {/* Success & Patient Stabilized Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        problem={currentProblem}
        xpEarned={earnedXpAmount}
        isLevelUp={isLevelUp}
        newLevel={currentLevel}
        onNextChallenge={() => {
          setIsSuccessModalOpen(false);
          loadClinicalCaseForLevel(currentLevel);
        }}
        onRetry={() => setIsSuccessModalOpen(false)}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
