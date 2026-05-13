import { useMemo, useState } from "react";
import {
  addWrongItemRecord,
  adjustStudyPlan,
  checkPracticeAnswer,
  createDefaultState,
  createStudyPlan,
  evaluateStageTest,
  generateLearningReport,
  generateOrSelectWordBook,
  generatePracticeQuestions,
  generateStageTest,
  generateTodayTask,
  initializeItemStates,
  initializeVocabularyProfile,
  recommendScenarios,
  selectMaterialSource,
  updateItemStateAfterStudy,
  type StudyChoice
} from "./engine";
import { mockMaterialSources, mockScenarios, mockStudyPlan, mockUserWordStates, mockVocabularyProfile, mockWordBooks, mockWords, mockWrongWords } from "./mock";
import type {
  DailyTask,
  LearningFeedback,
  LearningPreference,
  LearningReport,
  PracticeQuestion,
  PracticeRecord,
  StageTestResult,
  StudyPlan,
  UserWordState,
  VocabularyGoal,
  VocabularyLevel,
  VocabularyProfile,
  Word,
  WrongWordRecord
} from "./types";

export type VocabularyView = "entry" | "onboarding" | "scenario" | "books" | "plan" | "home" | "learn" | "practice" | "feedback" | "wrong" | "review" | "test" | "report" | "settings";
type PracticeMode = "new" | "wrong" | "review" | "test";

