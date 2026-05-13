"use client";

import { ArrowLeft, BarChart3, BookOpen, Check, ChevronRight, Clock3, FileText, Layers3, RotateCcw, Settings2, Sparkles, Target, Volume2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useVocabularySession, type VocabularyView } from "./use-vocabulary-session";
import type { LearningPreference, PracticeQuestion, VocabularyGoal, VocabularyLevel, Word, WrongWordRecord } from "./types";

export function VocabularyLearningModule({
  userId,
  onBack,
  onDailyComplete,
  initialView
}: {
  userId: string;
  onBack: () => void;
  onDailyComplete?: (summary: { newWords: number; reviewWords: number; wrongWords: number }) => void;
  initialView?: VocabularyView;
}) {
  const session = useVocabularySession(userId, initialView);

  return (
    <section className="task-screen vocab-module">
      <header className="task-header vocab-module-header">
        <button className="icon-button" type="button" aria-label="返回学习概览" onClick={session.view === "home" ? onBack : session.backHome}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <strong>词汇学习</strong>
          <span>{session.currentScenario.name} · {session.currentBook.name}</span>
        </div>
      </header>

      {session.view === "entry" && <EntryView session={session} />}
      {session.view === "onboarding" && <OnboardingView session={session} />}
      {session.view === "scenario" && <ScenarioView session={session} />}
      {session.view === "books" && <BooksView session={session} />}
      {session.view === "plan" && <PlanView session={session} />}
      {session.view === "home" && <VocabularyHome session={session} onBack={onBack} />}
      {session.view === "learn" && <LearnView session={session} />}
      {(session.view === "practice" || session.view === "review" || session.view === "test") && <PracticeView session={session} />}
      {session.view === "feedback" && <FeedbackOnlyView session={session} />}
      {session.view === "wrong" && <WrongBookView session={session} />}
      {session.view === "settings" && <SettingsView session={session} />}
      {session.view === "report" && (
        <ReportView
          session={session}
          onDailyComplete={() =>
            onDailyComplete?.({
              newWords: session.task.newWordIds.length,
              reviewWords: session.task.reviewWordIds.length,
              wrongWords: session.task.wrongWordIds.length
            })
          }
        />
      )}
    </section>
  );
}

