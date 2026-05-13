import type {
  DailyTask,
  ErrorType,
  LearningFeedback,
  LearningItem,
  LearningPreference,
  LearningReport,
  LearningScenario,
  MaterialSource,
  PracticeQuestion,
  PracticeRecord,
  QuestionType,
  StageTestResult,
  StudyPlan,
  UserWordState,
  VocabularyGoal,
  VocabularyLevel,
  VocabularyProfile,
  Word,
  WordBook,
  WrongWordRecord
} from "./types";

export type StudyChoice = "known" | "fuzzy" | "unknown";

type GenerateTaskInput = {
  userId: string;
  words: Word[];
  states: UserWordState[];
  wrongWords: WrongWordRecord[];
  plan?: StudyPlan;
  scenarioId?: string;
  bookId?: string;
  now?: Date;
};

type CheckAnswerInput = {
  userId: string;
  question: PracticeQuestion;
  answer: string;
  state?: UserWordState;
  now?: Date;
  responseTime?: number;
  sessionId?: string;
  usedHint?: boolean;
};

type ReportInput = {
  userId: string;
  task: DailyTask;
  records: PracticeRecord[];
  states: UserWordState[];
  wrongWords: WrongWordRecord[];
  date?: string;
  period?: LearningReport["period"];
};

export function initializeVocabularyProfile(input: {
  userId: string;
  goal: VocabularyGoal;
  level: VocabularyLevel;
  intensity: "light" | "normal" | "heavy";
  preferences: LearningPreference[];
  scenarioId?: string;
  bookId?: string;
  planId?: string;
  initialized?: boolean;
  now?: Date;
}): VocabularyProfile {
  const dailyNewWords = input.intensity === "heavy" ? 18 : input.intensity === "normal" ? 12 : 6;
  const timestamp = (input.now ?? new Date()).toISOString();
  return {
    userId: input.userId,
    goal: input.goal,
    level: input.level,
    dailyNewWords,
    dailyReviewLimit: Math.max(8, Math.round(dailyNewWords * 1.5)),
    preferences: input.preferences,
    currentScenarioId: input.scenarioId ?? "",
    currentBookId: input.bookId ?? "",
    currentPlanId: input.planId ?? "",
    initialized: input.initialized ?? false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function recommendScenarios(goal: VocabularyGoal, scenarios: LearningScenario[]) {
  return scenarios.filter((scenario) => scenario.targetGoals.includes(goal) || scenario.targetGoals.includes("custom"));
}

export function selectMaterialSource(scenario: LearningScenario, sources: MaterialSource[], preferredType?: MaterialSource["type"]) {
  return (
    sources.find((source) => source.type === preferredType) ??
    sources.find((source) => scenario.recommendedSourceTypes.includes(source.type)) ??
    sources[0]
  );
}

export function generateOrSelectWordBook(input: {
  goal: VocabularyGoal;
  scenario: LearningScenario;
  source: MaterialSource;
  books: WordBook[];
}) {
  const category = input.source.type.includes("exam") ? "exam" : input.source.type === "ai_generated" ? "ai" : input.source.type.includes("content") || input.source.type.includes("course") ? "content" : "official";
  return (
    input.books.find((book) => book.scenarioId === input.scenario.id && book.category === category) ??
    input.books.find((book) => book.scenarioId === input.scenario.id) ??
    input.books[0]
  );
}

export function createStudyPlan(input: {
  userId: string;
  goal: VocabularyGoal;
  level: VocabularyLevel;
  profile: Pick<VocabularyProfile, "dailyNewWords" | "dailyReviewLimit">;
  scenarioId: string;
  book: WordBook;
  now?: Date;
}): StudyPlan {
  const now = input.now ?? new Date();
  const days = Math.ceil(input.book.totalItems / Math.max(1, input.profile.dailyNewWords));
  const estimated = new Date(now);
  estimated.setDate(estimated.getDate() + days);
  return {
    id: `plan_${input.userId}_${input.book.id}`,
    userId: input.userId,
    goal: input.goal,
    scenarioId: input.scenarioId,
    bookId: input.book.id,
    dailyNewItems: input.profile.dailyNewWords,
    dailyReviewLimit: input.profile.dailyReviewLimit,
    testCycle: input.level === "advanced" ? "per_100_items" : "weekly",
    estimatedFinishDate: toDateKey(estimated),
    status: "active",
    version: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function initializeItemStates(userId: string, book: WordBook, now = new Date()): UserWordState[] {
  return book.itemIds.map((itemId) => createDefaultState(userId, itemId, book.id, now));
}

export function generateTodayTask({ userId, words, states, wrongWords, plan, scenarioId = "scenario_exam_core", bookId = "book_exam_core_1200", now = new Date() }: GenerateTaskInput): DailyTask {
  const date = toDateKey(now);
  const stateMap = new Map(states.map((state) => [state.itemId, state]));
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const dailyNewLimit = plan?.dailyNewItems ?? 6;
  const dailyReviewLimit = plan?.dailyReviewLimit ?? 8;

  const wrongItemIds = wrongWords
    .filter((record) => record.userId === userId && !record.resolved)
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, Math.min(4, dailyReviewLimit))
    .map((record) => record.itemId);

  const forgettingItemIds = states
    .filter((state) => state.userId === userId && !wrongItemIds.includes(state.itemId) && state.status === "weak")
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 2)
    .map((state) => state.itemId);

  const dueReviewItemIds = states
    .filter((state) => {
      if (state.userId !== userId || wrongItemIds.includes(state.itemId) || forgettingItemIds.includes(state.itemId) || !state.nextReviewAt) return false;
      return new Date(state.nextReviewAt).getTime() <= todayEnd.getTime() && state.status !== "mastered";
    })
    .sort((a, b) => new Date(a.nextReviewAt ?? 0).getTime() - new Date(b.nextReviewAt ?? 0).getTime())
    .slice(0, Math.max(0, dailyReviewLimit - wrongItemIds.length - forgettingItemIds.length))
    .map((state) => state.itemId);

  const reviewItemIds = unique([...forgettingItemIds, ...dueReviewItemIds]);
  const reserved = new Set([...wrongItemIds, ...reviewItemIds]);
  const newItemIds = words
    .filter((word) => {
      const state = stateMap.get(word.id);
      return !reserved.has(word.id) && (!state || state.status === "new");
    })
    .slice(0, Math.max(2, dailyNewLimit - wrongItemIds.length))
    .map((word) => word.id);

  const masteredProbe = states
    .filter((state) => state.status === "mastered")
    .slice(0, wrongItemIds.length || reviewItemIds.length ? 0 : 1)
    .map((state) => state.itemId);

  const finalReviewItemIds = unique([...reviewItemIds, ...masteredProbe]);
  const testRequired = states.filter((state) => state.status !== "new").length >= 6;
  const generatedReason = [
    wrongItemIds.length ? "优先安排错词强化" : "",
    dueReviewItemIds.length ? "存在今日到期复习词" : "",
    newItemIds.length ? "补充今日新词任务" : "",
    testRequired ? "已达到阶段测试触发条件" : ""
  ].filter(Boolean);

  return {
    taskId: `task_${userId}_${date}`,
    userId,
    date,
    planId: plan?.id ?? "plan_mock",
    scenarioId,
    bookId,
    newItemIds,
    reviewItemIds: finalReviewItemIds,
    wrongItemIds,
    testRequired,
    estimatedMinutes: newItemIds.length * 2 + finalReviewItemIds.length + wrongItemIds.length * 2 + (testRequired ? 4 : 0),
    status: "pending",
    generatedReason,
    createdAt: now.toISOString(),
    newWordIds: newItemIds,
    reviewWordIds: finalReviewItemIds,
    wrongWordIds: wrongItemIds
  };
}

export function updateItemStateAfterStudy(state: UserWordState | undefined, userId: string, itemId: string, choice: StudyChoice, bookId = "book_exam_core_1200", now = new Date()): UserWordState {
  const base = state ?? createDefaultState(userId, itemId, bookId, now);
  const config = {
    known: { status: "familiar" as const, delta: 18 },
    fuzzy: { status: "weak" as const, delta: 6 },
    unknown: { status: "learning" as const, delta: -4 }
  }[choice];

  return {
    ...base,
    status: config.status,
    masteryScore: clamp(base.masteryScore + config.delta),
    lastStudiedAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export const updateWordStateAfterStudy = updateItemStateAfterStudy;

export function generatePracticeQuestions(items: Word[], allItems: Word[]): PracticeQuestion[] {
  return items.flatMap((item, index) => [
    {
      id: `q_${item.id}_meaning_${index}`,
      itemId: item.id,
      wordId: item.id,
      questionType: "select_meaning",
      prompt: item.word,
      options: buildOptions(item.meaningCn, allItems.map((candidate) => candidate.meaningCn)),
      correctAnswer: item.meaningCn,
      explanation: `在 ${item.scenarioTags[0] ?? "当前场景"} 中，${item.word} 常表示“${item.meaningCn}”。`
    },
    {
      id: `q_${item.id}_recognition_${index}`,
      itemId: item.id,
      wordId: item.id,
      questionType: "select_word",
      prompt: item.meaningCn,
      options: buildOptions(item.word, allItems.map((candidate) => candidate.word)),
      correctAnswer: item.word,
      explanation: `看到中文释义时，需要能反向回忆出 ${item.word}。`
    },
    {
      id: `q_${item.id}_spelling_${index}`,
      itemId: item.id,
      wordId: item.id,
      questionType: "spelling",
      prompt: item.meaningCn,
      correctAnswer: item.word,
      explanation: `拼写训练会影响写作和听口输入后的记录准确率。`
    }
  ]);
}

export function checkPracticeAnswer({ userId, question, answer, state, now = new Date(), responseTime = 6, sessionId = `session_${toDateKey(now)}`, usedHint = false }: CheckAnswerInput) {
  const base = state ?? createDefaultState(userId, question.itemId, "book_exam_core_1200", now);
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);
  const errorType = isCorrect ? undefined : getErrorType(question.questionType);
  const nextContinuousCorrect = isCorrect ? base.continuousCorrectCount + 1 : 0;
  const nextContinuousWrong = isCorrect ? 0 : base.continuousWrongCount + 1;
  const nextCorrectCount = isCorrect ? base.correctCount + 1 : base.correctCount;
  const nextWrongCount = isCorrect ? base.wrongCount : base.wrongCount + 1;
  const fastAnswer = responseTime <= 5;
  const masteryDelta = isCorrect ? (fastAnswer ? 16 : 10) : nextContinuousWrong >= 2 ? -28 : -20;
  const masteryScore = clamp(base.masteryScore + masteryDelta);
  const status = resolveNextStatus(base.status, isCorrect, masteryScore, nextContinuousCorrect, nextContinuousWrong);

  const nextState = updateReviewSchedule(
    {
      ...base,
      status,
      masteryScore,
      correctCount: nextCorrectCount,
      wrongCount: nextWrongCount,
      continuousCorrectCount: nextContinuousCorrect,
      continuousWrongCount: nextContinuousWrong,
      lastReviewedAt: now.toISOString(),
      errorTypes: errorType ? unique([...base.errorTypes, errorType]) : base.errorTypes,
      updatedAt: now.toISOString()
    },
    isCorrect,
    responseTime,
    now
  );

  const record: PracticeRecord = {
    recordId: `record_${question.id}_${now.getTime()}`,
    userId,
    sessionId,
    itemId: question.itemId,
    wordId: question.itemId,
    questionType: question.questionType,
    isCorrect,
    answer,
    correctAnswer: question.correctAnswer,
    errorType,
    responseTime,
    usedHint,
    createdAt: now.toISOString()
  };

  const feedback = generateFeedback({ question, isCorrect, errorType });
  return { isCorrect, errorType, record, nextState, feedback };
}

export function generateFeedback(input: { question: PracticeQuestion; isCorrect: boolean; errorType?: ErrorType }): LearningFeedback {
  if (input.isCorrect) {
    return {
      isCorrect: true,
      correctAnswer: input.question.correctAnswer,
      explanation: input.question.explanation ?? "回答正确，系统会把这个学习对象加入后续间隔复习队列。",
      scenarioExample: input.question.explanation,
      nextAction: "提高掌握度，并根据反应速度延长下次复习间隔。"
    };
  }

  const explanationByType: Record<ErrorType, string> = {
    unknown: "这个词还没有形成稳定记忆，需要回到单词卡片重新学习。",
    meaning_confusion: "你可能混淆了释义，系统会增加中英互认和近义辨析。",
    spelling_error: "拼写存在偏差，系统会增加拼写输入训练。",
    listening_error: "听音识别不稳定，后续可扩展听音选词训练。",
    context_error: "语境判断不稳定，系统会增加例句填空。",
    reverse_recall_failed: "反向回忆失败，需要从中文释义主动回忆英文。"
  };

  return {
    isCorrect: false,
    correctAnswer: input.question.correctAnswer,
    errorType: input.errorType,
    explanation: explanationByType[input.errorType ?? "unknown"],
    scenarioExample: input.question.explanation,
    nextAction: "加入错词本，并安排当天再次复习或专项强化。"
  };
}

export function addWrongItemRecord(existing: WrongWordRecord | undefined, userId: string, itemId: string, errorType: ErrorType, masteryScore = 20, now = new Date()): WrongWordRecord {
  const laterToday = new Date(now);
  laterToday.setHours(Math.min(23, now.getHours() + 2), now.getMinutes(), 0, 0);
  if (!existing) {
    return {
      id: `wrong_${userId}_${itemId}`,
      userId,
      itemId,
      wordId: itemId,
      wrongCount: 1,
      errorTypes: [errorType],
      lastWrongAt: now.toISOString(),
      masteryScore,
      nextReviewAt: laterToday.toISOString(),
      resolved: false
    };
  }

  return {
    ...existing,
    wrongCount: existing.wrongCount + 1,
    errorTypes: unique([...existing.errorTypes, errorType]),
    lastWrongAt: now.toISOString(),
    masteryScore,
    nextReviewAt: laterToday.toISOString(),
    resolved: false
  };
}

export const addWrongWord = addWrongItemRecord;

export function generateWrongItemPractice(record: WrongWordRecord) {
  if (record.errorTypes.includes("spelling_error")) return "拼写训练";
  if (record.errorTypes.includes("meaning_confusion")) return "近义词辨析";
  if (record.errorTypes.includes("listening_error")) return "听音训练";
  if (record.errorTypes.includes("context_error")) return "例句填空";
  return "重新学习卡片";
}

export function updateReviewSchedule(state: UserWordState, isCorrect: boolean, responseTime = 6, now = new Date()): UserWordState {
  if (!isCorrect) {
    const laterToday = new Date(now);
    laterToday.setHours(Math.min(23, now.getHours() + 2), now.getMinutes(), 0, 0);
    return {
      ...state,
      currentIntervalDays: 0,
      easeFactor: Math.max(1.3, state.easeFactor - 0.2),
      nextReviewAt: laterToday.toISOString()
    };
  }

  const baseInterval = state.continuousCorrectCount >= 3 ? 7 : state.continuousCorrectCount >= 2 ? 3 : 1;
  const intervalDays = responseTime <= 5 ? Math.ceil(baseInterval * state.easeFactor * 0.8) : baseInterval;
  const next = new Date(now);
  next.setDate(next.getDate() + intervalDays);
  next.setHours(8, 0, 0, 0);

  return {
    ...state,
    currentIntervalDays: intervalDays,
    easeFactor: Math.min(2.8, state.easeFactor + (responseTime <= 5 ? 0.08 : 0.03)),
    nextReviewAt: next.toISOString()
  };
}

export function generateStageTest(items: Word[], states: UserWordState[], wrongWords: WrongWordRecord[]) {
  const learned = states.filter((state) => state.status !== "new").map((state) => state.itemId);
  const weak = states.filter((state) => state.status === "weak" || state.status === "wrong").map((state) => state.itemId);
  const wrong = wrongWords.filter((record) => !record.resolved).map((record) => record.itemId);
  const selectedIds = unique([...wrong, ...weak, ...learned]).slice(0, 6);
  return generatePracticeQuestions(
    selectedIds.map((id) => items.find((item) => item.id === id)).filter(Boolean) as Word[],
    items
  );
}

export function evaluateStageTest(records: PracticeRecord[], states: UserWordState[]): StageTestResult {
  const correct = records.filter((record) => record.isCorrect).length;
  const accuracyRate = records.length ? Math.round((correct / records.length) * 100) : 0;
  const mastered = states.filter((state) => state.status === "mastered").length;
  const masteryRate = states.length ? Math.round((mastered / states.length) * 100) : 0;
  const weakItems = unique(records.filter((record) => !record.isCorrect).map((record) => record.itemId));
  const weakQuestionTypes = unique(records.filter((record) => !record.isCorrect).map((record) => record.questionType));
  return {
    score: accuracyRate,
    accuracyRate,
    masteryRate,
    weakItems,
    weakQuestionTypes,
    suggestion: accuracyRate >= 85 ? "阶段掌握稳定，可以进入下一组词库单元。" : "先降低新词量，集中处理错词和弱题型。",
    adjustmentAdvice: weakQuestionTypes.includes("spelling") ? "明日增加拼写训练比例。" : "保持当前节奏，增加到期复习。"
  };
}

export function generateLearningReport({ userId, task, records, states, wrongWords, date = task.date, period = "daily" }: ReportInput): LearningReport {
  const correctCount = records.filter((record) => record.isCorrect).length;
  const accuracyRate = records.length ? Math.round((correctCount / records.length) * 100) : 0;
  const masteredItemsCount = states.filter((state) => state.userId === userId && state.status === "mastered").length;
  const wrongItemsCount = wrongWords.filter((record) => record.userId === userId && !record.resolved).length;
  const weakQuestionTypes = unique(records.filter((record) => !record.isCorrect).map((record) => record.questionType));
  const weakItems = unique(records.filter((record) => !record.isCorrect).map((record) => record.itemId));
  const completedActions = records.length + (task.status === "completed" ? 1 : 0);
  const totalActions = Math.max(1, task.newItemIds.length + task.reviewItemIds.length + task.wrongItemIds.length);
  const taskCompletionRate = Math.min(100, Math.round((completedActions / totalActions) * 100));
  const suggestion =
    accuracyRate >= 85
      ? "表现稳定，下一轮可以增加新词，并保留少量错词复盘。"
      : wrongItemsCount > 2
        ? "先做错词强化，尤其关注拼写和中英互认，再进入新词。"
        : "继续完成到期复习，保持每天 10-15 分钟的学习节奏。";

  return {
    id: `report_${userId}_${period}_${date}`,
    userId,
    period,
    dateRange: { start: date, end: date },
    newItemsCount: task.newItemIds.length,
    reviewedItemsCount: task.reviewItemIds.length + task.wrongItemIds.length,
    masteredItemsCount,
    wrongItemsCount,
    accuracyRate,
    taskCompletionRate,
    studyDurationSeconds: records.reduce((sum, record) => sum + record.responseTime, 0),
    weakQuestionTypes,
    weakItems,
    suggestion,
    createdAt: new Date().toISOString(),
    date,
    newWordsCount: task.newItemIds.length,
    reviewWordsCount: task.reviewItemIds.length + task.wrongItemIds.length,
    wrongWordsCount: wrongItemsCount,
    masteredWordsCount: masteredItemsCount
  };
}

export function adjustStudyPlan(plan: StudyPlan, report: LearningReport, now = new Date()): StudyPlan {
  const tooManyWrong = report.wrongItemsCount >= 4 || report.accuracyRate < 70;
  const nextDailyNewItems = tooManyWrong ? Math.max(4, plan.dailyNewItems - 2) : report.accuracyRate >= 90 ? plan.dailyNewItems + 2 : plan.dailyNewItems;
  return {
    ...plan,
    dailyNewItems: nextDailyNewItems,
    dailyReviewLimit: tooManyWrong ? plan.dailyReviewLimit + 3 : plan.dailyReviewLimit,
    version: plan.version + 1,
    updatedAt: now.toISOString()
  };
}

export function createDefaultState(userId: string, itemId: string, bookId = "book_exam_core_1200", now = new Date()): UserWordState {
  return {
    userId,
    itemId,
    wordId: itemId,
    bookId,
    status: "new",
    masteryScore: 0,
    correctCount: 0,
    wrongCount: 0,
    continuousCorrectCount: 0,
    continuousWrongCount: 0,
    currentIntervalDays: 0,
    easeFactor: 2.3,
    errorTypes: [],
    updatedAt: now.toISOString()
  };
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function resolveNextStatus(current: UserWordState["status"], isCorrect: boolean, masteryScore: number, continuousCorrectCount: number, continuousWrongCount: number): UserWordState["status"] {
  if (!isCorrect) {
    if (current === "mastered") return "weak";
    if (continuousWrongCount >= 2) return "learning";
    return "wrong";
  }
  if (masteryScore >= 90 || continuousCorrectCount >= 3) return "mastered";
  if (current === "wrong" || current === "weak") return "reviewing";
  return "reviewing";
}

function getErrorType(questionType: QuestionType): ErrorType {
  if (questionType === "spelling") return "spelling_error";
  if (questionType === "select_word") return "reverse_recall_failed";
  if (questionType === "listening") return "listening_error";
  if (questionType === "cloze") return "context_error";
  return "meaning_confusion";
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildOptions(correct: string, pool: string[]) {
  const distractors = pool.filter((item) => item !== correct).slice(0, 8);
  return deterministicShuffle([correct, ...distractors].slice(0, 4), correct);
}

function deterministicShuffle(values: string[], seed: string) {
  return [...values].sort((a, b) => ((a + seed).charCodeAt(0) % 7) - ((b + seed).charCodeAt(0) % 7));
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