export function useVocabularySession(userId: string, initialView?: VocabularyView) {
  const startingProfile = userId === mockVocabularyProfile.userId && mockVocabularyProfile.initialized ? mockVocabularyProfile : null;
  const startingView: VocabularyView =
    initialView && (startingProfile?.initialized || ["entry", "onboarding", "scenario", "books"].includes(initialView))
      ? initialView
      : startingProfile?.initialized
        ? "home"
        : "onboarding";
  const [profile, setProfile] = useState<VocabularyProfile | null>(() => startingProfile);
  const [plan, setPlan] = useState<StudyPlan>(() => mockStudyPlan);
  const [pendingPlan, setPendingPlan] = useState<StudyPlan | null>(null);
  const [view, setView] = useState<VocabularyView>(() => startingView);
  const [states, setStates] = useState<UserWordState[]>(() => (startingProfile?.initialized ? mockUserWordStates.filter((state) => state.userId === userId) : []));
  const [wrongWords, setWrongWords] = useState<WrongWordRecord[]>(() => (startingProfile?.initialized ? mockWrongWords.filter((record) => record.userId === userId) : []));
  const [task, setTask] = useState<DailyTask>(() =>
    generateTodayTask({
      userId,
      words: mockWords,
      states: mockUserWordStates.filter((state) => state.userId === userId),
      wrongWords: mockWrongWords.filter((record) => record.userId === userId),
      plan: mockStudyPlan,
      scenarioId: mockStudyPlan.scenarioId,
      bookId: mockStudyPlan.bookId
    })
  );
  const [learnIds, setLearnIds] = useState<string[]>([]);
  const [learnIndex, setLearnIndex] = useState(0);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("new");
  const [feedback, setFeedback] = useState<LearningFeedback | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [report, setReport] = useState<LearningReport | null>(null);
  const [stageResult, setStageResult] = useState<StageTestResult | null>(null);
  const [draftGoal, setDraftGoal] = useState<VocabularyGoal>(profile?.goal ?? "ielts");
  const [draftLevel, setDraftLevel] = useState<VocabularyLevel>(profile?.level ?? "intermediate");
  const [draftPreferences, setDraftPreferences] = useState<LearningPreference[]>(profile?.preferences ?? ["spelling", "example", "exam"]);
  const [draftIntensity, setDraftIntensity] = useState<"light" | "normal" | "heavy">("normal");
  const [selectedScenarioId, setSelectedScenarioId] = useState(profile?.currentScenarioId ?? mockScenarios[0]!.id);
  const [selectedSourceId, setSelectedSourceId] = useState(mockMaterialSources[0]!.id);
  const [selectedBookId, setSelectedBookId] = useState(profile?.currentBookId ?? mockWordBooks[0]!.id);

  const stateMap = useMemo(() => new Map(states.map((state) => [state.itemId, state])), [states]);
  const wrongMap = useMemo(() => new Map(wrongWords.map((record) => [record.itemId, record])), [wrongWords]);
  const currentScenario = mockScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? mockScenarios[0]!;
  const currentSource = mockMaterialSources.find((source) => source.id === selectedSourceId) ?? mockMaterialSources[0]!;
  const currentBook = mockWordBooks.find((book) => book.id === selectedBookId) ?? mockWordBooks[0]!;
  const currentLearnWord = findWords(learnIds)[learnIndex];
  const currentQuestion = questions[questionIndex];
  const progress = questions.length ? Math.round(((questionIndex + (feedback ? 1 : 0)) / questions.length) * 100) : 0;
  const recommendedScenarios = recommendScenarios(draftGoal, mockScenarios);
  const libraryProgress = useMemo(() => {
    const touched = states.filter((state) => state.status !== "new").length;
    return Math.round((touched / mockWords.length) * 100);
  }, [states]);

  function refreshTask(nextStates = states, nextWrongWords = wrongWords, nextPlan = plan) {
    const nextTask = generateTodayTask({
      userId,
      words: mockWords,
      states: nextStates,
      wrongWords: nextWrongWords,
      plan: nextPlan,
      scenarioId: nextPlan.scenarioId,
      bookId: nextPlan.bookId
    });
    setTask(nextTask);
    return nextTask;
  }

  function completeOnboarding() {
    const scenario = recommendedScenarios[0] ?? mockScenarios[0]!;
    const source = selectMaterialSource(scenario, mockMaterialSources);
    const draftProfile = initializeVocabularyProfile({
      userId,
      goal: draftGoal,
      level: draftLevel,
      intensity: draftIntensity,
      preferences: draftPreferences,
      scenarioId: scenario.id,
      initialized: false
    });
    const recommendedBook = generateOrSelectWordBook({ goal: draftGoal, scenario, source, books: mockWordBooks });
    setProfile(draftProfile);
    setSelectedScenarioId(scenario.id);
    setSelectedSourceId(source.id);
    setSelectedBookId(recommendedBook.id);
    setPendingPlan(null);
    setView("scenario");
  }

  function confirmScenario() {
    const scenario = mockScenarios.find((item) => item.id === selectedScenarioId) ?? mockScenarios[0]!;
    const source = mockMaterialSources.find((item) => item.id === selectedSourceId) ?? selectMaterialSource(scenario, mockMaterialSources);
    const book = generateOrSelectWordBook({ goal: profile?.goal ?? draftGoal, scenario, source, books: mockWordBooks });
    setSelectedBookId(book.id);
    setView("books");
  }

  function confirmBook() {
    const book = mockWordBooks.find((item) => item.id === selectedBookId) ?? mockWordBooks[0]!;
    const profileForPlan =
      profile ??
      initializeVocabularyProfile({
        userId,
        goal: draftGoal,
        level: draftLevel,
        intensity: draftIntensity,
        preferences: draftPreferences,
        scenarioId: selectedScenarioId,
        bookId: book.id,
        initialized: false
      });
    const nextPlan = createStudyPlan({
      userId,
      goal: profileForPlan.goal,
      level: profileForPlan.level,
      profile: profileForPlan,
      scenarioId: selectedScenarioId,
      book
    });
    setPlan(nextPlan);
    setPendingPlan(nextPlan);
    setProfile({
      ...profileForPlan,
      currentScenarioId: selectedScenarioId,
      currentBookId: book.id,
      currentPlanId: nextPlan.id,
      initialized: false,
      updatedAt: nextPlan.updatedAt
    });
    setView("plan");
  }

  function confirmPlan() {
    const book = mockWordBooks.find((item) => item.id === selectedBookId) ?? mockWordBooks[0]!;
    const nextPlan =
      pendingPlan ??
      createStudyPlan({
        userId,
        goal: profile?.goal ?? draftGoal,
        level: profile?.level ?? draftLevel,
        profile: profile ?? { dailyNewWords: plan.dailyNewItems, dailyReviewLimit: plan.dailyReviewLimit },
        scenarioId: selectedScenarioId,
        book
      });
    const initializedStates = initializeItemStates(userId, book);
    setPlan(nextPlan);
    setPendingPlan(null);
    setStates(initializedStates);
    setWrongWords([]);
    setProfile((current) =>
      current
        ? { ...current, currentScenarioId: selectedScenarioId, currentBookId: book.id, currentPlanId: nextPlan.id, initialized: true, updatedAt: new Date().toISOString() }
        : initializeVocabularyProfile({
            userId,
            goal: draftGoal,
            level: draftLevel,
            intensity: draftIntensity,
            preferences: draftPreferences,
            scenarioId: selectedScenarioId,
            bookId: book.id,
            planId: nextPlan.id,
            initialized: true
          })
    );
    refreshTask(initializedStates, [], nextPlan);
    setView("home");
  }

  function startTodayLearning() {
    const nextTask = refreshTask();
    setTask({ ...nextTask, status: "learning" });
    setLearnIds(nextTask.newItemIds);
    setLearnIndex(0);
    setFeedback(null);
    if (nextTask.newItemIds.length) {
      setView("learn");
      return;
    }
    startQuestionSet([...nextTask.wrongItemIds, ...nextTask.reviewItemIds], "review");
  }

  function markStudyChoice(choice: StudyChoice) {
    const word = currentLearnWord;
    if (!word) return;
    const nextState = updateItemStateAfterStudy(stateMap.get(word.id), userId, word.id, choice, plan.bookId);
    const nextStates = upsertState(states, nextState);
    setStates(nextStates);

    if (learnIndex + 1 < learnIds.length) {
      setLearnIndex((index) => index + 1);
      return;
    }

    setTask((current) => ({ ...current, status: "practicing" }));
    startQuestionSet(learnIds, "new", nextStates);
  }

  function startQuestionSet(itemIds: string[], mode: PracticeMode, nextStates = states) {
    const selectedWords = findWords(itemIds);
    setPracticeMode(mode);
    setQuestions(mode === "test" ? generateStageTest(mockWords, nextStates, wrongWords) : generatePracticeQuestions(selectedWords, mockWords));
    setQuestionIndex(0);
    setFeedback(null);
    setStates(nextStates);
    setView(mode === "review" ? "review" : mode === "test" ? "test" : "practice");
  }

  function submitAnswer(answer: string) {
    if (!currentQuestion || feedback) return;
    const result = checkPracticeAnswer({
      userId,
      question: currentQuestion,
      answer,
      state: stateMap.get(currentQuestion.itemId),
      responseTime: 5,
      sessionId: `session_${task.taskId}`
    });
    const nextStates = upsertState(states, result.nextState);
    let nextWrongWords = wrongWords;

    if (!result.isCorrect && result.errorType) {
      const nextWrong = addWrongItemRecord(wrongMap.get(currentQuestion.itemId), userId, currentQuestion.itemId, result.errorType, result.nextState.masteryScore);
      nextWrongWords = upsertWrong(wrongWords, nextWrong);
      setWrongWords(nextWrongWords);
    }

    setStates(nextStates);
    setRecords((current) => [...current, result.record]);
    setFeedback(result.feedback);

    if (result.isCorrect && practiceMode === "wrong") {
      resolveWrongIfStable(currentQuestion.itemId, nextStates, nextWrongWords);
    }
  }

  function nextQuestion() {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((index) => index + 1);
      setFeedback(null);
      return;
    }

    if (practiceMode === "test") {
      setStageResult(evaluateStageTest(records, states));
    }
    const nextReport = generateLearningReport({ userId, task: { ...task, status: "completed" }, records, states, wrongWords });
    setTask((current) => ({ ...current, status: "completed" }));
    setReport(nextReport);
    setView(practiceMode === "test" ? "test" : "report");
  }

  function startReview() {
    startQuestionSet([...task.wrongItemIds, ...task.reviewItemIds], "review");
  }

  function startWrongPractice() {
    startQuestionSet(
      wrongWords.filter((record) => !record.resolved).map((record) => record.itemId),
      "wrong"
    );
  }

  function startStageTest() {
    startQuestionSet([], "test");
  }

  function resolveWrong(itemId: string) {
    const nextWrongWords = wrongWords.map((record) => (record.itemId === itemId ? { ...record, resolved: true, resolvedAt: new Date().toISOString() } : record));
    const nextStates = upsertState(states, { ...(stateMap.get(itemId) ?? createDefaultState(userId, itemId, plan.bookId)), status: "reviewing", masteryScore: Math.max(60, stateMap.get(itemId)?.masteryScore ?? 0) });
    setWrongWords(nextWrongWords);
    setStates(nextStates);
    refreshTask(nextStates, nextWrongWords);
  }

  function openReport() {
    setReport(generateLearningReport({ userId, task, records, states, wrongWords }));
    setView("report");
  }

  function applyPlanAdjustment() {
    const currentReport = report ?? generateLearningReport({ userId, task, records, states, wrongWords });
    const nextPlan = adjustStudyPlan(plan, currentReport);
    setPlan(nextPlan);
    setProfile((current) =>
      current
        ? { ...current, dailyNewWords: nextPlan.dailyNewItems, dailyReviewLimit: nextPlan.dailyReviewLimit, currentPlanId: nextPlan.id, updatedAt: nextPlan.updatedAt }
        : current
    );
    refreshTask(states, wrongWords, nextPlan);
    setView("home");
  }

  function backHome() {
    refreshTask();
    setView(profile?.initialized ? "home" : "onboarding");
    setFeedback(null);
  }

  function resolveWrongIfStable(itemId: string, nextStates: UserWordState[], nextWrongWords: WrongWordRecord[]) {
    const state = nextStates.find((item) => item.itemId === itemId);
    if (!state || state.continuousCorrectCount < 2) return;
    setWrongWords(nextWrongWords.map((record) => (record.itemId === itemId ? { ...record, resolved: true, resolvedAt: new Date().toISOString() } : record)));
  }

  return {
    words: mockWords,
    scenarios: mockScenarios,
    sources: mockMaterialSources,
    books: mockWordBooks,
    profile,
    plan,
    pendingPlan,
    states,
    wrongWords,
    task,
    view,
    practiceMode,
    currentScenario,
    currentSource,
    currentBook,
    currentLearnWord,
    currentQuestion,
    learnIndex,
    learnTotal: learnIds.length,
    questionIndex,
    questionTotal: questions.length,
    feedback,
    report,
    stageResult,
    progress,
    libraryProgress,
    draftGoal,
    setDraftGoal,
    draftLevel,
    setDraftLevel,
    draftPreferences,
    setDraftPreferences,
    draftIntensity,
    setDraftIntensity,
    recommendedScenarios,
    selectedScenarioId,
    setSelectedScenarioId,
    selectedSourceId,
    setSelectedSourceId,
    selectedBookId,
    setSelectedBookId,
    setView,
    backHome,
    completeOnboarding,
    confirmScenario,
    confirmBook,
    confirmPlan,
    startTodayLearning,
    markStudyChoice,
    submitAnswer,
    nextQuestion,
    startReview,
    startWrongPractice,
    startStageTest,
    resolveWrong,
    openReport,
    applyPlanAdjustment
  };
}

function findWords(ids: string[]): Word[] {
  return ids.map((id) => mockWords.find((word) => word.id === id)).filter(Boolean) as Word[];
}

function upsertState(states: UserWordState[], nextState: UserWordState) {
  const exists = states.some((state) => state.itemId === nextState.itemId);
  return exists ? states.map((state) => (state.itemId === nextState.itemId ? nextState : state)) : [...states, nextState];
}

function upsertWrong(records: WrongWordRecord[], nextRecord: WrongWordRecord) {
  const exists = records.some((record) => record.itemId === nextRecord.itemId);
  return exists ? records.map((record) => (record.itemId === nextRecord.itemId ? nextRecord : record)) : [...records, nextRecord];
}