function EntryView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow">
      <section className="vocab-hero-panel">
        <div>
          <span className="tiny-label">VOCABULARY MODULE</span>
          <h2>任务驱动的背单词学习模块</h2>
          <p>目标、场景、素材、词库、计划和复习调度会组合成每日可执行任务。</p>
        </div>
        <div className="vocab-hero-orb">
          <Target size={24} />
          <span>LearningItem</span>
        </div>
      </section>
      <div className="vocab-action-grid">
        <button className="vocab-primary-action" type="button" onClick={() => session.setView(session.profile?.initialized ? "home" : "onboarding")}>
          <Sparkles size={18} />
          <span>
            <strong>{session.profile?.initialized ? "进入今日任务" : "开始初始化"}</strong>
            <small>首次使用会先完成目标、场景和词库选择</small>
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function OnboardingView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const goals: Array<{ id: VocabularyGoal; label: string }> = [
    { id: "cet4", label: "四级" },
    { id: "postgraduate", label: "考研" },
    { id: "ielts", label: "雅思" },
    { id: "toefl", label: "托福" },
    { id: "business", label: "商务英语" },
    { id: "daily", label: "日常英语" },
    { id: "reading", label: "阅读提升" },
    { id: "course", label: "课程学习" }
  ];
  const levels: Array<{ id: VocabularyLevel; label: string }> = [
    { id: "starter", label: "入门" },
    { id: "basic", label: "基础" },
    { id: "intermediate", label: "中阶" },
    { id: "advanced", label: "进阶" }
  ];
  const preferences: Array<{ id: LearningPreference; label: string }> = [
    { id: "memory", label: "偏记忆" },
    { id: "spelling", label: "偏拼写" },
    { id: "listening", label: "偏听力" },
    { id: "example", label: "偏例句" },
    { id: "exam", label: "偏考试" },
    { id: "reading", label: "偏阅读" },
    { id: "speaking", label: "偏口语" },
    { id: "business", label: "偏商务" }
  ];

  function togglePreference(id: LearningPreference) {
    session.setDraftPreferences(session.draftPreferences.includes(id) ? session.draftPreferences.filter((item) => item !== id) : [...session.draftPreferences, id]);
  }

  return (
    <div className="vocab-flow">
      <VocabularySetupSteps current="goal" />
      <SetupSection icon={<Target size={18} />} title="目标设定" desc="先确定长期目标，系统会据此推荐场景、词库和题型比例。">
        <ChoiceGrid>
          {goals.map((goal) => (
            <button className={session.draftGoal === goal.id ? "active" : ""} key={goal.id} type="button" onClick={() => session.setDraftGoal(goal.id)}>
              {goal.label}
            </button>
          ))}
        </ChoiceGrid>
      </SetupSection>
      <SetupSection icon={<BarChart3 size={18} />} title="水平与强度" desc="MVP 中先用轻量规则换算每日新词和复习上限。">
        <ChoiceGrid>
          {levels.map((level) => (
            <button className={session.draftLevel === level.id ? "active" : ""} key={level.id} type="button" onClick={() => session.setDraftLevel(level.id)}>
              {level.label}
            </button>
          ))}
        </ChoiceGrid>
        <ChoiceGrid>
          {(["light", "normal", "heavy"] as const).map((item) => (
            <button className={session.draftIntensity === item ? "active" : ""} key={item} type="button" onClick={() => session.setDraftIntensity(item)}>
              {item === "light" ? "轻量" : item === "normal" ? "标准" : "高强度"}
            </button>
          ))}
        </ChoiceGrid>
      </SetupSection>
      <SetupSection icon={<Settings2 size={18} />} title="学习偏好" desc="偏好会影响练习题型比例，第一版先沉淀到 Profile。">
        <ChoiceGrid>
          {preferences.map((preference) => (
            <button className={session.draftPreferences.includes(preference.id) ? "active" : ""} key={preference.id} type="button" onClick={() => togglePreference(preference.id)}>
              {preference.label}
            </button>
          ))}
        </ChoiceGrid>
      </SetupSection>
      <button className="vocab-primary-action" type="button" onClick={session.completeOnboarding}>
        <Sparkles size={18} />
        <span>
          <strong>保存目标，推荐学习场景</strong>
          <small>下一步选择场景和素材来源，暂不生成计划</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function ScenarioView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow">
      <VocabularySetupSteps current="scenario" />
      <SetupSection icon={<Layers3 size={18} />} title="场景与素材选择" desc="单词会绑定场景和来源，避免孤立记忆。">
        <div className="vocab-card-list">
          {session.scenarios.map((scenario) => (
            <button className={session.selectedScenarioId === scenario.id ? "active" : ""} key={scenario.id} type="button" onClick={() => session.setSelectedScenarioId(scenario.id)}>
              <strong>{scenario.name}</strong>
              <span>{scenario.description}</span>
              <small>{scenario.tags.join(" · ")}</small>
            </button>
          ))}
        </div>
      </SetupSection>
      <SetupSection icon={<FileText size={18} />} title="素材来源" desc="第一版使用 Mock，后续可接文章生词、课程生词、AI 生成词库和导入表。">
        <ChoiceGrid>
          {session.sources.map((source) => (
            <button className={session.selectedSourceId === source.id ? "active" : ""} key={source.id} type="button" onClick={() => session.setSelectedSourceId(source.id)}>
              {source.name}
            </button>
          ))}
        </ChoiceGrid>
      </SetupSection>
      <button className="vocab-primary-action" type="button" onClick={session.confirmScenario}>
        <Check size={18} />
        <span>
          <strong>确认场景与素材</strong>
          <small>进入词库选择</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function BooksView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow">
      <VocabularySetupSteps current="book" />
      <SetupSection icon={<BookOpen size={18} />} title="词库选择" desc="确认词库后，系统会初始化用户词库进度并生成今日任务。">
        <div className="vocab-card-list">
          {session.books.map((book) => (
            <button className={session.selectedBookId === book.id ? "active" : ""} key={book.id} type="button" onClick={() => session.setSelectedBookId(book.id)}>
              <strong>{book.name}</strong>
              <span>{book.description}</span>
              <small>{book.totalItems} 个学习对象 · {book.category} · {book.difficulty}</small>
            </button>
          ))}
        </div>
      </SetupSection>
      <button className="vocab-primary-action" type="button" onClick={session.confirmBook}>
        <Check size={18} />
        <span>
          <strong>确认词库，生成学习计划</strong>
          <small>根据目标、场景、素材和词库生成计划预览</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function PlanView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const previewPlan = session.pendingPlan ?? session.plan;
  const previewTask = {
    newWords: Math.min(previewPlan.dailyNewItems, session.currentBook.totalItems),
    reviews: previewPlan.dailyReviewLimit,
    wrong: 0,
    minutes: Math.round(Math.min(previewPlan.dailyNewItems, session.currentBook.totalItems) * 2 + previewPlan.dailyReviewLimit * 0.8)
  };

  return (
    <div className="vocab-flow">
      <VocabularySetupSteps current="plan" />
      <section className="vocab-plan-panel">
        <div>
          <span className="tiny-label">STUDY PLAN</span>
          <h2>学习计划生成</h2>
          <p>
            系统已根据「{goalLabel(session.profile?.goal ?? session.draftGoal)}」目标、{session.currentScenario.name}、{session.currentSource.name} 和 {session.currentBook.name} 生成第一版任务计划。
          </p>
        </div>
        <div className="vocab-plan-summary">
          <strong>{previewPlan.testCycle === "weekly" ? "每 7 天" : "每 100 词"}</strong>
          <span>阶段测试</span>
        </div>
      </section>
      <div className="vocab-task-grid">
        <MetricTile label="每日新词" value={previewPlan.dailyNewItems} suffix="个" tone="blue" />
        <MetricTile label="复习上限" value={previewPlan.dailyReviewLimit} suffix="个" tone="violet" />
        <MetricTile label="预计" value={previewTask.minutes} suffix="分钟" tone="amber" />
        <MetricTile label="完成日" value={Number(previewPlan.estimatedFinishDate.slice(5, 7))} suffix="月" tone="green" />
      </div>
      <section className="vocab-ai-advice">
        <Sparkles size={17} />
        <span>
          今日任务将按「错词强化 &gt; 即将遗忘词 &gt; 到期复习 &gt; 今日新词」生成。首次使用会先初始化词库进度，再进入今日任务控制台。
        </span>
      </section>
      <button className="vocab-primary-action" type="button" onClick={session.confirmPlan}>
        <Check size={18} />
        <span>
          <strong>确认计划，生成今日任务</strong>
          <small>初始化 LearningItem 状态并进入今日任务页</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function VocabularyHome({ session, onBack }: { session: ReturnType<typeof useVocabularySession>; onBack: () => void }) {
  const totalToday = session.task.newWordIds.length + session.task.reviewWordIds.length + session.task.wrongWordIds.length;

  return (
    <div className="vocab-flow">
      <section className="vocab-hero-panel">
        <div>
          <span className="tiny-label">TODAY VOCAB</span>
          <h2>{totalToday ? "系统已排好今日背词任务" : "今天没有强制任务"}</h2>
          <p>错词强化优先，其次是即将遗忘词和到期复习，最后补充新词。你只需要按流程完成。</p>
        </div>
        <div className="vocab-hero-orb">
          <strong>{session.libraryProgress}%</strong>
          <span>词库进度</span>
        </div>
      </section>

      <div className="vocab-task-grid">
        <MetricTile label="新词" value={session.task.newWordIds.length} suffix="词" tone="blue" />
        <MetricTile label="复习" value={session.task.reviewWordIds.length} suffix="词" tone="violet" />
        <MetricTile label="错词" value={session.task.wrongWordIds.length} suffix="词" tone="amber" />
        <MetricTile label="预计" value={session.task.estimatedMinutes} suffix="分钟" tone="green" />
      </div>
      <section className="vocab-ai-advice">
        <Sparkles size={17} />
        <span>{session.task.generatedReason.join("，") || "今天适合轻量复习，保持连续学习节奏。"}</span>
      </section>

      <div className="vocab-action-grid">
        <button className="vocab-primary-action" type="button" onClick={session.startTodayLearning}>
          <Sparkles size={18} />
          <span>
            <strong>开始今日学习</strong>
            <small>新词学习后自动进入即时练习</small>
          </span>
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={session.startReview} disabled={!session.task.reviewWordIds.length && !session.task.wrongWordIds.length}>
          <RotateCcw size={18} />
          <span>进入复习</span>
        </button>
        <button type="button" onClick={() => session.setView("wrong")}>
          <BookOpen size={18} />
          <span>查看错词本</span>
        </button>
        <button type="button" onClick={session.openReport}>
          <BarChart3 size={18} />
          <span>查看学习报告</span>
        </button>
        <button type="button" onClick={() => session.setView("books")}>
          <BookOpen size={18} />
          <span>查看词库</span>
        </button>
        <button type="button" onClick={session.startStageTest} disabled={!session.task.testRequired}>
          <FileText size={18} />
          <span>阶段测试</span>
        </button>
        <button type="button" onClick={() => session.setView("settings")}>
          <Settings2 size={18} />
          <span>调整计划</span>
        </button>
      </div>

      <button className="secondary-link vocab-exit" type="button" onClick={onBack}>
        回到主学习页
      </button>
    </div>
  );
}

function LearnView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const word = session.currentLearnWord;
  if (!word) {
    return <EmptyState title="当前没有新词" body="可以先进入复习或错词强化。" action="返回任务页" onAction={session.backHome} />;
  }

  return (
    <div className="vocab-flow">
      <ProgressHeader label="新词学习" current={session.learnIndex + 1} total={session.learnTotal} />
      <WordLearningCard word={word} />
      <div className="vocab-choice-grid">
        <button type="button" onClick={() => session.markStudyChoice("known")}>
          <Check size={18} />
          认识
        </button>
        <button type="button" onClick={() => session.markStudyChoice("fuzzy")}>
          <Sparkles size={18} />
          模糊
        </button>
        <button type="button" onClick={() => session.markStudyChoice("unknown")}>
          <X size={18} />
          不认识
        </button>
      </div>
    </div>
  );
}

function PracticeView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const question = session.currentQuestion;
  const [answer, setAnswer] = useState("");
  const title = session.view === "test" ? "阶段测试" : session.view === "review" ? "今日复习" : session.practiceMode === "wrong" ? "错词强化" : "即时练习";

  if (!question) {
    return <EmptyState title="暂无可练习题目" body="完成新词学习后会自动生成练习。" action="返回任务页" onAction={session.backHome} />;
  }

  function submit(value: string) {
    session.submitAnswer(value);
    setAnswer("");
  }

  return (
    <div className="vocab-flow">
      <ProgressHeader label={title} current={session.questionIndex + 1} total={session.questionTotal} progress={session.progress} />
      <QuestionCard question={question} answer={answer} setAnswer={setAnswer} submit={submit} disabled={Boolean(session.feedback)} />
      {session.feedback && (
        <div className={`vocab-feedback ${session.feedback.isCorrect ? "correct" : "wrong"}`}>
          <strong>{session.feedback.isCorrect ? "答对了" : "答错了"}</strong>
          <span>正确答案：{session.feedback.correctAnswer}</span>
          <p>{session.feedback.explanation}</p>
          <small>{session.feedback.nextAction}</small>
          <button type="button" onClick={session.nextQuestion}>
            {session.questionIndex + 1 >= session.questionTotal ? "查看结果" : "下一题"}
          </button>
        </div>
      )}
    </div>
  );
}

function FeedbackOnlyView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  if (!session.feedback) return <EmptyState title="暂无反馈" body="完成练习后会展示正误、错因和后续处理方式。" action="返回任务页" onAction={session.backHome} />;
  return (
    <div className="vocab-flow">
      <div className={`vocab-feedback ${session.feedback.isCorrect ? "correct" : "wrong"}`}>
        <strong>{session.feedback.isCorrect ? "回答正确" : "需要强化"}</strong>
        <span>正确答案：{session.feedback.correctAnswer}</span>
        <p>{session.feedback.explanation}</p>
        <small>{session.feedback.nextAction}</small>
        <button type="button" onClick={session.nextQuestion}>继续</button>
      </div>
    </div>
  );
}

function WrongBookView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const activeWrongWords = session.wrongWords.filter((record) => !record.resolved);

  if (!activeWrongWords.length) {
    return <EmptyState title="错词本是空的" body="答错的词会自动进入这里，连续答对后可移出。" action="返回任务页" onAction={session.backHome} />;
  }

  return (
    <div className="vocab-flow">
      <div className="vocab-list-head">
        <div>
          <span className="tiny-label">WRONG WORDS</span>
          <h2>错词强化队列</h2>
        </div>
        <button type="button" onClick={session.startWrongPractice}>
          重新练习
        </button>
      </div>
      <div className="vocab-wrong-list">
        {activeWrongWords.map((record) => (
          <WrongWordItem key={record.itemId} record={record} words={session.words} onResolve={() => session.resolveWrong(record.itemId)} />
        ))}
      </div>
    </div>
  );
}

function ReportView({ session, onDailyComplete }: { session: ReturnType<typeof useVocabularySession>; onDailyComplete: () => void }) {
  const report = session.report;
  if (!report) {
    return <EmptyState title="暂无报告" body="完成一轮学习或复习后会生成报告。" action="返回任务页" onAction={session.backHome} />;
  }

  return (
    <div className="vocab-flow">
      <section className="vocab-report-card">
        <span className="tiny-label">LEARNING REPORT</span>
        <h2>{report.accuracyRate}%</h2>
        <p>{report.suggestion}</p>
      </section>
      <div className="vocab-task-grid">
        <MetricTile label="新学" value={report.newWordsCount} suffix="词" tone="blue" />
        <MetricTile label="复习" value={report.reviewWordsCount} suffix="词" tone="violet" />
        <MetricTile label="错词" value={report.wrongWordsCount} suffix="词" tone="amber" />
        <MetricTile label="掌握" value={report.masteredWordsCount} suffix="词" tone="green" />
      </div>
      <button
        className="vocab-primary-action"
        type="button"
        onClick={() => {
          onDailyComplete();
          session.backHome();
        }}
      >
        <Check size={18} />
        <span>
          <strong>完成本轮任务</strong>
          <small>系统会基于表现生成下一轮任务</small>
        </span>
        <ChevronRight size={18} />
      </button>
      <button className="secondary-link vocab-exit" type="button" onClick={() => session.setView("settings")}>
        查看计划调整建议
      </button>
    </div>
  );
}

function SettingsView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow">
      <section className="vocab-report-card">
        <span className="tiny-label">PLAN ADJUSTMENT</span>
        <h2>v{session.plan.version}</h2>
        <p>当前每日新词 {session.plan.dailyNewItems} 个，复习上限 {session.plan.dailyReviewLimit} 个。系统会根据正确率、错词量和复习负荷调整下一轮任务。</p>
      </section>
      <div className="vocab-task-grid">
        <MetricTile label="新词量" value={session.plan.dailyNewItems} suffix="个" tone="blue" />
        <MetricTile label="复习上限" value={session.plan.dailyReviewLimit} suffix="个" tone="violet" />
        <MetricTile label="错词" value={session.wrongWords.filter((item) => !item.resolved).length} suffix="个" tone="amber" />
        <MetricTile label="完成度" value={session.libraryProgress} suffix="%" tone="green" />
      </div>
      <button className="vocab-primary-action" type="button" onClick={session.applyPlanAdjustment}>
        <Settings2 size={18} />
        <span>
          <strong>接受系统调整</strong>
          <small>生成下一轮任务，并更新计划版本</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function WordLearningCard({ word }: { word: Word }) {
  return (
    <section className="vocab-word-card">
      <div className="vocab-word-main">
        <div>
          <h2>{word.word}</h2>
          <span>{word.phonetic}</span>
        </div>
        <button type="button" aria-label="播放发音">
          <Volume2 size={18} />
        </button>
      </div>
      <div className="vocab-definition">
        <strong>{word.meaningCn}</strong>
        <p>{word.meaningEn}</p>
      </div>
      <blockquote>
        {word.example}
        <small>{word.exampleTranslation}</small>
      </blockquote>
      <div className="vocab-memory-box">
        <strong>AI 记忆法</strong>
        <span>{word.metadata.aiMemoryHint ?? "把单词放回场景例句里记忆，并在练习中主动回忆。"}</span>
      </div>
      <div className="vocab-tags">
        {word.scenarioTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
        {word.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  answer,
  setAnswer,
  submit,
  disabled
}: {
  question: PracticeQuestion;
  answer: string;
  setAnswer: (answer: string) => void;
  submit: (answer: string) => void;
  disabled: boolean;
}) {
  const typeLabel = question.questionType === "select_meaning" ? "看英文选中文" : question.questionType === "select_word" ? "看中文选英文" : "拼写输入";

  return (
    <section className="vocab-question-card">
      <span className="tiny-label">{typeLabel}</span>
      <h2>{question.prompt}</h2>
      {question.options ? (
        <div className="option-grid refined-options vocab-options">
          {question.options.map((option) => (
            <button key={option} type="button" onClick={() => submit(option)} disabled={disabled}>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="vocab-spelling-row">
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="输入英文单词" disabled={disabled} />
          <button type="button" onClick={() => answer.trim() && submit(answer)} disabled={disabled || !answer.trim()}>
            提交
          </button>
        </div>
      )}
    </section>
  );
}

function WrongWordItem({ record, words, onResolve }: { record: WrongWordRecord; words: Word[]; onResolve: () => void }) {
  const word = words.find((item) => item.id === record.itemId);
  if (!word) return null;
  return (
    <article className="vocab-wrong-item">
      <div>
        <strong>{word.word}</strong>
        <span>{word.meaningCn}</span>
      </div>
      <small>
        错 {record.wrongCount} 次 · {record.errorTypes.join(" / ")} · {formatDate(record.lastWrongAt)}
      </small>
      <button type="button" onClick={onResolve}>
        标记已解决
      </button>
    </article>
  );
}

function VocabularySetupSteps({ current }: { current: "goal" | "scenario" | "book" | "plan" }) {
  const steps = [
    { id: "goal", label: "目标" },
    { id: "scenario", label: "场景/素材" },
    { id: "book", label: "词库" },
    { id: "plan", label: "计划" }
  ] as const;
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <div className="vocab-setup-steps" aria-label="背单词初始化流程">
      {steps.map((step, index) => (
        <span className={index < currentIndex ? "done" : index === currentIndex ? "active" : ""} key={step.id}>
          <i>{index + 1}</i>
          {step.label}
        </span>
      ))}
    </div>
  );
}

function SetupSection({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children: ReactNode }) {
  return (
    <section className="vocab-setup-section">
      <div className="vocab-setup-title">
        <span>{icon}</span>
        <div>
          <strong>{title}</strong>
          <small>{desc}</small>
        </div>
      </div>
      {children}
    </section>
  );
}

function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="vocab-choice-pills">{children}</div>;
}

function MetricTile({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: "blue" | "violet" | "amber" | "green" }) {
  return (
    <div className={`vocab-metric ${tone}`}>
      <span>{label}</span>
      <strong>
        {value}
        <small>{suffix}</small>
      </strong>
    </div>
  );
}

function ProgressHeader({ label, current, total, progress }: { label: string; current: number; total: number; progress?: number }) {
  return (
    <div className="vocab-progress-head">
      <div>
        <span className="tiny-label">{label}</span>
        <strong>
          {current}/{Math.max(total, 1)}
        </strong>
      </div>
      <div className="vocab-progress-track">
        <i style={{ width: `${progress ?? Math.round((current / Math.max(total, 1)) * 100)}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return (
    <div className="vocab-empty">
      <Clock3 size={28} />
      <strong>{title}</strong>
      <p>{body}</p>
      <button type="button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function goalLabel(goal: VocabularyGoal) {
  const labels: Record<VocabularyGoal, string> = {
    cet4: "四级",
    cet6: "六级",
    postgraduate: "考研",
    ielts: "雅思",
    toefl: "托福",
    business: "商务英语",
    daily: "日常英语",
    reading: "阅读提升",
    course: "课程学习",
    custom: "自定义目标"
  };
  return labels[goal];
}
